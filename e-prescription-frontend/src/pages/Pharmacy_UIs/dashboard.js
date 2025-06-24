import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCalendarDay,faClipboardList,faUsers,faCog,faSignOutAlt,} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaPinterest, FaFacebookF, FaInstagram, FaTwitter, FaWhatsapp } from 'react-icons/fa'; // Import social icons
import { IoIosArrowForward } from 'react-icons/io';
import logo from '../Main_Interface_UI/images/Logo01.png';// Assuming the logo path
import pic from './Images/phar01.jpg'

// --- Mock Data (replaces data.js) ---
const todaysScans = [
  {
    id: 1,
    patientName: 'Emily Carter',
    patientAvatar: 'https://i.imgur.com/gK9Jd2P.png', // Placeholder image
    prescription: 'Amoxicillin 500mg',
    doctor: 'Dr. Evan Parker',
    scannedAt: 'May 24, 2025, 09:20',
    status: 'Pending',
  },
  {
    id: 2,
    patientName: 'Marcus Lee',
    patientAvatar: 'https://i.imgur.com/gK9Jd2P.png', // Placeholder image
    prescription: 'Ibuprofen 200mg',
    doctor: 'Dr. Alina Kim',
    scannedAt: 'May 24, 2025, 10:02',
    status: 'Issued',
  },
  {
    id: 3,
    patientName: 'Fatima Aziz',
    patientAvatar: 'https://i.imgur.com/gK9Jd2P.png', // Placeholder image
    prescription: 'Paracetamol 500mg',
    doctor: 'Dr. Lena Wong',
    scannedAt: 'May 24, 2025, 11:17',
    status: 'Pending',
  },
];

const prescriptionHistory = [
  {
    id: 1,
    patientName: 'Sophia Turner',
    patientAvatar: 'https://i.imgur.com/gK9Jd2P.png', // Placeholder image
    medication: 'Atorvastatin 10mg',
    doctor: 'Dr. Niall Patel',
    issuedDate: 'May 23, 2025',
    status: 'Issued',
  },
  {
    id: 2,
    patientName: "James O'Neil",
    patientAvatar: 'https://i.imgur.com/gK9Jd2P.png', // Placeholder image
    medication: 'Metformin 500mg',
    doctor: 'Dr. Aisha Bello',
    issuedDate: 'May 22, 2025',
    status: 'Issued',
  },
  {
    id: 3,
    patientName: 'Liang Chen',
    patientAvatar: 'https://i.imgur.com/gK9Jd2P.png', // Placeholder image
    medication: 'Omeprazole 20mg',
    doctor: 'Dr. Sofia Rossi',
    issuedDate: 'May 19, 2025',
    status: 'Issued',
  },
];

const navBarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 50px',
    backgroundColor: '#d7f3d2',
  };

  const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
  };

  const logoStyle = {
    height: '50px',
    marginRight: '10px',
  };

  const titleContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
  };

  const titleStyle = {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
  };

  const subtitleStyle = {
    margin: 0,
    fontSize: '12px',
    color: '#777',
  };

  const contactInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    marginRight: '20px',
    color: '#007bff',
  };

    const homeButtonStyle = {
    textDecoration: 'none',
  };

  const homeButtonDivStyle = {
    padding: '10px 20px',
    border: '1px solid #ddd',
    borderRadius: '20px',
    backgroundColor: 'lightblue',
    color: '#007bff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  };

  const footerStyle = {
    backgroundColor: '#d7f3d2',
    padding: '20px',
    marginTop: '20px',
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    paddingBottom: '20px',
  };

  const sectionStyle = {
    display: 'flex',
    flexDirection: 'column',
  };

  const headingStyle = {
    fontSize: '1.2em',
    marginBottom: '10px',
    color: '#333',
  };

  const listStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  };

  const listItemStyle = {
    marginBottom: '10px',
    color: '#555',
  };

  const followUsStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const socialIconStyle = {
    display: 'flex',
  };

  const iconLinkStyle = {
    marginRight: '10px',
    textDecoration: 'none',
    color: '#333',
  };

  const bottomBarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '10px',
    borderTop: '1px solid #ccc',
  };

  const copyrightStyle = {
    fontSize: '0.8em',
    color: '#777',
  };

  const linksStyle = {
    display: 'flex',
  };

  // Define these missing styles
  const bottomLinkStyle = {
    textDecoration: 'none',
    color: '#555',
    marginLeft: '10px',
    marginRight: '10px',
  };

  const separatorStyle = {
    color: '#777',
  };

  const dashboardContainerStyle = {
    display: 'flex',
    padding: '20px',
    fontFamily: 'sans-serif',
  };

  const sidebarStyle = {
    width: '200px',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '5px',
    marginRight: '20px',
  };

  const sidebarLinkStyle = {
    display: 'block',
    padding: '10px 0',
    color: '#333',
    textDecoration: 'none',
    borderBottom: '1px solid #eee',
  };

  const sidebarLinkActiveStyle = {
    color: '#007bff',
    fontWeight: 'bold',
  };

  const doctorInfoContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '15px 0',
    borderTop: '1px solid #eee',
  };

  const doctorAvatarStyle = {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#00cba9', // Example fixed color
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5em',
    fontWeight: 'bold',
    marginBottom: '5px',
  };

  const doctorNameStyle = {
    fontSize: '1em',
    color: '#555',
    margin: 0,
  };

  const doctorInfoStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '15px 0',
    borderTop: '1px solid #eee',
    backgroundColor: '#d7f3d2', // Another example fixed color (aliceblue)
    padding: '10px',
    borderRadius: '5px',
    margin: '10px 0',
  };





// This component now returns the JSX for the navbar
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
        <Link to="/signin" style={{ textDecoration: 'none' }}> {/* Use Link */}
          <div style={homeButtonDivStyle}>
            <span>Logout</span>
            <IoIosArrowForward style={{ marginLeft: '5px' }} />
          </div>
        </Link>
      </div>
    </header>
  );
}

// --- Sidebar Component ---
function Sidebar() {
  return (
    <div style={dashboardContainerStyle}>
            {/* Sidebar */}
            <aside style={sidebarStyle}>
              <Link to="/dashboard" style={{ ...sidebarLinkStyle, ...sidebarLinkActiveStyle }}>Dashboard</Link>
              <Link to="/newprescription" style={sidebarLinkStyle}>Add New Prescription</Link>
              <Link to="/prescriptionhistory" style={sidebarLinkStyle}>Prescriptions</Link>
              <Link to="/appointments" style={sidebarLinkStyle}>Appointments</Link>
              <Link to="/settings" style={sidebarLinkStyle}>Settings</Link>
    
              <div style={doctorInfoStyle}>
                <div style={doctorAvatarStyle}>
                  <img src={pic} alt="Doctor Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                </div>
                <p style={doctorNameStyle}>Saman Serasingha</p> {/* Replace with actual doctor name */}
              </div>
            </aside>
            </div>
  );
}

// --- TodaysScannedPrescriptions Component ---
function TodaysScannedPrescriptions({ data }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return { backgroundColor: '#ffc107', color: '#333' }; // Yellow for pending
      case 'Issued':
        return { backgroundColor: '#28a745', color: 'white' }; // Green for issued
      default:
        return {};
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '20px',
      }}
    >
      <h3 style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', color: '#333' }}>
        <FontAwesomeIcon icon={faCalendarDay} style={{ marginRight: '10px' }} />
        Today's Scanned Prescriptions
      </h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
            <th style={{ padding: '12px', textAlign: 'left' }}>#</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Patient</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Prescription</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Doctor</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Scanned At</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '12px', textAlign: 'left' }}></th> {/* For View button */}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>{index + 1}</td>
              <td style={{ padding: '12px', display: 'flex', alignItems: 'center' }}>
                <img
                  src={item.patientAvatar}
                  alt={item.patientName}
                  style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }}
                />
                {item.patientName}
              </td>
              <td style={{ padding: '12px' }}>
                <span
                  style={{
                    backgroundColor: '#e9ecef',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    fontSize: '0.9em',
                  }}
                >
                  {item.prescription}
                </span>
              </td>
              <td style={{ padding: '12px' }}>{item.doctor}</td>
              <td style={{ padding: '12px' }}>{item.scannedAt}</td>
              <td style={{ padding: '12px' }}>
                <span
                  style={{
                    padding: '5px 10px',
                    borderRadius: '15px',
                    fontSize: '0.85em',
                    fontWeight: 'bold',
                    ...getStatusStyle(item.status),
                  }}
                >
                  {item.status}
                </span>
              </td>
              <td style={{ padding: '12px' }}>
                <button
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ color: '#6c757d', fontSize: '0.9em' }}>
        Showing {data.length} prescriptions scanned today.
      </p>
    </div>
  );
}

// --- PrescriptionHistory Component ---
function PrescriptionHistory({ data }) {
  const getStatusStyle = (status) => {
    // History typically only shows 'Issued'
    return { backgroundColor: '#28a745', color: 'white' }; // Green for issued
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '20px',
      }}
    >
      <h3 style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', color: '#333' }}>
        <FontAwesomeIcon icon={faClipboardList} style={{ marginRight: '10px' }} />
        Prescription History
      </h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
            <th style={{ padding: '12px', textAlign: 'left' }}>#</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Patient</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Medication</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Doctor</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Issued Date</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '12px', textAlign: 'left' }}></th> {/* For View button */}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>{index + 1}</td>
              <td style={{ padding: '12px', display: 'flex', alignItems: 'center' }}>
                <img
                  src={item.patientAvatar}
                  alt={item.patientName}
                  style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }}
                />
                {item.patientName}
              </td>
              <td style={{ padding: '12px' }}>
                <span
                  style={{
                    backgroundColor: '#e9ecef',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    fontSize: '0.9em',
                  }}
                >
                  {item.medication}
                </span>
              </td>
              <td style={{ padding: '12px' }}>{item.doctor}</td>
              <td style={{ padding: '12px' }}>{item.issuedDate}</td>
              <td style={{ padding: '12px' }}>
                <span
                  style={{
                    padding: '5px 10px',
                    borderRadius: '15px',
                    fontSize: '0.85em',
                    fontWeight: 'bold',
                    ...getStatusStyle(item.status),
                  }}
                >
                  {item.status}
                </span>
              </td>
              <td style={{ padding: '12px' }}>
                <button
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ color: '#6c757d', fontSize: '0.9em' }}>
        Showing last {data.length} issued prescriptions.
      </p>
    </div>
  );
}

// Renamed for clarity and to follow React component naming conventions
function AppFooter() {
  return (
    <> {/* Use a React Fragment to wrap multiple top-level elements */}
      <footer style={footerStyle}>
        <div style={containerStyle}>
          <div style={sectionStyle}>
            <h3 style={headingStyle}>Shop Matcha</h3>
            <ul style={listStyle}>
              <li style={listItemStyle}>Starter Kits</li>
              <li style={listItemStyle}>Lattes & Sweetened</li>
              <li style={listItemStyle}>Just the Matcha</li>
              <li style={listItemStyle}>Matchaware</li>
              <li style={listItemStyle}>Shop All</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h3 style={headingStyle}>Learn</h3>
            <ul style={listStyle}>
              <li style={listItemStyle}>Our Story</li>
              <li style={listItemStyle}>Matcha Recipes</li>
              <li style={listItemStyle}>Caffeine Content</li>
              <li style={listItemStyle}>Health Benefits</li>
              <li style={listItemStyle}>FAQ's</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h3 style={headingStyle}>More from Tenzo</h3>
            <ul style={listStyle}>
              <li style={listItemStyle}>Sign In</li>
              <li style={listItemStyle}>Wholesale Opportunities</li>
              <li style={listItemStyle}>Affiliate</li>
              <li style={listItemStyle}>Contact Us</li>
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
          <p style={copyrightStyle}>© 2025 tenzotea.co</p>
          <div style={linksStyle}>
            <a href="#" style={bottomLinkStyle}>Terms of Service</a>
            <span style={separatorStyle}>|</span>
            <a href="#" style={bottomLinkStyle}>Privacy Policy</a>
            <span style={separatorStyle}>|</span>
            <a href="#" style={bottomLinkStyle}>Refund Policy</a>
            <span style={separatorStyle}>|</span>
            <a href="#" style={bottomLinkStyle}>Accessibility Policy</a>
          </div>
        </div>
      </footer>
      <div style={{ backgroundColor: '#111', color: '#ddd', textAlign: 'center', padding: '10px' }}>
        <p>© 2025 MediPrescribe. All rights reserved.</p>
      </div>
    </>
  );
}

// --- Main App Component ---
function App() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      fontFamily: 'sans-serif' // Apply font-family here
    }}>
      {/* Include the AppNavbar component here */}
      <AppNavbar />

      <div style={{ display: 'flex', flexGrow: 1 }}>
        <Sidebar />
        <div style={{ flexGrow: 1, padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <button
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span style={{ marginRight: '5px' }}>+</span> Scan Another
            </button>
          </div>
          <TodaysScannedPrescriptions data={todaysScans} />
          <div style={{ marginTop: '30px' }}>
            <PrescriptionHistory data={prescriptionHistory} />
          </div>
        </div>
      </div>
      {/* Include the AppFooter component here */}
      <AppFooter />
    </div>
  );
}

export default App;