import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../firebase';

// --- Import Chart.js for the graph ---
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

import logo from '../Main_Interface_UI/images/Logo01.png';
import { FaPhoneAlt } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import { Link } from 'react-router-dom';
import { FaUserMd, FaPrescriptionBottleAlt, FaHistory, FaHome, FaEye } from 'react-icons/fa'; // Added FaEye for the view icon
import pic from '../Main_Interface_UI/images/Doctor.png';
import Footer from '../Main_Interface_UI/Footer';

// --- Register Chart.js components ---
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DoctorDashboard = () => {
    const auth = getAuth();

    const [doctorData, setDoctorData] = useState({
        firstName: 'Loading...',
        lastName: '',
        email: '',
        userType: '',
        photoURL: null,
    });

    // State for dashboard statistics
    const [totalPatients, setTotalPatients] = useState(0);
    const [totalPrescriptions, setTotalPrescriptions] = useState(0);
    const [todaysPrescriptions, setTodaysPrescriptions] = useState(0);

    // --- New state for patient-specific stats and the full prescription list ---
    const [patientStats, setPatientStats] = useState([]);
    const [allPrescriptions, setAllPrescriptions] = useState([]); // To store the full list for filtering

    // --- New state for modal control ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null); // To store data for the modal

    const [loading, setLoading] = useState(true);
    const [isLogoutHovered, setIsLogoutHovered] = useState(false);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getResponsiveStyle = (desktopStyle, tabletStyle, mobileStyle, smallMobileStyle) => {
        if (screenWidth <= 575) return smallMobileStyle;
        if (screenWidth <= 768) return mobileStyle;
        if (screenWidth <= 992) return tabletStyle;
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
                        setDoctorData({
                            firstName: data.firstName || 'Dr. Unknown',
                            lastName: data.lastName || '',
                            email: user.email || '',
                            userType: data.userType || 'Doctor',
                            photoURL: data.photoURL || pic,
                        });
                    } else {
                        setDoctorData(prev => ({ ...prev, firstName: "Dr. Not Found", photoURL: pic }));
                    }

                    const prescriptionsQuery = query(collection(db, "prescriptions"), where("doctorId", "==", user.uid));
                    const querySnapshot = await getDocs(prescriptionsQuery);
                    const prescriptions = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

                    setAllPrescriptions(prescriptions);
                    setTotalPrescriptions(prescriptions.length);

                    // --- MODIFIED LOGIC FOR PATIENT COUNT ---
                    const patientIdentifiers = prescriptions.map(p => p.patientUID || p.patientName);
                    const uniquePatients = [...new Set(patientIdentifiers)];
                    setTotalPatients(uniquePatients.length);
                    // ----------------------------------------

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const todaysAppointments = prescriptions.filter(p => {
                        const prescriptionDate = p.prescriptionDate.toDate();
                        prescriptionDate.setHours(0, 0, 0, 0);
                        return prescriptionDate.getTime() === today.getTime();
                    });
                    setTodaysPrescriptions(todaysAppointments.length);

                    const stats = {};
                    prescriptions.forEach(p => {
                        const patientName = p.patientName || "Unknown Patient";
                        if (!stats[patientName]) stats[patientName] = 0;
                        stats[patientName]++;
                    });
                    const statsArray = Object.keys(stats).map(name => ({
                        patientName: name,
                        count: stats[name]
                    })).sort((a, b) => b.count - a.count);
                    setPatientStats(statsArray);

                } catch (error) {
                    console.error("Error fetching data:", error);
                    setDoctorData(prev => ({ ...prev, firstName: "Error", photoURL: pic }));
                }
            } else {
                setDoctorData({ firstName: "Please Log In", photoURL: pic });
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [auth]);

    const getInitials = (firstName, lastName) => {
        const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
        const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
        return `${firstInitial}${lastInitial}`;
    };

    // --- Function to handle opening the modal ---
    const handleViewPatientPrescriptions = (patientName) => {
        const prescriptionsForPatient = allPrescriptions.filter(p => p.patientName === patientName);
        setSelectedPatient({ name: patientName, prescriptions: prescriptionsForPatient });
        setIsModalOpen(true);
    };

    const chartData = {
        labels: patientStats.map(stat => stat.patientName),
        datasets: [{
            label: 'Number of Prescriptions',
            data: patientStats.map(stat => stat.count),
            backgroundColor: 'rgba(0, 123, 255, 0.6)',
            borderColor: 'rgba(0, 123, 255, 1)',
            borderWidth: 1,
        }],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Patient Prescription Distribution', font: { size: 16 } },
        },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    };

    const styles = {
        // --- Header Styles (omitted for brevity, no changes from previous version) ---
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
        siteTitle: { // Updated to match "MediPrescribe"
            margin: 0,
            fontSize: getResponsiveStyle('24px', '24px', '22px', '20px'),
            fontWeight: '700',
            color: '#2c3e50',
            whiteSpace: getResponsiveStyle('nowrap', 'nowrap', 'nowrap', 'normal'),
        },
        tagline: { // Updated to match "Your Digital Healthcare Solution"
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
        logoutButtonLink: { // Renamed from homeButtonLink
            textDecoration: 'none',
            flexShrink: 0,
            width: getResponsiveStyle('auto', 'auto', 'auto', '100%'),
            textAlign: 'center',
        },
        logoutButton: { // Renamed from homeButton
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
        registerArrow: { // Used for the forward arrow in the logout button
            marginLeft: '5px',
        },
        dashboardContainer: { display: 'flex', padding: '20px', fontFamily: 'sans-serif' },
        sidebar: { width: '250px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '5px', marginRight: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', alignSelf: 'flex-start' },
        sidebarLink: { display: 'flex', alignItems: 'center', padding: '12px 15px', color: '#333', textDecoration: 'none', borderBottom: '1px solid #eee', width: '100%', textAlign: 'left', transition: 'background-color 0.2s, color 0.2s', fontSize: '15px', fontWeight: '500', borderRadius: '5px', marginBottom: '5px' },
        sidebarLinkActive: { color: '#007bff', backgroundColor: '#e6f2ff', fontWeight: 'bold' },
        sidebarIcon: { marginRight: '10px', fontSize: '1.2em' },
        doctorAvatar: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#00cba9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5em', fontWeight: 'bold', marginBottom: '5px', marginTop: '20px', overflow: 'hidden' },
        doctorName: { fontSize: '1.1em', color: '#333', margin: 0, marginTop: '10px', fontWeight: 'bold' },
        doctorType: { fontSize: '0.9em', color: '#6c757d', margin: '5px 0 0 0' },
        doctorInfo: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee', backgroundColor: '#d7f3d2', borderRadius: '5px', marginBottom: '20px', width: '100%' },
        content: { flexGrow: 1, padding: '20px', backgroundColor: '#fff', borderRadius: '5px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)' },
        dashboardHeader: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '40px' },
        headerCard: { backgroundColor: '#e9ecef', padding: '15px', borderRadius: '5px', textAlign: 'center' },
        headerCardTitle: { fontSize: '1em', color: '#6c757d', marginBottom: '5px' },
        headerCardValue: { fontSize: '1.5em', fontWeight: 'bold', color: '#343a40' },
        analyticsContainer: { marginTop: '30px', borderTop: '1px solid #e0e0e0', paddingTop: '20px' },
        analyticsTitle: { fontSize: '1.5em', fontWeight: 'bold', color: '#343a40', marginBottom: '20px' },
        statsLayout: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'flex-start' },
        chartContainer: { padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
        
        // --- Enhanced and New Styles for Table and Modal ---
        statsTableContainer: { backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' },
        statsTable: { width: '100%', borderCollapse: 'collapse' },
        statsTableHeader: { backgroundColor: '#f1f3f5', padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #dee2e6', color: '#495057', fontWeight: '600' },
        statsTableRow: { borderBottom: '1px solid #e9ecef', transition: 'background-color 0.2s ease' },
        statsTableCell: { padding: '12px 15px', textAlign: 'left', color: '#495057' },
        actionButton: { backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', transition: 'background-color 0.2s ease' },

        // --- Modal Styles ---
        modalBackdrop: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
        modalContent: { backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', width: '90%', maxWidth: '600px', position: 'relative' },
        modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #dee2e6', paddingBottom: '15px', marginBottom: '15px' },
        modalTitle: { margin: 0, fontSize: '1.25rem', fontWeight: '600' },
        closeButton: { background: 'transparent', border: 'none', fontSize: '1.75rem', cursor: 'pointer', color: '#6c757d', lineHeight: 1 },
        modalTable: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
        modalTableHeader: { backgroundColor: '#f8f9fa', padding: '10px', textAlign: 'left', borderBottom: '1px solid #dee2e6' },
        modalTableCell: { padding: '10px', borderBottom: '1px solid #e9ecef' },
        modalLink: { color: '#007bff', textDecoration: 'none', fontWeight: '500' },
        
        footer: { backgroundColor: '#d7f3d2', padding: '20px', marginTop: '20px' },
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading profile...</div>;
    }

    return (
        <div style={{ fontFamily: 'sans-serif' }}>
            <header style={styles.header}>
                {/* Header content unchanged */}
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

            <div style={styles.dashboardContainer}>
                <aside style={styles.sidebar}>
                    {/* Sidebar content unchanged */}
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
                    <Link to="/doctor/dashboard" style={{ ...styles.sidebarLink, ...styles.sidebarLinkActive }}><FaHome style={styles.sidebarIcon} />Dashboard</Link>
                    <Link to="/newprescription" style={styles.sidebarLink}><FaPrescriptionBottleAlt style={styles.sidebarIcon} />Create New Prescription</Link>
                    <Link to="/prescriptionhistory" style={styles.sidebarLink}><FaHistory style={styles.sidebarIcon} />Prescriptions</Link>
                    <Link to="/docprofile" style={styles.sidebarLink}><FaUserMd style={styles.sidebarIcon} />Profile</Link>
                </aside>

                <main style={styles.content}>
                    <div style={styles.dashboardHeader}>
                        {/* Header cards unchanged */}
                        <div style={styles.headerCard}>
                            <p style={styles.headerCardTitle}>Total Patients</p>
                            <p style={styles.headerCardValue}>{totalPatients}</p>
                        </div>
                        <div style={styles.headerCard}>
                            <p style={styles.headerCardTitle}>Prescriptions</p>
                            <p style={styles.headerCardValue}>{totalPrescriptions}</p>
                        </div>
                        <div style={styles.headerCard}>
                            <p style={styles.headerCardTitle}>Today's Appointments</p>
                            <p style={styles.headerCardValue}>{todaysPrescriptions}</p>
                        </div>
                    </div>

                    <div style={styles.analyticsContainer}>
                        <h2 style={styles.analyticsTitle}>Patient Analytics</h2>
                        <div style={styles.statsLayout}>
                            <div style={styles.chartContainer}>
                                <Bar options={chartOptions} data={chartData} />
                            </div>

                            <div style={styles.statsTableContainer}>
                                <table style={styles.statsTable}>
                                    <thead>
                                        <tr>
                                            <th style={styles.statsTableHeader}>Patient</th>
                                            <th style={styles.statsTableHeader}>Prescriptions</th>
                                            <th style={styles.statsTableHeader}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {patientStats.length > 0 ? patientStats.map((stat, index) => (
                                            <tr key={index} style={{...styles.statsTableRow, backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'}}>
                                                <td style={styles.statsTableCell}>{stat.patientName}</td>
                                                <td style={{ ...styles.statsTableCell, textAlign: 'center', fontWeight: 'bold' }}>{stat.count}</td>
                                                <td style={styles.statsTableCell}>
                                                    <button 
                                                        style={styles.actionButton}
                                                        onClick={() => handleViewPatientPrescriptions(stat.patientName)}
                                                    >
                                                        <FaEye />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="3" style={{...styles.statsTableCell, textAlign: 'center'}}>No patient data.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* --- New Modal Component --- */}
            {isModalOpen && selectedPatient && (
                <div style={styles.modalBackdrop} onClick={() => setIsModalOpen(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Prescriptions for {selectedPatient.name}</h3>
                            <button style={styles.closeButton} onClick={() => setIsModalOpen(false)}>&times;</button>
                        </div>
                        <table style={styles.modalTable}>
                            <thead>
                                <tr>
                                    <th style={styles.modalTableHeader}>Prescription ID</th>
                                    <th style={styles.modalTableHeader}>Date Issued</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedPatient.prescriptions.map((p) => (
                                    <tr key={p.id}>
                                        <td style={styles.modalTableCell}>
                                            <Link to={`/prescription/${p.id}`} style={styles.modalLink}>
                                                {p.id}
                                            </Link>
                                        </td>
                                        <td style={styles.modalTableCell}>
                                            {p.prescriptionDate.toDate().toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default DoctorDashboard;