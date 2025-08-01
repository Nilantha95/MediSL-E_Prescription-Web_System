import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../firebase';

import logo from '../Main_Interface_UI/images/Logo01.png';
import { FaPhoneAlt } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import { Link } from 'react-router-dom';
import {FaUserMd, FaPrescriptionBottleAlt, FaHistory, FaHome } from 'react-icons/fa';
import pic from '../Main_Interface_UI/images/Doctor.png';
import Footer from '../Main_Interface_UI/Footer';


const DoctorDashboard = () => {
    const auth = getAuth();

    const [doctorData, setDoctorData] = useState({
        firstName: 'Loading...',
        lastName: '',
        email: '',
        userType: '',
        photoURL: null,
    });
    const [loading, setLoading] = useState(true);

    // Header and Logout Button Hover State
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

    // Responsive style utility function
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
                        setDoctorData({
                            firstName: data.firstName || 'Dr. Unknown',
                            lastName: data.lastName || '',
                            email: user.email || '',
                            userType: data.userType || 'Doctor',
                            photoURL: data.photoURL || pic,
                        });
                    } else {
                        console.log("No such document for the user!");
                        setDoctorData(prev => ({ ...prev, firstName: "Dr. Not Found", photoURL: pic }));
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setDoctorData(prev => ({ ...prev, firstName: "Error", photoURL: pic }));
                }
            } else {
                setDoctorData({ firstName: "Please Log In", lastName: "", email: "", userType: "", photoURL: pic });
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

    const styles = {
        // --- Header Styles ---
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

        // Original styles (from your uploaded file) preserved below
        dashboardContainer: {
            display: 'flex',
            padding: '20px',
            fontFamily: 'sans-serif'
        },
        sidebar: {
            width: '250px',
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '5px',
            marginRight: '20px',
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
        content: { flexGrow: 1, padding: '20px', backgroundColor: '#fff', borderRadius: '5px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)' },
        dashboardHeader: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '20px' },
        headerCard: { backgroundColor: '#e9ecef', padding: '15px', borderRadius: '5px', textAlign: 'center' },
        headerCardTitle: { fontSize: '1em', color: '#6c757d', marginBottom: '5px' },
        headerCardValue: { fontSize: '1.5em', fontWeight: 'bold', color: '#343a40' },
        recentPrescriptions: { marginBottom: '20px', border: '1px solid #ddd', borderRadius: '5px', padding: '15px', backgroundColor: '#f8f9fa' },
        recentPrescriptionsTable: { width: '100%', borderCollapse: 'collapse' },
        recentPrescriptionsTableHeader: { backgroundColor: '#eee', padding: '8px', textAlign: 'left', borderBottom: '1px solid #ccc' },
        recentPrescriptionsTableRow: { borderBottom: '1px solid #eee' },
        recentPrescriptionsTableCell: { padding: '8px', textAlign: 'left' },
        recentPatients: { border: '1px solid #ddd', borderRadius: '5px', padding: '15px', backgroundColor: '#f8f9fa' },
        recentPatientsList: { display: 'flex', gap: '20px', listStyle: 'none', padding: 0, margin: 0 },
        recentPatientCard: { border: '1px solid #ccc', borderRadius: '5px', padding: '10px', textAlign: 'center' },
        patientAvatar: { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#007bff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 10px 0 0', textAlign: 'center' },
        patientName: { fontSize: '1em', fontWeight: 'bold', marginBottom: '5px' },
        patientVisit: { fontSize: '0.8em', color: '#6c757d', marginBottom: '10px' },
        newPrescriptionButton: { backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', padding: '8px 15px', cursor: 'pointer', fontSize: '0.9em' },
        viewHistoryButtonStyle: { backgroundColor: 'transparent', color: '#007bff', border: '1px solid #007bff', borderRadius: '5px', padding: '8px 15px', cursor: 'pointer', fontSize: '0.9em', marginRight: '5px' },
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
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading profile...</div>;
    }

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
                {/* Sidebar - Updated with new design */}
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
                    <Link to="/doctor/dashboard" style={{ ...styles.sidebarLink, ...styles.sidebarLinkActive }}><FaHome style={styles.sidebarIcon} />Dashboard</Link>
                    <Link to="/newprescription" style={styles.sidebarLink}><FaPrescriptionBottleAlt style={styles.sidebarIcon} />Create New Prescription</Link>
                    <Link to="/prescriptionhistory" style={styles.sidebarLink}><FaHistory style={styles.sidebarIcon} />Prescriptions</Link>
                    <Link to="/docprofile" style={styles.sidebarLink}><FaUserMd style={styles.sidebarIcon} />Profile</Link>
                </aside>

                {/* Main Content */}
                <main style={styles.content}>
                    <div style={styles.dashboardHeader}>
                        <div style={styles.headerCard}>
                            <p style={styles.headerCardTitle}>Total Patients</p>
                            <p style={styles.headerCardValue}>1,234</p>
                        </div>
                        <div style={styles.headerCard}>
                            <p style={styles.headerCardTitle}>Prescriptions</p>
                            <p style={styles.headerCardValue}>856</p>
                        </div>
                        <div style={styles.headerCard}>
                            <p style={styles.headerCardTitle}>Today's Appointments</p>
                            <p style={styles.headerCardValue}>12</p>
                        </div>
                        <div style={styles.headerCard}>
                            <p style={styles.headerCardTitle}>Pending Reviews</p>
                            <p style={styles.headerCardValue}>8</p>
                        </div>
                    </div>

                    <div style={styles.recentPrescriptions}>
                        <h2>Recent Prescriptions</h2>
                        <table style={styles.recentPrescriptionsTable}>
                            <thead>
                                <tr>
                                    <th style={styles.recentPrescriptionsTableHeader}>Patient</th>
                                    <th style={styles.recentPrescriptionsTableHeader}>Date</th>
                                    <th style={styles.recentPrescriptionsTableHeader}>Status</th>
                                    <th style={styles.recentPrescriptionsTableHeader}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={styles.recentPrescriptionsTableRow}>
                                    <td style={styles.recentPrescriptionsTableCell}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                                            <div style={styles.patientAvatar}>JD</div>
                                            <span style={{ marginLeft: '10px' }}>John Doe</span>
                                        </div>
                                    </td>
                                    <td style={styles.recentPrescriptionsTableCell}>Apr 27, 2025</td>
                                    <td style={styles.recentPrescriptionsTableCell}>Filled</td>
                                    <td style={styles.recentPrescriptionsTableCell}>...</td>
                                </tr>
                                <tr style={styles.recentPrescriptionsTableRow}>
                                    <td style={styles.recentPrescriptionsTableCell}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                                            <div style={{ ...styles.patientAvatar, backgroundColor: '#fd7e14' }}>JS</div>
                                            <span style={{ marginLeft: '10px' }}>Jane Smith</span>
                                        </div>
                                    </td>
                                    <td style={styles.recentPrescriptionsTableCell}>Apr 26, 2025</td>
                                    <td style={styles.recentPrescriptionsTableCell}>Pending</td>
                                    <td style={styles.recentPrescriptionsTableCell}>...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div style={styles.recentPatients}>
                        <h2>Recent Patients</h2>
                        <ul style={styles.recentPatientsList}>
                            <li style={styles.recentPatientCard}>
                                <div style={{ ...styles.patientAvatar, backgroundColor: '#6f42c1' }}>RJ</div>
                                <p style={styles.patientName}>Robert Johnson</p>
                                <p style={styles.patientVisit}>Last visit: Apr 25, 2025</p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                                    <button style={styles.viewHistoryButtonStyle}>View History</button>
                                    <button style={styles.newPrescriptionButton}>New Prescription</button>
                                </div>
                            </li>
                            <li style={styles.recentPatientCard}>
                                <div style={{ ...styles.patientAvatar, backgroundColor: '#dc3545' }}>MW</div>
                                <p style={styles.patientName}>Mary Williams</p>
                                <p style={styles.patientVisit}>Last visit: Apr 24, 2025</p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                                    <button style={styles.viewHistoryButtonStyle}>View History</button>
                                    <button style={styles.newPrescriptionButton}>New Prescription</button>
                                </div>
                            </li>
                            <li style={styles.recentPatientCard}>
                                <div style={{ ...styles.patientAvatar, backgroundColor: '#198754' }}>DB</div>
                                <p style={styles.patientName}>David Brown</p>
                                <p style={styles.patientVisit}>Last visit: Apr 23, 2025</p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                                    <button style={styles.viewHistoryButtonStyle}>View History</button>
                                    <button style={styles.newPrescriptionButton}>New Prescription</button>
                                </div>
                            </li>
                        </ul>
                    </div>
                </main>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default DoctorDashboard;