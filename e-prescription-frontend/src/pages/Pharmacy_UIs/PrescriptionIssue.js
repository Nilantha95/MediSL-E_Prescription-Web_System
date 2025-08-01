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

    // This effect handles authentication state and fetching pharmacist's name
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Point to the 'users' collection instead of 'pharmacists'
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    // Check if user is a pharmacist before setting the name
                    if (userData.userType === 'pharmacist') {
                        // Combine firstName and lastName
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
        // Only proceed if both an ID and a pharmacist name are available
        if (!prescriptionId || !pharmacistName) {
            // We'll wait until the first useEffect has populated the pharmacistName.
            return;
        }

        const fetchPrescription = async () => {
            setLoading(true); // Set loading to true before fetching
            setError(null); // Clear previous errors
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
                        status: med.status || 'Pending'
                    }));
                    
                    setPrescription({ ...data });
                    setMedicines(initialMedicines);
                } else {
                    setError("Prescription not found.");
                }
            } catch (err) {
                console.error("Error fetching prescription:", err);
                setError("Failed to fetch prescription. This may be due to an invalid QR code or a fulfilled prescription.");
            } finally {
                setLoading(false); // Set loading to false when done, regardless of success or failure
            }
        };
        
        fetchPrescription();
        
    }, [prescriptionId, pharmacistName]); // Dependency array now includes pharmacistName

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
        
        const allIssued = medicines.every(med => med.status === 'Issued');
        const anyIssued = medicines.some(med => med.status === 'Issued');
        
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
            medicinesIssued: medicines.filter(med => med.status === 'Issued').map(med => med.name)
        };
        
        const updatedIssueHistory = data.issueHistory ? [...data.issueHistory, newIssueRecord] : [newIssueRecord];

        const updatedPrescription = {
            medications: encryptData(medicines),
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

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
    if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>{error}</div>;

    return (
        <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <h1 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Prescription for: {prescription?.patientName}</h1>
                <p><strong>Diagnosis:</strong> {prescription?.diagnosis || 'N/A'}</p>
                <p><strong>Doctor:</strong> {prescription?.doctorName || 'N/A'}</p>
                <p><strong>Status:</strong> {prescription?.status || 'N/A'}</p>

                <h3 style={{ marginTop: '30px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Medicines</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    {medicines.map((med, index) => (
                        <div key={index} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                            <p><strong>Name:</strong> {med.name}</p>
                            <p><strong>Dosage:</strong> {med.dosage}</p>
                            <p><strong>Frequency:</strong> {med.frequency}</p>
                            <div>
                                <label style={{ marginRight: '10px' }}>
                                    <input
                                        type="radio"
                                        name={`status-${index}`}
                                        value="Issued"
                                        checked={med.status === 'Issued'}
                                        onChange={() => handleMedicineStatusChange(index, 'Issued')}
                                    /> Issued
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name={`status-${index}`}
                                        value="Not Issued"
                                        checked={med.status === 'Not Issued'}
                                        onChange={() => handleMedicineStatusChange(index, 'Not Issued')}
                                    /> Not Issued
                                </label>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px', gap: '10px' }}>
                    <button
                        onClick={handleReject}
                        style={{ padding: '10px 20px', fontSize: '1em', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                        disabled={isSaving}
                    >
                        Reject Prescription
                    </button>
                    <button
                        onClick={handleFinalize}
                        style={{ padding: '10px 20px', fontSize: '1em', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Finalizing...' : 'Finalize & Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrescriptionIssue;