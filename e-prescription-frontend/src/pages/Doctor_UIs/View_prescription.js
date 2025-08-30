// Enhanced the code from the useing AI tools.

import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../../firebase';
import { FaPlus, FaTrashAlt } from 'react-icons/fa';
import CryptoJS from 'crypto-js';

// Import shared UI components and images
import logo from '../Main_Interface_UI/images/Logo01.png';
import { FaPhoneAlt } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import { FaUserMd, FaPrescriptionBottleAlt, FaHistory, FaHome } from 'react-icons/fa'; // Import icons for sidebar
import pic from '../Main_Interface_UI/images/Doctor.png'; // Assuming a default doctor image
import Footer from '../Main_Interface_UI/Footer';

//Encryption Method Key
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

    // Doctor data for sidebar
    const [doctorData, setDoctorData] = useState({
        firstName: 'Loading...',
        lastName: '',
        userType: '',
        photoURL: null,
    });
    // Add isLogoutHovered state here, same as in doc_profile.js
    const [isLogoutHovered, setIsLogoutHovered] = useState(false);

    // Responsive Styles State
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Responsive style utility function (copied from DoctorDashboard)
    const getResponsiveStyle = (desktopStyle, tabletStyle, mobileStyle, smallMobileStyle) => {
        if (screenWidth <= 575) {
            return smallMobileStyle;
        } else if (screenWidth <= 768) {
            return mobileStyle;
        } else if (screenWidth <= 992) {
            return tabletStyle;
        }
        return desktopStyle;
    };

    // Fetch doctor data and prescription data
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Fetch doctor data for sidebar
                const userDocRef = doc(db, 'users', user.uid);
                try {
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        setDoctorData({
                            firstName: userData.firstName || 'Dr. Unknown',
                            lastName: userData.lastName || '',
                            userType: userData.userType || 'Doctor',
                            photoURL: userData.photoURL || pic,
                        });
                    } else {
                        console.log("No user document found!");
                        setDoctorData(prev => ({ ...prev, firstName: "Dr. Not Found", photoURL: pic }));
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setDoctorData(prev => ({ ...prev, firstName: "Error", photoURL: pic }));
                }

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
                            prescriptionDate: data.prescriptionDate
                        });
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
                // navigate('/signin'); // Uncomment to redirect to login
            }
        });
        return () => unsubscribe();
    }, [prescriptionId, auth]);

    const getInitials = (firstName, lastName) => {
        const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
        const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
        return `${firstInitial}${lastInitial}`;
    };

    const handleMedicineChange = (index, field, value) => {
        const updatedMedicines = [...medicines];
        updatedMedicines[index][field] = value;
        setMedicines(updatedMedicines);
    };

    const handleAddMedicine = () => {
        setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '', status: 'Not Issued' }]);
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

    const handleBackClick = () => {
        navigate('/prescriptionhistory');
    };

    // Consolidated Styles - ENSURE these are exactly as in doc_profile.js for the header section
    const styles = {
        // --- Header Styles ---
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: getResponsiveStyle('20px 50px', '15px 40px', '12px 20px', '10px 15px'),
            backgroundColor: '#e0ffe0', // This is the key color
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            flexWrap: 'wrap',
            flexDirection: getResponsiveStyle('row', 'row', 'column', 'column'),
            alignItems: getResponsiveStyle('center', 'center', 'flex-start', 'center'),
            gap: getResponsiveStyle('0px', '0px', '10px', '10px'),
        },
        headerLeft: {
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            flexDirection: getResponsiveStyle('row', 'row', 'row', 'column'),
            textAlign: getResponsiveStyle('left', 'left', 'left', 'center'),
            marginBottom: getResponsiveStyle('0', '0', '0', '0px'),
        },
        logo: {
            height: getResponsiveStyle('55px', '55px', '50px', '45px'),
            marginRight: getResponsiveStyle('15px', '15px', '15px', '0'),
            marginBottom: getResponsiveStyle('0', '0', '0', '5px'),
        },
        siteTitle: {
            margin: 0,
            fontSize: getResponsiveStyle('24px', '24px', '22px', '20px'),
            fontWeight: '700',
            color: '#2c3e50',
            whiteSpace: getResponsiveStyle('nowrap', 'nowrap', 'nowrap', 'normal'),
        },
        tagline: {
            margin: 0,
            fontSize: getResponsiveStyle('13px', '13px', '12px', '11px'),
            color: '#7f8c8d',
            whiteSpace: getResponsiveStyle('nowrap', 'nowrap', 'nowrap', 'normal'),
        },
        headerRight: {
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: getResponsiveStyle('flex-end', 'flex-end', 'center', 'center'),
            marginTop: getResponsiveStyle('0', '0', '10px', '10px'),
            width: getResponsiveStyle('auto', 'auto', '100%', '100%'),
            flexDirection: getResponsiveStyle('row', 'row', 'row', 'column'),
            gap: getResponsiveStyle('0px', '0px', '10px', '10px'),
        },
        phoneContact: {
            display: 'flex',
            alignItems: 'center',
            marginRight: getResponsiveStyle('25px', '25px', '15px', '0'),
            marginBottom: getResponsiveStyle('0', '0', '0', '5px'),
            color: '#2980b9',
            fontWeight: '500',
            fontSize: getResponsiveStyle('15px', '15px', '14px', '13px'),
            whiteSpace: 'nowrap',
        },
        phoneIcon: {
            marginRight: '8px',
            fontSize: '18px',
        },
        logoutButtonLink: {
            textDecoration: 'none',
            flexShrink: 0,
            width: getResponsiveStyle('auto', 'auto', 'auto', '100%'),
            textAlign: 'center',
        },
        logoutButton: {
            padding: getResponsiveStyle('12px 25px', '12px 25px', '10px 20px', '8px 18px'),
            // Use isLogoutHovered state for dynamic styling
            border: isLogoutHovered ? '1px solid #9cd6fc' : '1px solid #a8dadc',
            borderRadius: '30px',
            backgroundColor: isLogoutHovered ? '#9cd6fc' : '#b3e0ff',
            color: isLogoutHovered ? '#fff' : '#2980b9',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap',
            width: getResponsiveStyle('auto', 'auto', 'auto', '80%'),
            margin: getResponsiveStyle('0', '0', '0', '0 auto'),
        },
        registerArrow: {
            marginLeft: '5px',
        },

        // --- Dashboard Layout Styles (from DoctorDashboard) ---
        dashboardContainer: {
            display: 'flex',
            padding: '20px',
            fontFamily: 'sans-serif',
            flexDirection: getResponsiveStyle('row', 'row', 'column', 'column'), // Adjust for responsiveness
        },
        sidebar: {
            width: getResponsiveStyle('250px', '250px', '100%', '100%'), // Adjust for responsiveness
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '5px',
            marginRight: getResponsiveStyle('20px', '20px', '0', '0'), // Remove right margin on smaller screens
            marginBottom: getResponsiveStyle('0', '0', '20px', '20px'), // Add bottom margin on smaller screens
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
        },
        sidebarLink: {
            display: 'flex',
            alignItems: 'center',
            padding: '12px 15px',
            color: '#333',
            textDecoration: 'none',
            borderBottom: '1px solid #eee',
            width: '100%',
            textAlign: 'left',
            transition: 'background-color 0.2s, color 0.2s',
            fontSize: '15px',
            fontWeight: '500',
            borderRadius: '5px',
            marginBottom: '5px',
        },
        sidebarLinkActive: {
            color: '#007bff',
            backgroundColor: '#e6f2ff',
            fontWeight: 'bold',
        },
        sidebarIcon: {
            marginRight: '10px',
            fontSize: '1.2em',
        },
        doctorAvatar: {
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#00cba9',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5em',
            fontWeight: 'bold',
            marginBottom: '5px',
            marginTop: '20px',
            overflow: 'hidden'
        },
        doctorName: {
            fontSize: '1.1em',
            color: '#333',
            margin: 0,
            marginTop: '10px',
            fontWeight: 'bold'
        },
        doctorType: {
            fontSize: '0.9em',
            color: '#6c757d',
            margin: '5px 0 0 0'
        },
        doctorInfo: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '15px 0',
            borderBottom: '1px solid #eee',
            backgroundColor: '#d7f3d2',
            borderRadius: '5px',
            marginBottom: '20px',
            width: '100%'
        },
        content: {
            flexGrow: 1,
            padding: '20px',
            backgroundColor: '#fff',
            borderRadius: '5px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)',
            width: getResponsiveStyle('auto', 'auto', '100%', '100%'), // Ensure content takes full width on small screens
        },

        // --- Prescription View Specific Styles ---
        formContainer: {
            fontFamily: 'Arial, sans-serif',
            maxWidth: '100%', // Max width adjusted to fit within content area
            margin: '0 auto', // Center within the flex container
            padding: '30px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            backgroundColor: '#fff',
        },
        // The 'header' key here in styles object is causing conflict.
        // It's overwriting the main 'header' style defined above for the navigation bar.
        // Let's rename this inner header style to something specific like 'formHeader'.
        formHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: '1px solid #eee' },
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
        removeBtn: {
            backgroundColor: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center', // Center icon
            width: '35px', // Fixed width for consistent look
            height: '35px', // Fixed height
            boxSizing: 'border-box',
        },
        addBtn: {
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '1em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        saveBtn: {
            width: '100%',
            padding: '15px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1.1em',
            marginTop: '20px',
            opacity: isSaving ? 0.7 : 1, // Visual feedback for saving
            cursor: isSaving ? 'not-allowed' : 'pointer',
        },
        buttonContainer: { textAlign: 'right', marginTop: '10px' },
        infoText: { fontSize: '1em', color: '#777' },
        errorText: { color: 'red', textAlign: 'center', padding: '50px' },
        loadingText: { color: '#007bff', textAlign: 'center', padding: '50px' },
        footer: { backgroundColor: '#d7f3d2', padding: '20px', marginTop: '20px' }, // Kept from original
        backButton: {
            backgroundColor: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '1em',
            marginBottom: '20px',
            alignSelf: 'flex-start',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
        },
        mainContentWrapper: {
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            width: getResponsiveStyle('auto', 'auto', '100%', '100%'), // Take full width of content area
        },
    };

    if (loading) {
        return <div style={styles.loadingText}>Loading prescription...</div>;
    }

    if (error) {
        return <div style={styles.errorText}>{error}</div>;
    }

    const isEditable = prescription?.status === 'active' || prescription?.status === 'partially_issued';

    return (
        <div style={{ fontFamily: 'sans-serif' }}>
            {/* Navigation Bar */}
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <img src={logo} alt="MediPrescribe Logo" style={styles.logo} />
                    <div>
                        <h1 style={styles.siteTitle}>MediPrescribe</h1>
                        <p style={styles.tagline}>Your Digital Healthcare Solution</p>
                    </div>
                </div>
                <div style={styles.headerRight}>
                    <div style={styles.phoneContact}>
                        <FaPhoneAlt style={styles.phoneIcon} />
                        <span>+94 (011) 519-51919</span>
                    </div>
                    <Link to="/signin" style={styles.logoutButtonLink}>
                        <div
                            style={styles.logoutButton}
                            onMouseEnter={() => setIsLogoutHovered(true)}
                            onMouseLeave={() => setIsLogoutHovered(false)}
                        >
                            <span>Logout</span>
                            <IoIosArrowForward style={styles.registerArrow} />
                        </div>
                    </Link>
                </div>
            </header>

            {/* Dashboard Content */}
            <div style={styles.dashboardContainer}>
                {/* Sidebar */}
                <aside style={styles.sidebar}>
                    <div style={styles.doctorInfo}>
                        <div style={styles.doctorAvatar}>
                            {doctorData.photoURL ? (
                                <img src={doctorData.photoURL} alt="Doctor Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <span>{getInitials(doctorData.firstName, doctorData.lastName)}</span>
                            )}
                        </div>
                        <p style={styles.doctorName}>{`${doctorData.firstName} ${doctorData.lastName}`}</p>
                        <p style={styles.doctorType}>{doctorData.userType}</p>
                    </div>
                    <Link to="/doctor/dashboard" style={styles.sidebarLink}><FaHome style={styles.sidebarIcon} />Dashboard</Link>
                    <Link to="/newprescription" style={styles.sidebarLink}><FaPrescriptionBottleAlt style={styles.sidebarIcon} />Create New Prescription</Link>
                    <Link to="/prescriptionhistory" style={{ ...styles.sidebarLink, ...styles.sidebarLinkActive }}><FaHistory style={styles.sidebarIcon} />Prescription History</Link>
                    <Link to="/docprofile" style={styles.sidebarLink}><FaUserMd style={styles.sidebarIcon} />Profile</Link>
                </aside>

                {/* Main Content (Prescription View) */}
                <main style={styles.content}>
                    <div style={styles.mainContentWrapper}>
                        <button onClick={handleBackClick} style={styles.backButton}>
                            <IoIosArrowForward style={{ transform: 'rotate(180deg)' }} />
                            Back to Prescriptions
                        </button>
                        <div style={styles.formContainer}>
                            {/* Changed from styles.header to styles.formHeader to avoid conflict */}
                            <h1 style={styles.formHeader}>Prescription Details</h1>
                            <div style={styles.section}>
                                <h3 style={{ color: '#007bff' }}>Patient Information</h3>
                                <p style={styles.infoText}><strong>Patient Name:</strong> {prescription?.patientName}</p>
                                <p style={styles.infoText}><strong>Diagnosis:</strong> {prescription?.diagnosis}</p>
                                <p style={styles.infoText}>
                                    <strong>Created On:</strong>{' '}
                                    {prescription?.prescriptionDate?.toDate ? new Date(prescription.prescriptionDate.toDate()).toLocaleDateString() : 'N/A'}
                                </p>
                                <p style={styles.infoText}><strong>Prescription ID:</strong> {prescriptionId}</p>
                            </div>

                            {/* New section for prescription status and notes */}
                            <div style={styles.section}>
                                <h3 style={{ color: '#007bff' }}>Prescription Status</h3>
                                <p style={{ ...styles.infoText, fontWeight: 'bold' }}>
                                    Status: {prescription?.status}
                                </p>
                                {/* Display rejection reason if rejected */}
                                {prescription?.status === 'Rejected' && (
                                    <div style={{ marginTop: '10px', padding: '15px', backgroundColor: '#fff0f0', border: '1px solid #e53e3e', borderRadius: '8px' }}>
                                        <p style={{ margin: 0, color: '#e53e3e', fontWeight: 'bold' }}>
                                            Rejection Reason:
                                        </p>
                                        <p style={{ margin: 0, color: '#e53e3e', fontStyle: 'italic' }}>
                                            "{prescription.rejectionReason}"
                                        </p>
                                        <p style={{ margin: '5px 0 0 0', color: '#e53e3e', fontSize: '0.9em' }}>
                                            Rejected By: {prescription.rejectedBy} on{' '}
                                            {prescription.rejectedAt?.toDate ? new Date(prescription.rejectedAt.toDate()).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                )}
                                {/* Display partially issued details if partially issued */}
                                {prescription?.status === 'partially_issued' && (
                                    <div style={{ marginTop: '10px', padding: '15px', backgroundColor: '#e6f2ff', border: '1px solid #007bff', borderRadius: '8px' }}>
                                        <p style={{ margin: 0, color: '#007bff', fontWeight: 'bold' }}>
                                            Partially Issued Details:
                                        </p>
                                        <ul style={{ margin: '10px 0 0 20px', padding: 0 }}>
                                            {prescription.medicines?.filter(med => med.status === 'Issued').length > 0 ? (
                                                prescription.medicines.filter(med => med.status === 'Issued').map((med, index) => (
                                                    <li key={index} style={{ color: '#007bff', marginBottom: '5px' }}>{med.name} has been issued.</li>
                                                ))
                                            ) : (
                                                <li style={{ color: '#007bff' }}>No medicines have been issued yet.</li>
                                            )}
                                        </ul>
                                    </div>
                                )}
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
                                                            disabled={!isEditable || med.status === 'Issued'}
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
                                                            disabled={!isEditable || med.status === 'Issued'}
                                                        />
                                                    </td>
                                                    <td style={styles.tableCell}>
                                                        <select
                                                            style={styles.medicineSelect}
                                                            value={med.frequency}
                                                            onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                                                            required
                                                            disabled={!isEditable || med.status === 'Issued'}
                                                        >
                                                            <option value="">Select Frequency</option>
                                                            <option value="Once Daily">Once Daily</option>
                                                            <option value="Twice Daily">Twice Daily</option>
                                                            <option value="Thrice Daily">Thrice Daily</option>
                                                            <option value="Every 4 Hours">Every 4 Hours</option>
                                                            <option value="As Needed">As Needed</option>
                                                        </select>
                                                    </td>
                                                    <td style={styles.tableCell}>
                                                        <input
                                                            style={styles.medicineInput}
                                                            type="text"
                                                            placeholder="Duration (e.g., 7 days)"
                                                            value={med.duration}
                                                            onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                                                            required
                                                            disabled={!isEditable || med.status === 'Issued'}
                                                        />
                                                    </td>
                                                    <td style={styles.tableCell}>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveMedicine(index)}
                                                            style={styles.removeBtn}
                                                            disabled={!isEditable || med.status === 'Issued'}
                                                        >
                                                            <FaTrashAlt />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {isEditable && (
                                        <div style={styles.buttonContainer}>
                                            <button type="button" onClick={handleAddMedicine} style={styles.addBtn}>
                                                <FaPlus /> Add Medicine
                                            </button>
                                        </div>
                                    )}
                                    {isEditable && (
                                        <button type="submit" style={styles.saveBtn} disabled={isSaving}>
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default PrescriptionView;