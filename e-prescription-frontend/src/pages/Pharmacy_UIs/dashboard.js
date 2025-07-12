import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faClipboardList, faUsers, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { FaPhoneAlt, FaPinterest, FaFacebookF, FaInstagram, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import logo from '../Main_Interface_UI/images/Logo01.png';
import pic from './Images/phar01.jpg'; // Path for pharmacist profile picture
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

// --- Mock Styles (move to a CSS file for production) ---
const navBarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 50px',
    backgroundColor: '#d7f3d2',
};
const logoContainerStyle = { display: 'flex', alignItems: 'center' };
const logoStyle = { height: '50px', marginRight: '10px' };
const titleContainerStyle = { display: 'flex', flexDirection: 'column' };
const titleStyle = { margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#333' };
const subtitleStyle = { margin: 0, fontSize: '12px', color: '#777' };
const contactInfoStyle = { display: 'flex', alignItems: 'center', marginRight: '20px', color: '#007bff' };
const homeButtonDivStyle = { padding: '10px 20px', border: '1px solid #ddd', borderRadius: '20px', backgroundColor: 'lightblue', color: '#007bff', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const dashboardContainerStyle = { display: 'flex', padding: '20px', fontFamily: 'sans-serif' };
const sidebarStyle = { width: '200px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '5px', marginRight: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const sidebarLinkStyle = { display: 'block', padding: '10px 0', color: '#333', textDecoration: 'none', borderBottom: '1px solid #eee', width: '100%', textAlign: 'center' };
const sidebarLinkActiveStyle = { color: '#007bff', fontWeight: 'bold' };
const doctorInfoStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px 0', borderTop: '1px solid #eee', backgroundColor: '#d7f3d2', padding: '10px', borderRadius: '5px', marginTop: '10px', width: '100%' };
const doctorAvatarStyle = { width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' };
const doctorNameStyle = { fontSize: '1em', color: '#555', margin: 0 };
const mainContentStyle = { flexGrow: 1, padding: '20px', maxWidth: '1200px', margin: '0 auto' };
const scanButtonStyle = {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontSize: '1em',
    gap: '5px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

// --- New Table Styles ---
const tableContainerStyle = { marginTop: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '20px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const thStyle = { padding: '12px 15px', borderBottom: '2px solid #ddd', fontSize: '0.9em', color: '#555' };
const tdStyle = { padding: '12px 15px', borderBottom: '1px solid #eee', fontSize: '0.9em' };
const statusIssuedStyle = { color: 'white', backgroundColor: '#28a745', padding: '5px 10px', borderRadius: '50px', fontSize: '0.8em', display: 'inline-block' };
const statusPartialStyle = { color: 'white', backgroundColor: '#ffc107', padding: '5px 10px', borderRadius: '50px', fontSize: '0.8em', display: 'inline-block' };
const viewButtonStyle = { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', textDecoration: 'none' };
const noDataStyle = { textAlign: 'center', color: '#888', padding: '40px' };

// --- Footer Styles (consolidated) ---
const footerStyle = { backgroundColor: '#d7f3d2', padding: '20px', marginTop: '20px' };
const footerContainerStyle = { display: 'flex', justifyContent: 'space-around', paddingBottom: '20px' };
const sectionStyle = { display: 'flex', flexDirection: 'column' };
const headingStyle = { fontSize: '1.2em', marginBottom: '10px', color: '#333' };
const listStyle = { listStyle: 'none', padding: 0, margin: 0 };
const listItemStyle = { marginBottom: '10px', color: '#555' };
const followUsStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
const socialIconStyle = { display: 'flex' };
const iconLinkStyle = { marginRight: '10px', textDecoration: 'none', color: '#333' };
const bottomBarStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #ccc' };
const copyrightStyle = { fontSize: '0.8em', color: '#777' };
const linksStyle = { display: 'flex' };
const bottomLinkStyle = { textDecoration: 'none', color: '#555', marginLeft: '10px', marginRight: '10px' };
const separatorStyle = { color: '#777' };
const secondaryFooterStyle = { backgroundColor: '#111', color: '#ddd', textAlign: 'center', padding: '10px' };

function AppNavbar() {
    return (
        <header style={navBarStyle}>
            <div style={logoContainerStyle}>
                <img src={logo} alt="E-Prescribe Logo" style={logoStyle} />
                <div style={titleContainerStyle}>
                    <h1 style={titleStyle}>MediPrescribe</h1>
                    <p style={subtitleStyle}>Your Digital Healthcare Solution</p>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={contactInfoStyle}>
                    <FaPhoneAlt style={{ marginRight: '5px' }} />
                    <span>+94 (011) 519-51919</span>
                </div>
                <Link to="/signin" style={{ textDecoration: 'none' }}>
                    <div style={homeButtonDivStyle}>
                        <span>Logout</span>
                        <IoIosArrowForward style={{ marginLeft: '5px' }} />
                    </div>
                </Link>
            </div>
        </header>
    );
}

function Sidebar() {
    return (
        <aside style={sidebarStyle}>
            <Link to="/pharmacy/dashboard" style={{ ...sidebarLinkStyle, ...sidebarLinkActiveStyle }}>Dashboard</Link>
            <Link to="/pharmacy/history" style={sidebarLinkStyle}>Prescription History</Link>
            <Link to="/pharmacy/settings" style={sidebarLinkStyle}>Settings</Link>
            <div style={doctorInfoStyle}>
                <img src={pic} alt="Pharmacist Avatar" style={doctorAvatarStyle} />
                <p style={doctorNameStyle}>Saman Serasingha</p>
            </div>
        </aside>
    );
}

function AppFooter() {
    return (
        <>
            <footer style={footerStyle}>
                <div style={footerContainerStyle}>
                    <div style={sectionStyle}>
                        <h3 style={headingStyle}>About Us</h3>
                        <ul style={listStyle}>
                            <li style={listItemStyle}>Our Story</li>
                            <li style={listItemStyle}>Contact Us</li>
                            <li style={listItemStyle}>Our Team</li>
                        </ul>
                    </div>
                    <div style={sectionStyle}>
                        <h3 style={headingStyle}>Services</h3>
                        <ul style={listStyle}>
                            <li style={listItemStyle}>E-Prescriptions</li>
                            <li style={listItemStyle}>Patient Records</li>
                            <li style={listItemStyle}>Appointments</li>
                        </ul>
                    </div>
                    <div style={sectionStyle}>
                        <h3 style={headingStyle}>Legal</h3>
                        <ul style={listStyle}>
                            <li style={listItemStyle}>Privacy Policy</li>
                            <li style={listItemStyle}>Terms of Service</li>
                            <li style={listItemStyle}>Saman Serasingha</li>
                        </ul>
                    </div>
                    <div style={followUsStyle}>
                        <h3 style={headingStyle}>Follow us</h3>
                        <div style={socialIconStyle}>
                            <a href="#" style={iconLinkStyle}><FaPinterest style={{ fontSize: '1.5em' }} /></a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><FaFacebookF style={{ fontSize: '1.5em' }} /></a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><FaInstagram style={{ fontSize: '1.5em' }} /></a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><FaTwitter style={{ fontSize: '1.5em' }} /></a>
                            <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><FaWhatsapp style={{ fontSize: '1.5em' }} /></a>
                        </div>
                    </div>
                </div>
                <div style={bottomBarStyle}>
                    <p style={copyrightStyle}>&copy; 2025 MediPrescribe. All Rights Reserved.</p>
                    <div style={linksStyle}>
                        <a href="#" style={bottomLinkStyle}>Home</a>
                        <span style={separatorStyle}>|</span>
                        <a href="#" style={bottomLinkStyle}>About</a>
                        <span style={separatorStyle}>|</span>
                        <a href="#" style={bottomLinkStyle}>Services</a>
                    </div>
                </div>
            </footer>
        </>
    );
}

function PharmacyDashboard() {
    const navigate = useNavigate();
    const auth = getAuth();

    const [issuedPrescriptions, setIssuedPrescriptions] = useState([]);
    const [loadingPrescriptions, setLoadingPrescriptions] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    // Placeholder for pharmacist name. In a real app, this would come from auth or a profile document.
    const currentPharmacistName = "Saman Serasingha"; 

    useEffect(() => {
        const fetchIssuedPrescriptions = async () => {
            setLoadingPrescriptions(true);
            setFetchError(null);
            
            try {
                // Get a reference to the 'prescriptions' collection
                const prescriptionsRef = collection(db, 'prescriptions');
                
                // Query for prescriptions that are either 'Issued' or 'partially_issued'
                const q = query(
                    prescriptionsRef,
                    where('status', 'in', ['Issued', 'partially_issued'])
                );

                const querySnapshot = await getDocs(q);
                const fetchedPrescriptions = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    // Filter prescriptions based on the pharmacist name in the issueHistory array
                    const issuedByThisPharmacist = data.issueHistory?.some(
                        (history) => history.issuedBy === currentPharmacistName
                    );

                    if (issuedByThisPharmacist) {
                        fetchedPrescriptions.push({ id: doc.id, ...data });
                    }
                });

                setIssuedPrescriptions(fetchedPrescriptions);
            } catch (err) {
                console.error("Error fetching issued prescriptions:", err);
                setFetchError("Failed to load prescription history. Please try again.");
            } finally {
                setLoadingPrescriptions(false);
            }
        };

        fetchIssuedPrescriptions();
    }, [currentPharmacistName]);

    const handleScanClick = () => {
        navigate('/pharmacy/qr-scan');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'sans-serif' }}>
            <AppNavbar />
            <div style={dashboardContainerStyle}>
                <Sidebar />
                <div style={mainContentStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h1>Pharmacy Dashboard</h1>
                        <button onClick={handleScanClick} style={scanButtonStyle}>
                            <FontAwesomeIcon icon={faCalendarDay} />&nbsp;Scan New Prescription
                        </button>
                    </div>

                    <div style={tableContainerStyle}>
                        <h2>My Issued Prescriptions</h2>
                        {loadingPrescriptions && <div style={noDataStyle}>Loading history...</div>}
                        {fetchError && <div style={{...noDataStyle, color: 'red'}}>{fetchError}</div>}
                        
                        {!loadingPrescriptions && issuedPrescriptions.length === 0 && (
                            <div style={noDataStyle}>You have not issued any prescriptions yet.</div>
                        )}

                        {!loadingPrescriptions && issuedPrescriptions.length > 0 && (
                            <table style={tableStyle}>
                                <thead>
                                    <tr>
                                        <th style={thStyle}>Date Issued</th>
                                        <th style={thStyle}>Patient Name</th>
                                        <th style={thStyle}>Status</th>
                                        <th style={thStyle}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {issuedPrescriptions.map((prescription) => (
                                        <tr key={prescription.id}>
                                            <td style={tdStyle}>{prescription.issueHistory[0]?.issuedAt?.toDate().toLocaleDateString()}</td>
                                            <td style={tdStyle}>{prescription.patientName}</td>
                                            <td style={tdStyle}>
                                                <span style={prescription.status === 'Issued' ? statusIssuedStyle : statusPartialStyle}>
                                                    {prescription.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>
                                                <Link to={`/pharmacy/view/${prescription.id}`} style={viewButtonStyle}>
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
            <AppFooter />
        </div>
    );
}

export default PharmacyDashboard;