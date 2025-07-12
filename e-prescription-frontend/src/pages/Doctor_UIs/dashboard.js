import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import onAuthStateChanged
import { db } from '../firebase'; // db is used to access Firestore

import logo from '../Main_Interface_UI/images/Logo01.png';
import { FaPhoneAlt } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterest, FaWhatsapp } from 'react-icons/fa';
import pic from '../Main_Interface_UI/images/Doctor.png';

const DoctorDashboard = () => {
    const auth = getAuth(); // Get the auth instance

    // State to manage the doctor's profile information
    const [firstName, setFirstName] = useState('Loading...');
    const [lastName, setLastName] = useState('');
    const [doctorPic, setDoctorPic] = useState(null); // Set to null initially
    const [loading, setLoading] = useState(true);

    // Use useEffect to fetch data from Firebase
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Fetch the user's document from the 'users' collection
                const docRef = doc(db, 'users', user.uid);
                try {
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        // Update state with firstName, lastName, and photoURL from Firestore
                        setFirstName(data.firstName || 'Dr. Unknown');
                        setLastName(data.lastName || '');
                        setDoctorPic(data.photoURL || pic); // Use default pic if none exists
                    } else {
                        console.log("No such document for the user!");
                        setFirstName("Dr. Not Found");
                        setDoctorPic(pic);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setFirstName("Error");
                    setDoctorPic(pic);
                }
            } else {
                // Handle case where user is not logged in
                setFirstName("Please Log In");
                setLastName("");
                setDoctorPic(pic);
            }
            setLoading(false);
        });

        // Clean up the subscription
        return () => unsubscribe();
    }, [auth]);

    // Function to get initials from a name
    const getInitials = (firstName, lastName) => {
      const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
      const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
      return `${firstInitial}${lastInitial}`;
    };

    // Consolidated Styles
    const styles = {
        navBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', backgroundColor: '#d7f3d2' },
        logoContainer: { display: 'flex', alignItems: 'center' },
        logo: { height: '50px', marginRight: '10px' },
        titleContainer: { display: 'flex', flexDirection: 'column' },
        title: { margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#333' },
        subtitle: { margin: 0, fontSize: '12px', color: '#777' },
        contactInfo: { display: 'flex', alignItems: 'center', marginRight: '20px', color: '#007bff' },
        homeButtonDiv: { padding: '10px 20px', border: '1px solid #ddd', borderRadius: '20px', backgroundColor: 'lightblue', color: '#007bff', cursor: 'pointer', display: 'flex', alignItems: 'center' },
        dashboardContainer: { display: 'flex', padding: '20px', fontFamily: 'sans-serif' },
        sidebar: { width: '200px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '5px', marginRight: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
        sidebarLink: { display: 'block', padding: '10px 0', color: '#333', textDecoration: 'none', borderBottom: '1px solid #eee', width: '100%', textAlign: 'center' },
        sidebarLinkActive: { color: '#007bff', fontWeight: 'bold' },
        doctorInfo: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px 0', borderTop: '1px solid #eee', backgroundColor: '#d7f3d2', padding: '10px', borderRadius: '5px', marginTop: '10px', width: '100%' },
        doctorAvatar: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#00cba9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5em', fontWeight: 'bold', marginBottom: '5px', objectFit: 'cover' },
        doctorName: { fontSize: '1em', color: '#555', margin: 0 },
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
                {/* Sidebar */}
                <aside style={styles.sidebar}>
                    <Link to="/dashboard" style={{ ...styles.sidebarLink, ...styles.sidebarLinkActive }}>Dashboard</Link>
                    <Link to="/newprescription" style={styles.sidebarLink}>Add New Prescription</Link>
                    <Link to="/prescriptionhistory" style={styles.sidebarLink}>Prescriptions</Link>
                    <Link to="/appointments" style={styles.sidebarLink}>Appointments</Link>
                    <Link to="/docprofile" style={styles.sidebarLink}>Settings</Link>

                    {/* Dynamic doctor info section */}
                    <div style={styles.doctorInfo}>
                        <div style={styles.doctorAvatar}>
                            {doctorPic ? (
                                <img src={doctorPic} alt="Doctor Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <span>{getInitials(firstName, lastName)}</span>
                            )}
                        </div>
                        <p style={styles.doctorName}>{`${firstName} ${lastName}`}</p>
                    </div>
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
            <footer style={styles.footer}>
                <div style={styles.footerContainer}>
                    <div style={styles.footerSection}>
                        <h3 style={styles.footerHeading}>Shop Matcha</h3>
                        <ul style={styles.list}>
                            <li style={styles.listItem}>Starter Kits</li>
                            <li style={styles.listItem}>Lattes & Sweetened</li>
                            <li style={styles.listItem}>Just the Matcha</li>
                            <li style={styles.listItem}>Matchaware</li>
                            <li style={styles.listItem}>Shop All</li>
                        </ul>
                    </div>
                    <div style={styles.footerSection}>
                        <h3 style={styles.footerHeading}>Learn</h3>
                        <ul style={styles.list}>
                            <li style={styles.listItem}>Our Story</li>
                            <li style={styles.listItem}>Matcha Recipes</li>
                            <li style={styles.listItem}>Caffeine Content</li>
                            <li style={styles.listItem}>Health Benefits</li>
                            <li style={styles.listItem}>FAQ's</li>
                        </ul>
                    </div>
                    <div style={styles.footerSection}>
                        <h3 style={styles.footerHeading}>More from Tenzo</h3>
                        <ul style={styles.list}>
                            <li style={styles.listItem}>Sign In</li>
                            <li style={styles.listItem}>Wholesale Opportunities</li>
                            <li style={styles.listItem}>Affiliate</li>
                            <li style={styles.listItem}>Contact Us</li>
                        </ul>
                    </div>
                    <div style={styles.followUs}>
                        <h3 style={styles.footerHeading}>Follow us</h3>
                        <div style={styles.socialIcon}>
                            <a href="#" style={styles.iconLink}><FaPinterest style={{ fontSize: '1.5em' }} /></a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={styles.iconLink}><FaFacebookF style={{ fontSize: '1.5em' }} /></a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={styles.iconLink}><FaInstagram style={{ fontSize: '1.5em' }} /></a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={styles.iconLink}><FaTwitter style={{ fontSize: '1.5em' }} /></a>
                            <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" style={styles.iconLink}><FaWhatsapp style={{ fontSize: '1.5em' }} /></a>
                        </div>
                    </div>
                </div>
                <div style={styles.bottomBar}>
                    <p style={styles.copyright}>© 2025 tenzotea.co</p>
                    <div style={styles.links}>
                        <a href="#" style={styles.bottomLink}>Terms of Service</a>
                        <span style={styles.separator}>|</span>
                        <a href="#" style={styles.bottomLink}>Privacy Policy</a>
                        <span style={styles.separator}>|</span>
                        <a href="#" style={styles.bottomLink}>Refund Policy</a>
                        <span style={styles.separator}>|</span>
                        <a href="#" style={styles.bottomLink}>Accessibility Policy</a>
                    </div>
                </div>
            </footer>
            <div style={{ backgroundColor: '#111', color: '#ddd', textAlign: 'center', padding: '10px' }}>
                <p>© 2025 MediPrescribe. All rights reserved.</p>
            </div>
        </div>
    );
};

export default DoctorDashboard;