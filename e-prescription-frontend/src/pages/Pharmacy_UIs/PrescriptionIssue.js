import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import CryptoJS from 'crypto-js';
import { FaUserMd, FaPrescriptionBottleAlt, FaFileMedical, FaExclamationCircle } from 'react-icons/fa';

// **SECURITY WARNING**: Use the SAME secure key as the doctor's side.
const SECRET_KEY = "your-super-secret-key-that-should-be-in-a-secure-place";

const decryptData = (encryptedData) => {
    if (!encryptedData) return null;
    try {
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
        if (!decryptedBytes) return null;
        const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedString) return null;
        // Handle cases where the data might not be a valid JSON string (e.g., a simple string)
        try {
            return JSON.parse(decryptedString);
        } catch (e) {
            return decryptedString;
        }
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
    const [pharmacistName, setPharmacistName] = useState(null);
    const [initialMedicinesStatus, setInitialMedicinesStatus] = useState({});

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
                    const decryptedNotes = decryptData(data.additionalNotes); // Decrypt the additional notes

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
                    
                    let doctorName = 'N/A';
                    if (data.doctorId) {
                        const doctorDocRef = doc(db, 'users', data.doctorId);
                        const doctorDocSnap = await getDoc(doctorDocRef);
                        if (doctorDocSnap.exists()) {
                            const doctorData = doctorDocSnap.data();
                            doctorName = `${doctorData.firstName} ${doctorData.lastName}`;
                        }
                    }
                    
                    setPrescription({
                        ...data,
                        doctorName,
                        nationalId: data.nationalId,
                        patientRelationship: data.patientRelationship,
                        additionalNotes: decryptedNotes // Set the decrypted notes
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

    if (loading) return <div className="loading-container">Loading...</div>;
    if (error) return (
        <div className="error-container">
            <div className="error-content">
                <FaExclamationCircle className="error-icon" />
                <span className="error-text">{error}</span>
            </div>
        </div>
    );

    return (
        <div className="page-container">
            <div className="main-content-card">
                <h1 className="main-title">
                    Prescription for: <span className="patient-name">{prescription?.patientName}</span>
                </h1>

                <div className="info-grid">
                    <div className="info-item">
                        <FaUserMd className="info-icon" />
                        <div>
                            <p className="info-label">Doctor</p>
                            <p className="info-value">{prescription?.doctorName || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <FaFileMedical className="info-icon" />
                        <div>
                            <p className="info-label">National ID (NIC)</p>
                            <p className="info-value">{prescription?.nationalId || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <FaUserMd className="info-icon" />
                        <div>
                            <p className="info-label">Patient Relationship</p>
                            <p className="info-value">{prescription?.patientRelationship || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="info-item full-width">
                        <FaFileMedical className="info-icon" />
                        <div>
                            <p className="info-label">Additional Notes</p>
                            <p className="info-value">{prescription?.additionalNotes || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div className="medicine-section">
                    <h3 className="section-title">
                        <FaPrescriptionBottleAlt className="title-icon" />
                        Medication List
                    </h3>
                    <div className="medicine-grid">
                        {medicines.map((med, index) => (
                            <div key={index} className="medicine-card">
                                <p className="medicine-name">{med.name}</p>
                                <p className="medicine-detail">Dosage: <span className="bold-detail">{med.dosage}</span></p>
                                <p className="medicine-detail">Frequency: <span className="bold-detail">{med.frequency}</span></p>
                                
                                <div className="status-options">
                                    <label className={`status-label ${initialMedicinesStatus[med.name] === 'Issued' ? 'disabled-label' : ''}`}>
                                        <input
                                            type="radio"
                                            name={`status-${index}`}
                                            value="Issued"
                                            checked={med.status === 'Issued'}
                                            onChange={() => handleMedicineStatusChange(index, 'Issued')}
                                            disabled={initialMedicinesStatus[med.name] === 'Issued'}
                                            className="radio-input"
                                        />
                                        <span className="status-text">Issued</span>
                                    </label>
                                    <label className={`status-label ${initialMedicinesStatus[med.name] === 'Issued' ? 'disabled-label' : ''}`}>
                                        <input
                                            type="radio"
                                            name={`status-${index}`}
                                            value="Not Issued"
                                            checked={med.status === 'Not Issued'}
                                            onChange={() => handleMedicineStatusChange(index, 'Not Issued')}
                                            disabled={initialMedicinesStatus[med.name] === 'Issued'}
                                            className="radio-input"
                                        />
                                        <span className="status-text">Not Issued</span>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="action-buttons-container">
                    <button
                        onClick={handleGoBack}
                        className="back-button"
                    >
                        &larr; Back to Dashboard
                    </button>
                    <div className="action-buttons-group">
                        <button
                            onClick={handleReject}
                            className="reject-button"
                            disabled={isSaving}
                        >
                            Reject
                        </button>
                        <button
                            onClick={handleFinalize}
                            className="finalize-button"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Finalizing...' : 'Finalize & Save'}
                        </button>
                    </div>
                </div>
            </div>
            <style>
                {`
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #d7f3d2;
                    margin: 0;
                    padding: 0;
                }
                .page-container {
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    padding: 40px 20px;
                }
                .main-content-card {
                    max-width: 900px;
                    width: 100%;
                    background-color: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
                    padding: 40px;
                }
                .main-title {
                    font-size: 2.25rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin-bottom: 1.5rem;
                    border-bottom: 2px solid #e5e7eb;
                    padding-bottom: 1rem;
                }
                .patient-name {
                    color: #10b981;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }
                .info-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    background-color: #f9fafb;
                    padding: 1rem;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                }
                .info-icon {
                    font-size: 1.5rem;
                    color: #6b7280;
                }
                .info-label {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #6b7280;
                    margin: 0;
                }
                .info-value {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin: 0;
                }
                .info-item.full-width {
                    grid-column: 1 / -1;
                }
                .medicine-section {
                    background-color: #f3f4f6;
                    padding: 30px;
                    border-radius: 10px;
                    border: 1px solid #e5e7eb;
                }
                .section-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #374151;
                    margin-bottom: 1.25rem;
                    display: flex;
                    align-items: center;
                }
                .title-icon {
                    margin-right: 0.5rem;
                    color: #10b981;
                }
                .medicine-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                }
                .medicine-card {
                    background-color: #ffffff;
                    padding: 1.5rem;
                    border-radius: 10px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    border: 1px solid #e5e7eb;
                }
                .medicine-name {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                }
                .medicine-detail {
                    font-size: 0.875rem;
                    color: #4b5563;
                    margin: 0 0 0.25rem;
                }
                .bold-detail {
                    font-weight: 600;
                }
                .status-options {
                    margin-top: 1rem;
                    display: flex;
                    gap: 1rem;
                }
                .status-label {
                    display: inline-flex;
                    align-items: center;
                    cursor: pointer;
                    color: #374151;
                    transition: color 0.2s;
                }
                .status-label:hover {
                    color: #10b981;
                }
                .disabled-label {
                    color: #d1d5db !important;
                    cursor: not-allowed !important;
                }
                .radio-input {
                    margin-right: 0.5rem;
                    accent-color: #10b981;
                }
                .action-buttons-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 2.5rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                .action-buttons-group {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }
                .back-button, .reject-button, .finalize-button {
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .back-button {
                    background-color: #e5e7eb;
                    color: #4b5563;
                }
                .back-button:hover {
                    background-color: #d1d5db;
                }
                .reject-button {
                    background-color: #ef4444;
                    color: #ffffff;
                }
                .reject-button:hover {
                    background-color: #dc2626;
                }
                .finalize-button {
                    background-color: #10b981;
                    color: #ffffff;
                }
                .finalize-button:hover {
                    background-color: #059669;
                }
                .finalize-button:disabled, .reject-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .loading-container, .error-container {
                    text-align: center;
                    margin-top: 5rem;
                }
                .error-container {
                    background-color: #fef2f2;
                    border: 1px solid #fca5a5;
                    color: #b91c1c;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    max-width: 600px;
                    margin-left: auto;
                    margin-right: auto;
                }
                .error-content {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                }
                .error-icon {
                    font-size: 1.25rem;
                }
                @media (max-width: 768px) {
                    .main-content-card {
                        padding: 20px;
                    }
                    .info-grid {
                        grid-template-columns: 1fr;
                    }
                    .info-item.full-width {
                        grid-column: auto;
                    }
                    .medicine-grid {
                        grid-template-columns: 1fr;
                    }
                    .action-buttons-container {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .action-buttons-group {
                        width: 100%;
                    }
                    .back-button, .reject-button, .finalize-button {
                        width: 100%;
                        text-align: center;
                    }
                }
                `}
            </style>
        </div>
    );
};

export default PrescriptionIssue;