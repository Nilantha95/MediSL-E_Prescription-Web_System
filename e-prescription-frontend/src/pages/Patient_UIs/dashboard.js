// used chatgpt for code enhacements.

import React, { useState, useEffect, useMemo } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { db } from '../../firebase';

import logo from '../Main_Interface_UI/images/Logo01.png';
import { FaPhoneAlt, FaSignOutAlt, FaHome, FaHistory, FaUser, FaPrescriptionBottleAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import pic from '../Main_Interface_UI/images/Patient.jpg';
import ChatBotToggle from "../Chatbot/ChatBotToggle";
import Footer from '../Main_Interface_UI/Footer';
import { IoIosArrowForward } from 'react-icons/io';
import { Line } from 'react-chartjs-2';
import CryptoJS from 'crypto-js';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    BarElement 
} from 'chart.js';


ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    BarElement 
);

// Encryption Library.
const SECRET_KEY = "your-super-secret-key-that-should-be-in-a-secure-place"; 

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

const PatientDashboard = () => {
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
    const [monthlyPrescriptionData, setMonthlyPrescriptionData] = useState({}); // New state for chart data
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

                    // --- Process data for the monthly graph ---
                    const monthlyCounts = {
                        'January': 0, 'February': 0, 'March': 0, 'April': 0, 'May': 0, 'June': 0,
                        'July': 0, 'August': 0, 'September': 0, 'October': 0, 'November': 0, 'December': 0
                    };
                    const monthNames = [
                        'January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'
                    ];

                    fetchedPrescriptions.forEach(p => {
                        if (p.prescriptionDate && p.prescriptionDate.seconds) {
                            const date = new Date(p.prescriptionDate.seconds * 1000);
                            const monthIndex = date.getMonth(); // 0 for January, 11 for December
                            const monthName = monthNames[monthIndex];
                            monthlyCounts[monthName]++;
                        }
                    });
                    setMonthlyPrescriptionData(monthlyCounts);
                    // --- End chart data processing ---

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

    const { activePrescriptionsCount, totalPrescriptionsCount, issuedPrescriptionsCount } = useMemo(() => {
        const total = prescriptions.length;
        const active = prescriptions.filter(p => typeof p.status === 'string' && p.status !== 'Fulfilled' && p.status !== 'Expired').length;
        const issued = prescriptions.filter(p => typeof p.status === 'string' && p.status === 'Issued').length;
        return { activePrescriptionsCount: active, totalPrescriptionsCount: total, issuedPrescriptionsCount: issued };
    }, [prescriptions]);

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

    // Chart Data and Options
    const chartData = {
        labels: Object.keys(monthlyPrescriptionData), // Month names
        datasets: [
            {
                label: 'Number of Prescriptions Issued',
                data: Object.values(monthlyPrescriptionData), // Counts per month
                fill: false,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1,
                // You can add more styling here for dots, line thickness etc.
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false, 
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: getResponsiveStyle(14, 13, 12, 10),
                    },
                },
            },
            title: {
                display: true,
                text: 'Monthly Prescription Activity (This Year)',
                font: {
                    size: getResponsiveStyle(18, 16, 15, 14),
                },
                color: '#333',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.raw}`;
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Month',
                    font: {
                        size: getResponsiveStyle(14, 13, 12, 10),
                    },
                    color: '#555',
                },
                ticks: {
                    font: {
                        size: getResponsiveStyle(12, 11, 10, 9),
                    },
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Number of Prescriptions',
                    font: {
                        size: getResponsiveStyle(14, 13, 12, 10),
                    },
                    color: '#555',
                },
                beginAtZero: true,
                ticks: {
                    precision: 0, // Ensure whole numbers for counts
                    font: {
                        size: getResponsiveStyle(12, 11, 10, 9),
                    },
                },
            },
        },
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
        dashboardHeader: {
            display: 'grid',
            gridTemplateColumns: getResponsiveStyle('repeat(auto-fit, minmax(150px, 1fr))', 'repeat(auto-fit, minmax(140px, 1fr))', 'repeat(auto-fit, minmax(120px, 1fr))', '1fr'),
            gap: '20px',
            marginBottom: '20px'
        },
        headerCard: {
            backgroundColor: '#e9ecef',
            padding: '15px',
            borderRadius: '5px',
            textAlign: 'center'
        },
        headerCardTitle: {
            fontSize: '1em',
            color: '#6c757d',
            marginBottom: '5px'
        },
        headerCardValue: {
            fontSize: '1.5em',
            fontWeight: 'bold',
            color: '#343a40'
        },
        recentPrescriptions: {
            marginBottom: '20px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            padding: '15px',
            backgroundColor: '#f8f9fa'
        },
        recentPrescriptionsTable: {
            width: '100%',
            borderCollapse: 'collapse'
        },
        recentPrescriptionsTableHeader: {
            backgroundColor: '#eee',
            padding: '8px',
            textAlign: 'left',
            borderBottom: '1px solid #ccc'
        },
        recentPrescriptionsTableRow: {
            borderBottom: '1px solid #eee'
        },
        recentPrescriptionsTableCell: {
            padding: '8px',
            textAlign: 'left'
        },
        viewDetailsButton: {
            backgroundColor: 'transparent',
            color: '#007bff',
            border: '1px solid #007bff',
            borderRadius: '5px',
            padding: '8px 15px',
            cursor: 'pointer',
            fontSize: '0.9em',
            marginRight: '5px'
        },
        requestRefillButton: {
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            padding: '8px 15px',
            cursor: 'pointer',
            fontSize: '0.9em'
        },
        // New style for the chart container
        chartContainer: {
            marginBottom: '20px',
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            backgroundColor: '#fff',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            height: getResponsiveStyle('400px', '350px', '300px', '250px'), // Set a fixed height for the chart
            display: 'flex', // Ensures the chart fills the container
            alignItems: 'center', // Centers content vertically
            justifyContent: 'center', // Centers content horizontally
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading patient profile...</div>;
    }

    if (!auth.currentUser && !loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Please log in to view the dashboard.</div>;
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
                    <Link to="/patient/dashboard" style={{ ...styles.sidebarLink, ...styles.sidebarLinkActive }}><FaHome style={styles.sidebarIcon} />Dashboard</Link>
                    <Link to="/patient-prescriptions" style={styles.sidebarLink}><FaPrescriptionBottleAlt style={styles.sidebarIcon} />My Prescriptions</Link>
                    <Link to="/patient-health-records" style={{ ...styles.sidebarLink}}><FaHistory style={styles.sidebarIcon} />My Health Records</Link>
                    <Link to="/patient-profile" style={styles.sidebarLink}><FaUser style={styles.sidebarIcon} />Profile</Link>
                </aside>

                <main style={styles.content}>
                    <div style={styles.dashboardHeader}>
                        <div style={styles.headerCard}>
                            <p style={styles.headerCardTitle}>Total Prescriptions</p>
                            <p style={styles.headerCardValue}>{totalPrescriptionsCount}</p>
                        </div>
                        <div style={styles.headerCard}>
                            <p style={styles.headerCardTitle}>Issued Prescriptions</p>
                            <p style={styles.headerCardValue}>{issuedPrescriptionsCount}</p>
                        </div>
                    </div>

                    {/* New Chart Section */}
                    <div style={styles.chartContainer}>
                        {loadingPrescriptions ? (
                            <p>Loading chart data...</p>
                        ) : (
                             // You can switch Line to Bar if you prefer a bar chart
                            <Line data={chartData} options={chartOptions} />
                        )}
                    </div>


                    <div style={styles.recentPrescriptions}>
                        <h2>Recent Prescriptions</h2>
                        {loadingPrescriptions ? (
                            <p>Loading prescriptions...</p>
                        ) : prescriptions.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={styles.recentPrescriptionsTable}>
                                    <thead>
                                        <tr>
                                            <th style={styles.recentPrescriptionsTableHeader}>Prescription ID</th>
                                            <th style={styles.recentPrescriptionsTableHeader}>Issue Date</th>
                                            <th style={styles.recentPrescriptionsTableHeader}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {prescriptions.map((prescription) => (
                                            <tr key={prescription.id} style={styles.recentPrescriptionsTableRow}>
                                                <td style={styles.recentPrescriptionsTableCell}>{prescription.id}</td>
                                                <td style={styles.recentPrescriptionsTableCell}>
                                                    {prescription.prescriptionDate ? new Date(prescription.prescriptionDate.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td style={styles.recentPrescriptionsTableCell}>
                                                    {prescription.status || 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>No prescriptions found for your account.</p>
                        )}
                    </div>

                    <div style={styles.recentPrescriptions}>
                        <h2>My Health Records</h2>
                        <p>Access your complete health history, including lab results and past diagnoses.</p>
                        <Link to="/patient-health-records" style={{textDecoration: 'none'}}>
                            <button style={styles.viewDetailsButton}>View Health Records</button>
                        </Link>
                    </div>

                </main>
            </div>

            <ChatBotToggle />
            <Footer />
        </div>
    );
};

export default PatientDashboard;