import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { FaPlus, FaTrashAlt } from 'react-icons/fa';
import CryptoJS from 'crypto-js';
import logo from '../Main_Interface_UI/images/Logo01.png';
import { FaPhoneAlt } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import Footer from '../Main_Interface_UI/Footer';

// The key must be securely managed in a real application.
// It must be the SAME KEY as the one used for encryption.
const SECRET_KEY = "your-super-secret-key-that-should-be-in-a-secure-place";

// Helper function to decrypt data
const decryptData = (encryptedData) => {
    if (!encryptedData) return null;
    try {
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
        const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedString);
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
};

// Helper function to encrypt data
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

const PrescriptionView = () => {
    const { prescriptionId } = useParams();
    const navigate = useNavigate();
    const auth = getAuth();

    const [prescription, setPrescription] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // ===================== USE EFFECT FOR AUTH & DATA FETCHING =====================
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Fetch prescription data
                const prescriptionDocRef = doc(db, 'prescriptions', prescriptionId);
                try {
                    const docSnap = await getDoc(prescriptionDocRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.doctorId !== user.uid) {
                            setError("You do not have permission to view this prescription.");
                            setLoading(false);
                            return;
                        }

                        const decryptedDiagnosis = decryptData(data.diagnosis);
                        const decryptedMedications = decryptData(data.medications);
                        const decryptedAdditionalNotes = decryptData(data.additionalNotes);

                        setPrescription({
                            ...data,
                            diagnosis: decryptedDiagnosis,
                            medicines: decryptedMedications,
                            additionalNotes: decryptedAdditionalNotes,
                            // Use prescriptionDate from the database for display
                            prescriptionDate: data.prescriptionDate // Ensure this is passed
                        });

                        // Ensure each medicine has a 'duration' property, initialize if missing
                        setMedicines(decryptedMedications?.map(med => ({ ...med, duration: med.duration || '' })) || []);

                    } else {
                        setError("Prescription not found.");
                    }
                } catch (err) {
                    console.error("Error fetching prescription:", err);
                    setError("Failed to fetch prescription. Please try again.");
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
                setError("Please log in to view prescriptions.");
                // Optionally redirect to login page
                // navigate('/signin');
            }
        });
        return () => unsubscribe();
    }, [prescriptionId, auth]);

    const handleMedicineChange = (index, field, value) => {
        const updatedMedicines = [...medicines];
        updatedMedicines[index][field] = value;
        setMedicines(updatedMedicines);
    };

    const handleAddMedicine = () => {
        setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }]);
    };

    const handleRemoveMedicine = (index) => {
        const updatedMedicines = medicines.filter((_, i) => i !== index);
        setMedicines(updatedMedicines);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const docRef = doc(db, 'prescriptions', prescriptionId);

        const encryptedMedications = encryptData(medicines);

        try {
            await updateDoc(docRef, {
                medications: encryptedMedications,
                updatedAt: new Date(),
            });
            alert("Prescription updated successfully!");
        } catch (err) {
            console.error("Error updating prescription:", err);
            alert("Failed to save changes. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // Handler for the back button
    const handleBackClick = () => {
        navigate('/prescriptionhistory');
    };

    // ===================== CONSOLIDATED STYLES =====================
    const styles = {
        navBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', backgroundColor: '#d7f3d2' },
        logoContainer: { display: 'flex', alignItems: 'center' },
        logo: { height: '50px', marginRight: '10px' },
        titleContainer: { display: 'flex', flexDirection: 'column' },
        title: { margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#333' },
        subtitle: { margin: 0, fontSize: '12px', color: '#777' },
        contactInfo: { display: 'flex', alignItems: 'center', marginRight: '20px', color: '#007bff' },
        homeButtonDiv: { padding: '10px 20px', border: '1px solid #ddd', borderRadius: '20px', backgroundColor: 'lightblue', color: '#007bff', cursor: 'pointer', display: 'flex', alignItems: 'center' },
        formContainer: { fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '40px auto', padding: '30px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', backgroundColor: '#fff', flexGrow: 1 },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: '1px solid #eee' },
        section: { marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' },
        medicineTable: {
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '20px',
        },
        tableHeader: {
            backgroundColor: '#f2f2f2',
            borderBottom: '1px solid #ddd',
            padding: '10px',
            textAlign: 'left',
            color: '#333',
        },
        tableRow: {
            borderBottom: '1px solid #eee',
        },
        tableCell: {
            padding: '10px',
            verticalAlign: 'middle',
        },
        medicineInput: {
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxSizing: 'border-box',
        },
        medicineSelect: {
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxSizing: 'border-box',
            backgroundColor: '#fff',
            cursor: 'pointer',
        },
        removeBtn: { backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
        addBtn: { backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', padding: '10px 20px', cursor: 'pointer', fontSize: '1em', display: 'flex', alignItems: 'center', gap: '8px' },
        saveBtn: { width: '100%', padding: '15px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1em', marginTop: '20px' },
        buttonContainer: { textAlign: 'right', marginTop: '10px' },
        infoText: { fontSize: '1em', color: '#777' },
        errorText: { color: 'red', textAlign: 'center' },
        loadingText: { color: '#007bff', textAlign: 'center' },
        footer: { backgroundColor: '#d7f3d2', padding: '20px', marginTop: '20px' },
        footerContainer: { display: 'flex', justifyContent: 'space-around', paddingBottom: '20px' },
        footerSection: { display: 'flex', flexDirection: 'column' },
        footerHeading: { fontSize: '1.2em', marginBottom: '10px', color: '#333' },
        list: { listStyle: 'none', padding: 0, margin: 0 },
        listItem: { marginBottom: '10px', color: '#555' },
        followUs: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
        socialIcon: { display: 'flex' },
        iconLink: { marginRight: '10px', textDecoration: 'none', color: '#333' },
        bottomBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #ccc' },
        copyright: { fontSize: '0.8em', color: '#777' },
        links: { display: 'flex' },
        bottomLink: { color: '#555', textDecoration: 'none', fontSize: '0.8em', marginRight: '10px' },
        separator: { color: '#ccc', marginRight: '10px' },
        backButton: {
            backgroundColor: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '1em',
            marginRight: '20px',
            alignSelf: 'flex-start',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            marginBottom: '20px',
        },
        mainContentWrapper: {
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: '20px',
        },
        dashboardContainer: {
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
        },
    };
    // =========================================================================

    if (loading) {
        return <div style={styles.loadingText}>Loading prescription...</div>;
    }

    if (error) {
        return <div style={styles.errorText}>{error}</div>;
    }

    return (
        <div style={{ fontFamily: 'sans-serif' }}>
            {/* Navigation Bar */}
            <header style={styles.navBar}>
                <div style={styles.logoContainer}>
                    <img src={logo} alt="E-Prescribe Logo" style={styles.logo} />
                    <div style={styles.titleContainer}>
                        <h1 style={styles.title}>MediPrescribe</h1>
                        <p style={styles.subtitle}>Your Digital Healthcare Solution</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={styles.contactInfo}>
                        <FaPhoneAlt style={{ marginRight: '5px' }} />
                        <span>+94 (011) 519-51919</span>
                    </div>
                    <Link to="/signin" style={{ textDecoration: 'none' }}>
                        <div style={styles.homeButtonDiv}>
                            <span>Logout</span>
                            <IoIosArrowForward style={{ marginLeft: '5px' }} />
                        </div>
                    </Link>
                </div>
            </header>

            {/* Dashboard Content */}
            <div style={styles.dashboardContainer}>
                {/* Main Content (Prescription View) */}
                <div style={styles.mainContentWrapper}>
                    <button onClick={handleBackClick} style={styles.backButton}>
                        <IoIosArrowForward style={{ transform: 'rotate(180deg)' }} />
                        Back to Prescriptions
                    </button>
                    <div style={styles.formContainer}>
                        <h1 style={styles.header}>Prescription Details</h1>
                        <div style={styles.section}>
                            <h3 style={{ color: '#007bff' }}>Patient Information</h3>
                            <p style={styles.infoText}><strong>Patient Name:</strong> {prescription?.patientName}</p>
                            <p style={styles.infoText}><strong>Diagnosis:</strong> {prescription?.diagnosis}</p>
                            <p style={styles.infoText}>
                                <strong>Created On:</strong>{' '}
                                {/* Changed from prescription?.createdAt to prescription?.prescriptionDate */}
                                {prescription?.prescriptionDate?.toDate ? new Date(prescription.prescriptionDate.toDate()).toLocaleDateString() : 'N/A'}
                            </p>
                            <p style={styles.infoText}><strong>Prescription ID:</strong> {prescriptionId}</p>
                        </div>

                        <div style={styles.section}>
                            <h3 style={{ color: '#28a745' }}>Medicines</h3>
                            <form onSubmit={handleSave}>
                                <table style={styles.medicineTable}>
                                    <thead>
                                        <tr>
                                            <th style={styles.tableHeader}>Medicine Name</th>
                                            <th style={styles.tableHeader}>Dosage</th>
                                            <th style={styles.tableHeader}>Frequency</th>
                                            <th style={styles.tableHeader}>Duration</th>
                                            <th style={styles.tableHeader}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {medicines.map((med, index) => (
                                            <tr key={index} style={styles.tableRow}>
                                                <td style={styles.tableCell}>
                                                    <input
                                                        style={styles.medicineInput}
                                                        type="text"
                                                        placeholder="Medicine Name"
                                                        value={med.name}
                                                        onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                                                        required
                                                    />
                                                </td>
                                                <td style={styles.tableCell}>
                                                    <input
                                                        style={styles.medicineInput}
                                                        type="text"
                                                        placeholder="Dosage (e.g., 500mg)"
                                                        value={med.dosage}
                                                        onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                                                        required
                                                    />
                                                </td>
                                                <td style={styles.tableCell}>
                                                    <select
                                                        style={styles.medicineSelect}
                                                        value={med.frequency}
                                                        onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select Frequency</option>
                                                        <option value="Once Daily">Once Daily</option>
                                                        <option value="Twice Daily">Twice Daily</option>
                                                        <option value="Thrice Daily">Thrice Daily</option>
                                                        <option value="Every 4 Hours">Every 4 Hours</option>
                                                        <option value="As Needed">As Needed</option>
                                                        {/* Add more frequency options as needed */}
                                                    </select>
                                                </td>
                                                <td style={styles.tableCell}>
                                                    <input
                                                        style={styles.medicineInput}
                                                        type="text"
                                                        placeholder="Duration (e.g., 7 days)"
                                                        value={med.duration}
                                                        onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                                                    />
                                                </td>
                                                <td style={styles.tableCell}>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveMedicine(index)}
                                                        style={styles.removeBtn}
                                                    >
                                                        <FaTrashAlt />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div style={styles.buttonContainer}>
                                    <button type="button" onClick={handleAddMedicine} style={styles.addBtn}>
                                        <FaPlus /> Add Medicine
                                    </button>
                                </div>
                                <button type="submit" style={styles.saveBtn} disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default PrescriptionView;