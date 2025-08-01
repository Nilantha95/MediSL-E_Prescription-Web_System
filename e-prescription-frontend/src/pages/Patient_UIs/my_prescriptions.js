// src/pages/Patient_UIs/MyPrescriptions.js

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { db } from '../../firebase';
import { Link, useNavigate } from 'react-router-dom';

// Icons for the sidebar
import { FaPhoneAlt, FaSignOutAlt, FaHome, FaHistory, FaUser, FaPrescriptionBottleAlt } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';

// Assets
import pic from '../Main_Interface_UI/images/Doctor.png';
import Footer from '../Main_Interface_UI/Footer';
import logo from '../Main_Interface_UI/images/Logo01.png';

// Encryption Library (ensure SECRET_KEY is the same as in Dashboard)
import CryptoJS from 'crypto-js';

const SECRET_KEY = "your-super-secret-key-that-should-be-in-a-secure-place"; // <<< VERIFY THIS KEY CAREFULLY

const decryptData = (encryptedData) => {
    if (!encryptedData) return '';
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
        const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
        if (decryptedText === '') {
            console.warn("Decryption resulted in empty string. Original encrypted:", encryptedData);
        }
        return decryptedText;
    } catch (error) {
        console.error("Decryption error:", error, "Encrypted data:", encryptedData);
        return 'Error Decrypting';
    }
};

const MyPrescriptions = () => {
    const auth = getAuth();
    const navigate = useNavigate();

    const [patientData, setPatientData] = useState({
        firstName: 'Loading...',
        lastName: '',
        email: '',
        userType: '',
        photoURL: null,
    });
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingPrescriptions, setLoadingPrescriptions] = useState(true);

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
                    }
                } catch (error) {
                    console.error("Error fetching user data from Firestore:", error);
                    setPatientData(prev => ({ ...prev, firstName: "Error", photoURL: pic, email: user.email }));
                }
            } else {
                setPatientData({ firstName: "Please Log In", lastName: "", email: "", userType: "", photoURL: pic });
                navigate('/signin');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [auth, navigate]);

    // Fetch prescriptions once patient email is available
    useEffect(() => {
        const fetchPrescriptions = async () => {
            if (patientData.email && patientData.email !== '') {
                setLoadingPrescriptions(true);
                try {
                    const prescriptionsCollection = collection(db, 'prescriptions');
                    const q = query(prescriptionsCollection, where('patientmail', '==', patientData.email));
                    const querySnapshot = await getDocs(q);

                    const fetchedPrescriptions = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setPrescriptions(fetchedPrescriptions);
                } catch (error) {
                    console.error("Error fetching prescriptions:", error);
                } finally {
                    setLoadingPrescriptions(false);
                }
            } else if (!loading) {
                setLoadingPrescriptions(false);
            }
        };

        if (!loading && patientData.email && patientData.email !== '') {
            fetchPrescriptions();
        } else if (!loading && !patientData.email) {
            console.log("Skipping prescription fetch: Patient email is null/undefined after user data loaded (or user not logged in).");
        }
    }, [patientData.email, loading]);

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

    const handleViewDetails = (prescriptionId) => {
        navigate(`/patient-view-prescription/${prescriptionId}`); // <-- Added a forward slash here
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
            color: '#2c3e50',
            marginBottom: '20px',
            borderBottom: '2px solid #eee',
            paddingBottom: '10px',
        },
        tableContainer: {
            overflowX: 'auto', // Allows horizontal scrolling on small screens
            marginBottom: '20px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            backgroundColor: '#f8f9fa',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: getResponsiveStyle('600px', '550px', '500px', '400px'), // Ensures table doesn't get too squished
        },
        tableHeader: {
            backgroundColor: '#e9ecef',
            padding: '12px 15px',
            textAlign: 'left',
            borderBottom: '1px solid #ccc',
            color: '#333',
            fontWeight: 'bold',
        },
        tableRow: {
            borderBottom: '1px solid #eee',
            transition: 'background-color 0.2s',
            '&:hover': {
                backgroundColor: '#f1f1f1',
            },
        },
        tableCell: {
            padding: '10px 15px',
            textAlign: 'left',
            color: '#555',
            fontSize: '0.95em',
        },
        viewButton: {
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '0.9em',
            fontWeight: 'bold',
            transition: 'background-color 0.2s ease',
            '&:hover': {
                backgroundColor: '#0056b3',
            },
        },
        emptyState: {
            textAlign: 'center',
            padding: '50px',
            color: '#6c757d',
            fontSize: '1.1em',
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading patient profile...</div>;
    }

    if (!auth.currentUser && !loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Please log in to view your prescriptions.</div>;
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
                    <Link to="/patient/prescriptions" style={{ ...styles.sidebarLink, ...styles.sidebarLinkActive }}><FaPrescriptionBottleAlt style={styles.sidebarIcon} />My Prescriptions</Link>
                    <Link to="/patient-health-records" style={styles.sidebarLink}><FaHistory style={styles.sidebarIcon} />My Health Records</Link>
                    <Link to="/patient-profile" style={styles.sidebarLink}><FaUser style={styles.sidebarIcon} />Profile</Link>
                </aside>

                <main style={styles.content}>
                    <h1 style={styles.sectionTitle}>My Prescriptions</h1>

                    {loadingPrescriptions ? (
                        <p style={styles.emptyState}>Loading prescriptions...</p>
                    ) : prescriptions.length === 0 ? (
                        <p style={styles.emptyState}>You have no prescriptions recorded yet.</p>
                    ) : (
                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.tableHeader}>Prescription ID</th>
                                        <th style={styles.tableHeader}>Issue Date</th>
                                        <th style={styles.tableHeader}>Status</th>
                                        <th style={styles.tableHeader}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescriptions.map((prescription) => (
                                        <tr key={prescription.id} style={styles.tableRow}>
                                            <td style={styles.tableCell}>{prescription.id}</td>
                                            <td style={styles.tableCell}>
                                                {prescription.prescriptionDate ? new Date(prescription.prescriptionDate.seconds * 1000).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td style={styles.tableCell}>
                                                {prescription.status || 'N/A'}
                                            </td>
                                            <td style={styles.tableCell}>
                                                <button
                                                    style={styles.viewButton}
                                                    onClick={() => handleViewDetails(prescription.id)}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default MyPrescriptions;