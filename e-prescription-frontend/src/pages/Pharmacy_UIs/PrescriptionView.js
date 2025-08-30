// used AI tools to code enhacements and designing parts.

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import CryptoJS from 'crypto-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUser, faUserMd, faPills, faHistory, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';


const SECRET_KEY = "your-super-secret-key-that-should-be-in-a-secure-place";

// Helper function for decryption
const decryptData = (encryptedData) => {
    if (!encryptedData) return null;
    try {
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
        if (!decryptedBytes) return null;
        const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedString) return null;
        return JSON.parse(decryptedString);
    } catch (error) {
        console.error("Decryption error:", error);
        return null;
    }
};

const PrescriptionView = () => {
    const { prescriptionId } = useParams();
    const navigate = useNavigate();

    const [prescription, setPrescription] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const fetchPrescriptionAndDoctor = async () => {
            if (!prescriptionId) {
                setError("No prescription ID found in the URL.");
                setLoading(false);
                return;
            }
            try {
                // Step 1: Fetch the main prescription document
                const prescriptionDocRef = doc(db, 'prescriptions', prescriptionId);
                const prescriptionDocSnap = await getDoc(prescriptionDocRef);

                if (prescriptionDocSnap.exists()) {
                    const prescriptionData = prescriptionDocSnap.data();

                    
                    const decryptedMedications = decryptData(prescriptionData.medications);
                    if (!decryptedMedications) {
                        setError("Failed to decrypt prescription data.");
                        setLoading(false);
                        return;
                    }
                    setMedicines(decryptedMedications);

                    
                    let doctorName = 'N/A';
                    if (prescriptionData.doctorId) {
                        const doctorDocRef = doc(db, 'users', prescriptionData.doctorId);
                        const doctorDocSnap = await getDoc(doctorDocRef);
                        if (doctorDocSnap.exists()) {
                            const doctorData = doctorDocSnap.data();
                            // Combine first and last name for the full name
                            doctorName = `${doctorData.firstName} ${doctorData.lastName}`;
                        }
                    }
                    
                    
                    setPrescription({ ...prescriptionData, doctorName: doctorName });

                } else {
                    setError("Prescription not found.");
                }
            } catch (err) {
                console.error("Error fetching details:", err);
                setError("Failed to fetch prescription details. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchPrescriptionAndDoctor();
    }, [prescriptionId]);


    
    const styles = {
        pageContainer: {
            backgroundColor: '#d7f3d2',
            minHeight: '100vh',
            padding: '40px 20px',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        },
        mainCard: {
            maxWidth: '900px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.08)'
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #e9ecef',
            paddingBottom: '20px',
            marginBottom: '20px'
        },
        headerTitle: {
            color: '#0d5d51',
            margin: 0,
            fontSize: '28px'
        },
        backButton: {
            display: 'flex',
            alignItems: 'center',
            padding: '10px 20px',
            backgroundColor: isHovered ? '#0d5d51' : '#107c6b',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'background-color 0.3s ease'
        },
        section: {
            marginBottom: '30px'
        },
        sectionHeader: {
            display: 'flex',
            alignItems: 'center',
            color: '#343a40',
            fontSize: '22px',
            marginBottom: '15px'
        },
        icon: {
            marginRight: '12px',
            color: '#107c6b'
        },
        infoGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
        },
        infoBox: {
            backgroundColor: '#f8f9fa',
            padding: '15px',
            borderRadius: '8px'
        },
        infoLabel: {
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            color: '#6c757d',
            marginBottom: '5px'
        },
        infoValue: {
            fontSize: '18px',
            color: '#212529',
            fontWeight: '600'
        },
        medicineGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
        },
        medicineCard: {
            border: '1px solid #dee2e6',
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: '#fff',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
        },
        medicineName: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#0d5d51',
            marginBottom: '15px'
        },
        medicineDetail: {
            margin: '8px 0',
            color: '#495057'
        },
        historyList: {
            listStyle: 'none',
            padding: 0
        },
        historyItem: {
            backgroundColor: '#f8f9fa',
            marginBottom: '15px',
            padding: '15px',
            borderLeft: '4px solid #107c6b',
            borderRadius: '5px'
        },
        statusBadge: (status) => ({
            padding: '5px 12px',
            borderRadius: '15px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#fff',
            backgroundColor: status.toLowerCase().includes('issued') ? '#28a745' : '#ffc107',
            display: 'inline-block'
        }),
        errorContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '80vh',
            color: '#dc3545'
        },
        loadingContainer: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '80vh',
            color: '#107c6b'
        }
    };


    if (loading) return (
        <div style={styles.loadingContainer}>
            <p style={{fontSize: '20px'}}>Loading prescription details...</p>
        </div>
    );

    if (error) return (
        <div style={styles.errorContainer}>
            <FontAwesomeIcon icon={faExclamationCircle} style={{ fontSize: '48px', marginBottom: '20px' }} />
            <p style={{fontSize: '20px'}}>{error}</p>
        </div>
    );

    return (
        <div style={styles.pageContainer}>
            <div style={styles.mainCard}>
                <header style={styles.header}>
                    <h1 style={styles.headerTitle}>Prescription Details</h1>
                     <button
                        onClick={() => navigate(-1)} // Navigates to the previous page
                        style={styles.backButton}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '8px' }} />
                        Back
                    </button>
                </header>

                {/* --- Patient & Doctor Info --- */}
                <section style={styles.section}>
                    <div style={styles.infoGrid}>
                        <div style={styles.infoBox}>
                            <p style={styles.infoLabel}><FontAwesomeIcon icon={faUser} style={{marginRight: '8px'}} /> Patient Name</p>
                            <p style={styles.infoValue}>{prescription?.patientName}</p>
                        </div>
                        <div style={styles.infoBox}>
                            <p style={styles.infoLabel}><FontAwesomeIcon icon={faUserMd} style={{marginRight: '8px'}} /> Prescribing Doctor</p>
                            <p style={styles.infoValue}>{prescription?.doctorName}</p>
                        </div>
                    </div>
                </section>

                {/* --- Medicines --- */}
                <section style={styles.section}>
                    <h2 style={styles.sectionHeader}><FontAwesomeIcon icon={faPills} style={styles.icon} />Medications</h2>
                    <div style={styles.medicineGrid}>
                        {medicines.map((med, index) => (
                            <div key={index} style={styles.medicineCard}>
                                <h4 style={styles.medicineName}>{med.name}</h4>
                                <p style={styles.medicineDetail}><strong>Dosage:</strong> {med.dosage}</p>
                                <p style={styles.medicineDetail}><strong>Frequency:</strong> {med.frequency}</p>
                                <p style={styles.medicineDetail}>
                                    <strong>Status:</strong> <span style={styles.statusBadge(med.status || 'Not Issued')}>{med.status || 'Not Issued'}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- Issuance History --- */}
                <section>
                     <h2 style={styles.sectionHeader}><FontAwesomeIcon icon={faHistory} style={styles.icon} />Issuance History</h2>
                    {prescription?.issueHistory && prescription.issueHistory.length > 0 ? (
                        <ul style={styles.historyList}>
                            {prescription.issueHistory.map((entry, index) => (
                                <li key={index} style={styles.historyItem}>
                                    <p><strong>Issued By:</strong> {entry.issuedBy}</p>
                                    <p><strong>Issued On:</strong> {new Date(entry.issuedAt.seconds * 1000).toLocaleString()}</p>
                                    <p><strong>Medicines Issued:</strong> {entry.medicinesIssued.join(', ') || 'N/A'}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No issuance history found for this prescription.</p>
                    )}
                </section>
            </div>
        </div>
    );
};

export default PrescriptionView;