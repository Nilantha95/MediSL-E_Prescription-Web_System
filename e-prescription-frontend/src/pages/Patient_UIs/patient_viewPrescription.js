// src/pages/Patient_UIs/ViewPrescription.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { db } from '../firebase'; // Corrected relative path to firebase.js

// Icons for the sidebar
import { FaPhoneAlt, FaHome, FaHistory, FaUser, FaPrescriptionBottleAlt, FaArrowLeft } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';

// Assets
import pic from '../Main_Interface_UI/images/Doctor.png';
import Footer from '../Main_Interface_UI/Footer';
import logo from '../Main_Interface_UI/images/Logo01.png';

// Encryption Library (ensure SECRET_KEY is the same as in add_prescription.js)
import CryptoJS from 'crypto-js';

const SECRET_KEY = "your-super-secret-key-that-should-be-in-a-secure-place"; // <<< VERIFY THIS KEY CAREFULLY

// Modified decryptData to handle both plain encrypted strings and stringified JSON
const decryptData = (encryptedData) => {
    if (!encryptedData) {
        console.warn("decryptData received null or empty data.");
        return null; // Return null if no data
    }
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
        const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

        if (decryptedText === '') {
            console.warn("Decryption resulted in empty string. Original encrypted:", encryptedData);
            return '';
        }

        // Attempt to parse as JSON. If it fails, treat as plain text.
        try {
            const parsed = JSON.parse(decryptedText);
            console.log("Decryption successful (parsed JSON):", parsed);
            return parsed; // Return the parsed object/array
        } catch (jsonError) {
            console.log("Decryption successful (plain text):", decryptedText);
            return decryptedText; // Return as plain text if not valid JSON
        }

    } catch (error) {
        console.error("Decryption error in decryptData:", error, "Encrypted data that failed:", encryptedData);
        return 'Error Decrypting'; // Return a visible error for debugging if needed
    }
};

const ViewPrescription = () => {
    const { prescriptionId } = useParams(); // Get ID from URL
    const navigate = useNavigate();
    const auth = getAuth();

    const [patientData, setPatientData] = useState({
        firstName: 'Loading...',
        lastName: '',
        email: '',
        userType: '',
        photoURL: null,
    });
    const [prescriptionDetails, setPrescriptionDetails] = useState(null);
    const [loading, setLoading] = useState(true); // For patient data
    const [loadingPrescription, setLoadingPrescription] = useState(true); // For prescription data
    const [error, setError] = useState('');

    const [isLogoutHovered, setIsLogoutHovered] = useState(false);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    // Fetch patient data on auth state change
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log("Auth state changed. User:", user ? user.uid : "No user");
            if (user) {
                const docRef = doc(db, 'users', user.uid);
                try {
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        console.log("Fetched patient profile data:", data);
                        setPatientData({
                            firstName: data.firstName || 'Unknown',
                            lastName: data.lastName || '',
                            email: user.email || '',
                            userType: data.userType || 'Patient',
                            photoURL: data.photoURL || pic,
                        });
                    } else {
                        console.warn("Patient user document not found for UID:", user.uid);
                        setPatientData(prev => ({ ...prev, firstName: "Not Found", photoURL: pic, email: user.email }));
                    }
                } catch (error) {
                    console.error("Error fetching user data from Firestore:", error);
                    setPatientData(prev => ({ ...prev, firstName: "Error", photoURL: pic, email: user.email }));
                }
            } else {
                console.log("No user logged in. Navigating to signin.");
                setPatientData({ firstName: "Please Log In", lastName: "", email: "", userType: "", photoURL: pic });
                navigate('/signin');
            }
            setLoading(false);
            console.log("setLoading(false)");
        });
        return () => unsubscribe();
    }, [auth, navigate]);

    // Fetch prescription details and doctor name
    useEffect(() => {
        const fetchPrescriptionDetails = async () => {
            console.log("Attempting to fetch prescription details...");
            console.log("prescriptionId:", prescriptionId);
            console.log("patientData.email:", patientData.email);
            console.log("loading (patient data):", loading);

            if (prescriptionId && patientData.email && patientData.email !== 'Loading...') {
                setLoadingPrescription(true);
                setError('');
                try {
                    const docRef = doc(db, 'prescriptions', prescriptionId);
                    const docSnap = await getDoc(docRef);
                    console.log("docSnap exists:", docSnap.exists());

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        console.log("Raw prescription data:", data);

                        // **IMPORTANT:** The Firebase security rule now handles the patient permission.
                        // If docSnap.exists() is true, it means the current authenticated user
                        // (whose email is in request.auth.token.email) was granted permission
                        // because their email matched resource.data.patientmail.
                        // So, the client-side check `if (data.patientmail !== patientData.email)` is removed.

                        // --- Fetch Doctor's Name ---
                        let doctorDisplayName = 'N/A';
                        if (data.doctorId) {
                            console.log("Fetching doctor with ID:", data.doctorId);
                            const doctorDocRef = doc(db, 'users', data.doctorId);
                            const doctorDocSnap = await getDoc(doctorDocRef);
                            if (doctorDocSnap.exists()) {
                                const doctorData = doctorDocSnap.data();
                                doctorDisplayName = `${doctorData.firstName || ''} ${doctorData.lastName || ''}`.trim();
                                if (doctorDisplayName === '') {
                                    doctorDisplayName = 'Unnamed Doctor';
                                }
                                console.log("Doctor Display Name:", doctorDisplayName);
                            } else {
                                doctorDisplayName = 'Doctor Not Found (UID exists but doc missing)';
                                console.warn("Doctor user document not found for ID:", data.doctorId);
                            }
                        } else {
                            console.warn("No doctorId found in prescription data.");
                        }

                        // --- Decrypt Fields ---
                        const decryptedMedications = decryptData(data.medications);
                        const decryptedDiagnosis = decryptData(data.diagnosis);
                        const decryptedAdditionalNotes = decryptData(data.additionalNotes);

                        console.log("Decrypted Medications (after decryptData):", decryptedMedications);
                        console.log("Decrypted Diagnosis (after decryptData):", decryptedDiagnosis);
                        console.log("Decrypted Additional Notes (after decryptData):", decryptedAdditionalNotes);

                        setPrescriptionDetails({
                            ...data,
                            doctorDisplayName: doctorDisplayName, // Add the fetched doctor's name
                            medications: Array.isArray(decryptedMedications) ? decryptedMedications : [],
                            diagnosis: typeof decryptedDiagnosis === 'string' ? decryptedDiagnosis : 'N/A',
                            additionalNotes: typeof decryptedAdditionalNotes === 'string' ? decryptedAdditionalNotes : 'N/A',
                        });
                        console.log("Prescription details state updated.");

                    } else {
                        setError("Prescription not found or you do not have permission.");
                        setPrescriptionDetails(null);
                        console.warn("Prescription document does not exist for ID:", prescriptionId);
                    }
                } catch (err) {
                    console.error("Caught error fetching prescription details:", err);
                    setError("Failed to load prescription details. Please try again. (Check console for more info)");
                } finally {
                    setLoadingPrescription(false);
                    console.log("setLoadingPrescription(false)");
                }
            } else if (!patientData.email && !loading) {
                // This block should ideally not be hit if auth state handles redirection first
                setError("Please log in to view prescription details.");
                setLoadingPrescription(false);
                console.warn("Patient email not available when attempting to fetch prescription.");
            }
        };

        // Only attempt to fetch if patientData has finished loading and we have an email
        // and if loading is false (meaning patientData is no longer in its initial 'Loading...' state)
        if (!loading && patientData.email) {
            fetchPrescriptionDetails();
        } else if (!loading && !patientData.email) {
            // This case handles when user is not logged in after initial load finishes
            setError("Please log in to view prescription details.");
            setLoadingPrescription(false);
        }
    }, [prescriptionId, patientData.email, loading]); // Dependencies for this useEffect


    const getInitials = (firstName, lastName) => {
        const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
        const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
        return `${firstInitial}${lastInitial}`;
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/signin');
        } catch (err) {
            console.error("Error logging out:", err);
        }
    };

    const styles = {
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: getResponsiveStyle('20px 50px', '15px 40px', '12px 20px', '10px 15px'),
            backgroundColor: '#e0ffe0',
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

        dashboardContainer: {
            display: 'flex',
            padding: '20px',
            fontFamily: 'sans-serif',
            flexDirection: getResponsiveStyle('row', 'row', 'column', 'column'),
        },
        sidebar: {
            width: getResponsiveStyle('250px', '220px', '100%', '100%'),
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '5px',
            marginRight: getResponsiveStyle('20px', '15px', '0', '0'),
            marginBottom: getResponsiveStyle('0', '0', '20px', '20px'),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
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
            '&:hover': { // Basic hover for modern JS
                backgroundColor: '#e9ecef',
                color: '#007bff',
            }
        },
        sidebarLinkActive: {
            color: '#007bff',
            backgroundColor: '#e6f2ff',
            fontWeight: 'bold',
            borderRadius: '5px',
        },
        sidebarIcon: {
            marginRight: '10px',
            fontSize: '1.2em',
        },
        patientAvatar: { // Renamed from doctorAvatar for clarity in patient UI
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
        patientName: { // Renamed from doctorName
            fontSize: '1.1em',
            color: '#333',
            margin: 0,
            marginTop: '10px',
            fontWeight: 'bold'
        },
        patientType: { // Renamed from doctorType
            fontSize: '0.9em',
            color: '#6c757d',
            margin: '5px 0 0 0'
        },
        patientInfo: { // Renamed from doctorInfo
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
        },
        sectionTitle: {
            fontSize: '1.8em',
            color: '#2c3e50',
            marginBottom: '20px',
            borderBottom: '2px solid #eee',
            paddingBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        },
        backButton: {
            backgroundColor: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '0.9em',
            fontWeight: 'bold',
            transition: 'background-color 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            '&:hover': {
                backgroundColor: '#5a6268',
            }
        },
        detailsCard: {
            backgroundColor: '#f8f9fa',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '25px',
            marginBottom: '20px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        },
        detailRow: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 0',
            borderBottom: '1px dashed #eee',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            gap: '10px',
        },
        detailLabel: {
            fontWeight: 'bold',
            color: '#555',
            flexBasis: '150px', // Fixed width for label
            flexShrink: 0,
            fontSize: '0.95em',
        },
        detailValue: {
            color: '#333',
            flexGrow: 1,
            textAlign: 'right',
            fontSize: '0.95em',
        },
        medicationList: {
            marginTop: '20px',
            borderTop: '1px solid #ddd',
            paddingTop: '15px',
        },
        medicationItem: {
            backgroundColor: '#e9ecef',
            borderRadius: '5px',
            padding: '12px 15px',
            marginBottom: '10px',
            display: 'grid',
            gridTemplateColumns: getResponsiveStyle('repeat(3, 1fr)', 'repeat(2, 1fr)', '1fr', '1fr'),
            gap: '10px',
            alignItems: 'center',
            border: '1px solid #dee2e6',
        },
        medDetail: {
            fontSize: '0.9em',
            color: '#343a40',
        },
        medLabel: {
            fontWeight: 'bold',
            marginRight: '5px',
            color: '#6c757d',
        },
        errorState: {
            textAlign: 'center',
            padding: '50px',
            color: '#dc3545',
            fontSize: '1.1em',
            fontWeight: 'bold',
        }
    };

    if (loading || loadingPrescription) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                Loading {loading ? 'patient profile' : 'prescription details'}...
            </div>
        );
    }

    if (!auth.currentUser && !loading) {
        // This case should ideally lead to navigate('/signin') by onAuthStateChanged
        return <div style={{ textAlign: 'center', padding: '50px' }}>Please log in to view prescription details.</div>;
    }

    return (
        <div style={{ fontFamily: 'sans-serif' }}>
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
                    <div
                        style={styles.logoutButton}
                        onMouseEnter={() => setIsLogoutHovered(true)}
                        onMouseLeave={() => setIsLogoutHovered(false)}
                        onClick={handleLogout}
                    >
                        <span>Logout</span>
                        <IoIosArrowForward style={styles.registerArrow} />
                    </div>
                </div>
            </header>

            <div style={styles.dashboardContainer}>
                <aside style={styles.sidebar}>
                    <div style={styles.patientInfo}>
                        <div style={styles.patientAvatar}>
                            {patientData.photoURL && patientData.photoURL !== pic ? (
                                <img src={patientData.photoURL} alt="Patient Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <span>{getInitials(patientData.firstName, patientData.lastName)}</span>
                            )}
                        </div>
                        <p style={styles.patientName}>{`${patientData.firstName} ${patientData.lastName}`}</p>
                        <p style={styles.patientType}>{patientData.userType}</p>
                    </div>
                    <Link to="/patient/dashboard" style={styles.sidebarLink}><FaHome style={styles.sidebarIcon} />Dashboard</Link>
                    <Link to="#" style={{ ...styles.sidebarLink, ...styles.sidebarLinkActive }}><FaPrescriptionBottleAlt style={styles.sidebarIcon} />My Prescriptions</Link>
                    <Link to="/patient-health-records" style={styles.sidebarLink}><FaHistory style={styles.sidebarIcon} />My Health Records</Link>
                    <Link to="/patient-profile" style={styles.sidebarLink}><FaUser style={styles.sidebarIcon} />Profile</Link>
                </aside>

                <main style={styles.content}>
                    <h1 style={styles.sectionTitle}>
                        <button onClick={() => navigate('/patient-prescriptions')} style={styles.backButton}>
                            <FaArrowLeft /> Back
                        </button>
                        Prescription Details
                    </h1>

                    {error && <p style={styles.errorState}>{error}</p>}

                    {prescriptionDetails && (
                        <div style={styles.detailsCard}>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Prescription ID:</span>
                                <span style={styles.detailValue}>{prescriptionId}</span>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Issue Date:</span>
                                <span style={styles.detailValue}>
                                    {prescriptionDetails.prescriptionDate ? new Date(prescriptionDetails.prescriptionDate.seconds * 1000).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Doctor:</span>
                                <span style={styles.detailValue}>
                                    {/* Display the doctorDisplayName fetched from the 'users' collection */}
                                    {prescriptionDetails.doctorDisplayName || 'N/A'}
                                </span>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Status:</span>
                                <span style={styles.detailValue}>{prescriptionDetails.status || 'N/A'}</span>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Diagnosis:</span>
                                <span style={styles.detailValue}>
                                    {prescriptionDetails.diagnosis || 'N/A'}
                                </span>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Additional Notes:</span>
                                <span style={styles.detailValue}>
                                    {prescriptionDetails.additionalNotes || 'N/A'}
                                </span>
                            </div>

                            <div style={styles.medicationList}>
                                <h3>Medications:</h3>
                                {prescriptionDetails.medications && prescriptionDetails.medications.length > 0 ? (
                                    prescriptionDetails.medications.map((med, index) => (
                                        <div key={index} style={styles.medicationItem}>
                                            <div style={styles.medDetail}>
                                                <span style={styles.medLabel}>Name:</span> {med.name}
                                            </div>
                                            <div style={styles.medDetail}>
                                                <span style={styles.medLabel}>Dosage:</span> {med.dosage}
                                            </div>
                                            <div style={styles.medDetail}>
                                                <span style={styles.medLabel}>Frequency:</span> {med.frequency}
                                            </div>
                                            <div style={styles.medDetail}>
                                                <span style={styles.medLabel}>Duration:</span> {med.duration}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No medications listed for this prescription.</p>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default ViewPrescription;