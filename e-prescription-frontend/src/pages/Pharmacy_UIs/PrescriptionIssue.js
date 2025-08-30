import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import CryptoJS from 'crypto-js';

// **SECURITY WARNING**: Use the SAME secure key as the doctor's side.
const SECRET_KEY = "your-super-secret-key-that-should-be-in-a-secure-place";

// Helper functions for decryption and encryption
const decryptData = (encryptedData) => {
    if (!encryptedData) return null;
    try {
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
        if (!decryptedBytes) return null;
        const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedString) return null;
        return JSON.parse(decryptedString);
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
};

const encryptData = (data) => {
    if (!data) return null;
    try {
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
        return encrypted;
    } catch (error) {
        console.error("Encryption failed:", error);
        return null;
    }
};

const PrescriptionIssue = () => {
    const { prescriptionId } = useParams();
    const navigate = useNavigate();
    const auth = getAuth();

    const [prescription, setPrescription] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // State to hold the logged-in pharmacist's name
    const [pharmacistName, setPharmacistName] = useState(null);

    // New state to store the initial, unchanged statuses from the database
    const [initialMedicinesStatus, setInitialMedicinesStatus] = useState({});

    // This effect handles authentication state and fetching pharmacist's name
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    if (userData.userType === 'pharmacist') {
                        const fullName = `${userData.firstName} ${userData.lastName}`;
                        setPharmacistName(fullName);
                    } else {
                        setError("Unauthorized. Not a pharmacist account.");
                        setLoading(false);
                    }
                } else {
                    setError("Pharmacist profile not found in 'users' collection.");
                    setLoading(false);
                }
            } else {
                setPharmacistName(null);
                setError("You must be logged in to view this prescription.");
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [auth]);

    // This effect handles fetching the prescription and runs only when
    // both the prescriptionId and the pharmacistName are available.
    useEffect(() => {
        if (!prescriptionId || !pharmacistName) {
            return;
        }

        const fetchPrescription = async () => {
            setLoading(true);
            setError(null);
            const docRef = doc(db, 'prescriptions', prescriptionId);
            
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();

                    if (data.status === 'Issued') {
                        setError("This QR code is expired. The prescription has already been fully issued.");
                        setLoading(false);
                        return;
                    }
                    if (data.status === 'Rejected') {
                        setError("This prescription has been rejected and cannot be fulfilled.");
                        setLoading(false);
                        return;
                    }
                    
                    const decryptedMedications = decryptData(data.medications);
                    if (!decryptedMedications) {
                        setError("Failed to decrypt prescription data. This is likely due to a SECRET_KEY mismatch or corrupt data.");
                        setLoading(false);
                        return;
                    }
                    
                    const initialMedicines = decryptedMedications.map(med => ({
                        ...med,
                        status: med.status || 'Not Issued'
                    }));

                    const statusMap = initialMedicines.reduce((acc, med) => {
                        acc[med.name] = med.status;
                        return acc;
                    }, {});
                    setInitialMedicinesStatus(statusMap);
                    
                    // NEW: Fetch doctor's name using doctorId from the prescription
                    let doctorName = 'N/A';
                    if (data.doctorId) {
                        const doctorDocRef = doc(db, 'users', data.doctorId);
                        const doctorDocSnap = await getDoc(doctorDocRef);
                        if (doctorDocSnap.exists()) {
                            const doctorData = doctorDocSnap.data();
                            doctorName = `${doctorData.firstName} ${doctorData.lastName}`;
                        }
                    }
                    
                    // NEW: Get National ID and Patient Relationship
                    setPrescription({
                        ...data,
                        doctorName,
                        nationalId: data.nationalId, // Get National ID from the document
                        patientRelationship: data.patientRelationship // Get Patient Relationship from the document
                    });

                    setMedicines(initialMedicines);
                } else {
                    setError("Prescription not found.");
                }
            } catch (err) {
                console.error("Error fetching prescription:", err);
                setError("Failed to fetch prescription. This may be due to an invalid QR code or a fulfilled prescription.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchPrescription();
        
    }, [prescriptionId, pharmacistName]);

    const handleMedicineStatusChange = (index, newStatus) => {
        const updatedMedicines = [...medicines];
        updatedMedicines[index].status = newStatus;
        setMedicines(updatedMedicines);
    };

    const handleFinalize = async () => {
        setIsSaving(true);
        if (!pharmacistName) {
            setError("Pharmacist data not loaded. Please try refreshing the page.");
            setIsSaving(false);
            return;
        }

        const docRef = doc(db, 'prescriptions', prescriptionId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            setIsSaving(false);
            setError("Prescription not found during finalization.");
            return;
        }

        const data = docSnap.data();
        const existingMedications = decryptData(data.medications);

        const existingMedMap = existingMedications.reduce((acc, med) => {
            acc[med.name] = med.status;
            return acc;
        }, {});

        const newlyIssuedMedicines = medicines.filter(med => 
            med.status === 'Issued' && existingMedMap[med.name] !== 'Issued'
        ).map(med => med.name);

        const updatedMedicationList = medicines.map(med => {
            return {
                ...med,
                status: existingMedMap[med.name] === 'Issued' ? 'Issued' : med.status
            };
        });

        const allIssued = updatedMedicationList.every(med => med.status === 'Issued');
        const anyIssued = updatedMedicationList.some(med => med.status === 'Issued');
        
        let finalStatus;
        if (allIssued) {
            finalStatus = 'Issued';
        } else if (anyIssued) {
            finalStatus = 'partially_issued';
        } else {
            finalStatus = 'active';
        }

        const newIssueRecord = {
            issuedBy: pharmacistName,
            issuedAt: new Date(),
            medicinesIssued: newlyIssuedMedicines
        };
        
        const updatedIssueHistory = data.issueHistory ? [...data.issueHistory, newIssueRecord] : [newIssueRecord];

        const updatedPrescription = {
            medications: encryptData(updatedMedicationList),
            status: finalStatus,
            issueHistory: updatedIssueHistory,
        };

        try {
            await updateDoc(docRef, updatedPrescription);
            alert("Prescription finalized successfully!");
            navigate('/pharmacy/dashboard');
        } catch (err) {
            console.error("Error finalizing prescription:", err);
            alert("Failed to finalize prescription. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleReject = async () => {
        setIsSaving(true);
        if (!pharmacistName) {
            setError("Pharmacist data not loaded. Please try refreshing the page.");
            setIsSaving(false);
            return;
        }

        const docRef = doc(db, 'prescriptions', prescriptionId);
        
        const rejectReason = prompt("Please provide a reason for rejecting this prescription:");
        if (!rejectReason) {
            setIsSaving(false);
            return;
        }

        try {
            await updateDoc(docRef, {
                status: 'Rejected',
                rejectionReason: rejectReason,
                rejectedBy: pharmacistName,
                rejectedAt: new Date()
            });
            alert("Prescription rejected successfully!");
            navigate('/pharmacy/dashboard');
        } catch (err) {
            console.error("Error rejecting prescription:", err);
            alert("Failed to reject prescription. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleGoBack = () => {
        navigate('/pharmacy/dashboard');
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
    if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>{error}</div>;

    return (
        <div style={{ fontFamily: 'sans-serif', padding: '20px', background: '#d7f3d2', minHeight: '100vh' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
                <h1 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px', color: '#1a202c' }}>
                    Prescription for: {prescription?.patientName}
                </h1>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <p style={{ margin: 0 }}><strong>Diagnosis:</strong> {prescription?.diagnosis || 'N/A'}</p>
                    <p style={{ margin: 0 }}><strong>Doctor:</strong> {prescription?.doctorName || 'N/A'}</p>
                    <p style={{ margin: 0 }}><strong>Status:</strong> {prescription?.status || 'N/A'}</p>
                    <p style={{ margin: 0 }}><strong>National ID (NIC):</strong> {prescription?.nationalId || 'N/A'}</p>
                    <p style={{ margin: 0 }}><strong>Patient Relationship:</strong> {prescription?.patientRelationship || 'N/A'}</p>
                </div>

                <h3 style={{ marginTop: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', color: '#2d3748' }}>Medicines</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    {medicines.map((med, index) => (
                        <div key={index} style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '10px', backgroundColor: '#f9fafb' }}>
                            <p style={{ margin: '0 0 10px', fontWeight: 'bold' }}>{med.name}</p>
                            <p style={{ margin: '0 0 5px', fontSize: '0.9em' }}>Dosage: {med.dosage}</p>
                            <p style={{ margin: '0 0 15px', fontSize: '0.9em' }}>Frequency: {med.frequency}</p>
                            <div>
                                <label style={{ marginRight: '15px', cursor: initialMedicinesStatus[med.name] === 'Issued' ? 'not-allowed' : 'pointer' }}>
                                    <input
                                        type="radio"
                                        name={`status-${index}`}
                                        value="Issued"
                                        checked={med.status === 'Issued'}
                                        onChange={() => handleMedicineStatusChange(index, 'Issued')}
                                        disabled={initialMedicinesStatus[med.name] === 'Issued'}
                                    /> Issued
                                </label>
                                <label style={{ cursor: initialMedicinesStatus[med.name] === 'Issued' ? 'not-allowed' : 'pointer' }}>
                                    <input
                                        type="radio"
                                        name={`status-${index}`}
                                        value="Not Issued"
                                        checked={med.status === 'Not Issued'}
                                        onChange={() => handleMedicineStatusChange(index, 'Not Issued')}
                                        disabled={initialMedicinesStatus[med.name] === 'Issued'}
                                    /> Not Issued
                                </label>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', gap: '10px' }}>
                    <button
                        onClick={handleGoBack}
                        style={{ padding: '12px 24px', fontSize: '1em', color: '#4a5568', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background-color 0.3s' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#cbd5e0'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                    >
                        &larr; Back to Dashboard
                    </button>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={handleReject}
                            style={{ padding: '12px 24px', fontSize: '1em', backgroundColor: '#e53e3e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background-color 0.3s' }}
                            disabled={isSaving}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#c53030'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#e53e3e'}
                        >
                            Reject Prescription
                        </button>
                        <button
                            onClick={handleFinalize}
                            style={{ padding: '12px 24px', fontSize: '1em', backgroundColor: '#38a169', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background-color 0.3s' }}
                            disabled={isSaving}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#2f855a'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#38a169'}
                        >
                            {isSaving ? 'Finalizing...' : 'Finalize & Save'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrescriptionIssue;