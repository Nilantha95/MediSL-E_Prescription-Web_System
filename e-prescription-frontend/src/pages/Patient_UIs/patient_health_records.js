// used chatgpt for code enhacements.

import React, { useState, useEffect, useMemo } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { FaPhoneAlt, FaSignOutAlt, FaHome, FaHistory, FaUser, FaPrescriptionBottleAlt } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';

import logo from '../Main_Interface_UI/images/Logo01.png';
import pic from '../Main_Interface_UI/images/Patient.jpg';
import ChatBotToggle from "../Chatbot/ChatBotToggle";
import Footer from '../Main_Interface_UI/Footer';

import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.REACT_APP_SECRET_KEY || "your-super-secret-key-that-should-be-in-a-secure-place";

const decryptData = (encryptedData) => {
    if (!encryptedData || typeof encryptedData !== 'string') {
        return '';
    }
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
        const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedText) {
            console.error("Decryption resulted in empty or invalid string.", { encryptedData });
            return 'Error Decrypting: Invalid data';
        }
        return decryptedText;
    } catch (error) {
        console.error("Decryption error in PatientHealthRecords:", error, "Encrypted data (first 50 chars):", String(encryptedData).substring(0, 50));
        return 'Error Decrypting: Key mismatch or corruption';
    }
};

const PatientHealthRecords = () => {
    const auth = getAuth();
    const navigate = useNavigate();
    const [diagnoses, setDiagnoses] = useState([]);
    const [userLoading, setUserLoading] = useState(true);
    const [recordsLoading, setRecordsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [patientData, setPatientData] = useState({
        firstName: 'Loading...',
        lastName: '',
        email: '',
        userType: '',
        photoURL: null,
    });

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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const docRef = doc(db, 'users', user.uid);
                try {
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setPatientData({
                            firstName: data.firstName || 'Unknown',
                            lastName: data.lastName || '',
                            email: user.email || '',
                            userType: data.userType || 'Patient',
                            photoURL: data.photoURL || pic,
                        });
                    } else {
                        setPatientData(prev => ({ ...prev, firstName: "Not Found", photoURL: pic, email: user.email }));
                        console.warn("User document not found for UID:", user.uid);
                    }
                } catch (err) {
                    console.error("Error fetching user data:", err);
                    setError("Failed to load user profile.");
                    setPatientData(prev => ({ ...prev, firstName: "Error", photoURL: pic, email: user.email }));
                }
            } else {
                navigate('/signin');
            }
            setUserLoading(false);
        });
        return () => unsubscribe();
    }, [auth, navigate]);

    // --- Fetch Health Records (Diagnoses) - Runs after patientData.email is available ---
    useEffect(() => {
        const fetchHealthRecords = async () => {
            if (!patientData.email) {
                setRecordsLoading(false);
                return;
            }

            setRecordsLoading(true);
            setError(null);

            try {
                const prescriptionsCollection = collection(db, 'prescriptions');
                const q = query(prescriptionsCollection, where('patientmail', '==', patientData.email));
                const querySnapshot = await getDocs(q);

                const fetchedDiagnoses = [];
                // Create a map to store fetched doctor names to avoid redundant lookups
                const doctorNameCache = new Map();

                for (const docSnapshot of querySnapshot.docs) { // Use for...of for async operations inside forEach-like loop
                    const data = docSnapshot.data();
                    
                    // First, try to get doctor's name
                    let doctorDisplayName = 'N/A';
                    if (data.doctorId) {
                        if (doctorNameCache.has(data.doctorId)) {
                            doctorDisplayName = doctorNameCache.get(data.doctorId);
                        } else {
                            try {
                                const doctorDocRef = doc(db, 'users', data.doctorId);
                                const doctorDocSnap = await getDoc(doctorDocRef); // Await here
                                if (doctorDocSnap.exists()) {
                                    const doctorData = doctorDocSnap.data();
                                    doctorDisplayName = `${doctorData.firstName || ''} ${doctorData.lastName || ''}`.trim();
                                    if (doctorDisplayName === '') {
                                        doctorDisplayName = 'Unnamed Doctor';
                                    }
                                    doctorNameCache.set(data.doctorId, doctorDisplayName); // Cache the name
                                } else {
                                    doctorDisplayName = 'Doctor Not Found';
                                }
                            } catch (doctorFetchError) {
                                console.error("Error fetching doctor details for ID:", data.doctorId, doctorFetchError);
                                doctorDisplayName = 'Error Fetching Doctor';
                            }
                        }
                    }

                    if (data.diagnosis) {
                        const decryptedDiagnosis = decryptData(data.diagnosis);
                        if (decryptedDiagnosis && !decryptedDiagnosis.includes('Error Decrypting')) {
                            const date = data.prescriptionDate && data.prescriptionDate.toDate ?
                                data.prescriptionDate.toDate().toLocaleDateString() :
                                (data.prescriptionDate || 'N/A');

                            fetchedDiagnoses.push({
                                id: docSnapshot.id, // Use docSnapshot.id
                                date: date,
                                diagnosis: decryptedDiagnosis,
                                doctorName: doctorDisplayName, // Use the fetched display name
                                status: data.status || 'N/A',
                                medications: data.medications ? decryptData(data.medications) : 'N/A'
                            });
                        }
                    }
                }

                // Sort diagnoses by date, newest first (assuming date is comparable)
                fetchedDiagnoses.sort((a, b) => new Date(b.date) - new Date(a.date));

                setDiagnoses(fetchedDiagnoses);
            } catch (err) {
                console.error("Error fetching health records:", err);
                setError("Failed to load health records. Please try again.");
            } finally {
                setRecordsLoading(false);
            }
        };

        if (!userLoading && patientData.email) {
            fetchHealthRecords();
        }
    }, [patientData.email, userLoading]);

    const getInitials = (firstName, lastName) => {
        const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
        const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
        return `${firstInitial}${lastInitial}`;
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/signin');
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    const styles = useMemo(() => ({
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
            gap: '20px',
        },
        sidebar: {
            width: getResponsiveStyle('250px', '220px', '100%', '100%'),
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '5px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flexShrink: 0,
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
            borderRadius: '5px',
        },
        sidebarIcon: {
            marginRight: '10px',
            fontSize: '1.2em',
        },
        patientAvatar: {
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
        patientName: {
            fontSize: '1.1em',
            color: '#333',
            margin: 0,
            marginTop: '10px',
            fontWeight: 'bold'
        },
        patientType: {
            fontSize: '0.9em',
            color: '#6c757d',
            margin: '5px 0 0 0'
        },
        patientInfo: {
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
            color: '#333',
            marginBottom: '25px',
            paddingBottom: '10px',
            borderBottom: '2px solid #007bff',
            display: 'flex',
            alignItems: 'center',
        },
        diagnosisCardContainer: {
            display: 'grid',
            gridTemplateColumns: getResponsiveStyle('repeat(auto-fit, minmax(300px, 1fr))', 'repeat(auto-fit, minmax(280px, 1fr))', '1fr', '1fr'),
            gap: '20px',
            marginTop: '20px',
        },
        diagnosisCard: {
            backgroundColor: '#fefefe',
            border: '1px solid #e0e0e0',
            borderRadius: '10px',
            padding: '25px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        },
        cardHeader: {
            marginBottom: '15px',
            borderBottom: '1px dashed #cceeff',
            paddingBottom: '10px',
        },
        cardDate: {
            fontSize: '1.1em',
            fontWeight: 'bold',
            color: '#007bff',
            marginBottom: '5px',
        },
        cardDoctor: {
            fontSize: '0.9em',
            color: '#666',
        },
        cardDiagnosis: {
            fontSize: '1em',
            color: '#444',
            lineHeight: '1.6',
            flexGrow: 1,
        },
        emptyState: {
            textAlign: 'center',
            color: '#666',
            fontSize: '1.1em',
            padding: '50px',
            border: '1px dashed #ccc',
            borderRadius: '5px',
            backgroundColor: '#fefefe',
            marginTop: '20px',
        },
        loadingState: {
            textAlign: 'center',
            color: '#007bff',
            fontSize: '1.1em',
            padding: '50px',
        },
        errorState: {
            textAlign: 'center',
            color: '#dc3545',
            fontSize: '1.1em',
            padding: '50px',
            border: '1px solid #dc3545',
            borderRadius: '5px',
            backgroundColor: '#fff3f3',
        }
    }), [screenWidth, isLogoutHovered]);

    if (userLoading) {
        return <div style={styles.loadingState}>Loading user data...</div>;
    }

    if (!auth.currentUser && !userLoading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Please log in to view your health records.</div>;
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
                    <Link to="/patient-prescriptions" style={styles.sidebarLink}><FaPrescriptionBottleAlt style={styles.sidebarIcon} />My Prescriptions</Link>
                    <Link to="/patient/health-records" style={{ ...styles.sidebarLink, ...styles.sidebarLinkActive }}><FaHistory style={styles.sidebarIcon} />My Health Records</Link>
                    <Link to="/patient-profile" style={styles.sidebarLink}><FaUser style={styles.sidebarIcon} />Profile</Link>
                </aside>

                <main style={styles.content}>
                    <h2 style={styles.sectionTitle}>
                        <FaHistory style={{ marginRight: '10px' }} />
                        All Diagnoses History
                    </h2>

                    {recordsLoading ? (
                        <p style={styles.loadingState}>Loading your health records...</p>
                    ) : error ? (
                        <p style={styles.errorState}>{error}</p>
                    ) : (
                        diagnoses.length > 0 ? (
                            <div style={styles.diagnosisCardContainer}>
                                {diagnoses.map((record) => (
                                    <div key={record.id} style={styles.diagnosisCard}>
                                        <div style={styles.cardHeader}>
                                            <div style={styles.cardDate}>Date: {record.date}</div>
                                            <div style={styles.cardDoctor}>Doctor: {record.doctorName}</div>
                                        </div>
                                        <div style={styles.cardDiagnosis}>
                                            <strong>Diagnosis:</strong> {record.diagnosis}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={styles.emptyState}>
                                <p>No diagnosis records found yet. Diagnoses will appear here after a doctor issues a prescription.</p>
                            </div>
                        )
                    )}
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default PatientHealthRecords;