import React, { useState } from 'react';
import logo from '../Main_Interface_UI/images/Logo01.png';// Assuming the logo path
import pic from '../Main_Interface_UI/images/Doctor.png'
import { FaPhoneAlt } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterest, FaWhatsapp} from 'react-icons/fa';

const DoctorDashboard = () => {

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

  const contentStyle = {
    flexGrow: 1,
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '5px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)',
  };

  const dashboardHeaderStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  };

  const headerCardStyle = {
    backgroundColor: '#e9ecef',
    padding: '15px',
    borderRadius: '5px',
    textAlign: 'center',
  };

  const headerCardTitleStyle = {
    fontSize: '1em',
    color: '#6c757d',
    marginBottom: '5px',
  };

  const headerCardValueStyle = {
    fontSize: '1.5em',
    fontWeight: 'bold',
    color: '#343a40',
  };

  const recentPrescriptionsStyle = {
    marginBottom: '20px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
  };

  const recentPrescriptionsTableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const recentPrescriptionsTableHeaderStyle = {
    backgroundColor: '#eee',
    padding: '8px',
    textAlign: 'left',
    borderBottom: '1px solid #ccc',
  };

  const recentPrescriptionsTableRowStyle = {
    borderBottom: '1px solid #eee',
  };

  const recentPrescriptionsTableCellStyle = {
    padding: '8px',
    textAlign: 'left', // Add this line
  };

  const recentPatientsStyle = {
    border: '1px solid #ddd',
    borderRadius: '5px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
  };

  const recentPatientsListStyle = {
    display: 'flex',
    gap: '20px',
    listStyle: 'none',
    padding: 0,
    margin: 0,
  };

  const recentPatientCardStyle = {
    border: '1px solid #ccc',
    borderRadius: '5px',
    padding: '10px',
    textAlign: 'center',
  };

  const patientAvatarStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#007bff',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 10px 0 0', // Adjust margin to the right of the avatar
    textAlign: 'center', // Keep this to center single-line text if needed as a fallback
  };

  const patientNameStyle = {
    fontSize: '1em',
    fontWeight: 'bold',
    marginBottom: '5px',
  };

  const patientVisitStyle = {
    fontSize: '0.8em',
    color: '#6c757d',
    marginBottom: '10px',
  };

  const newPrescriptionButtonStyle = {
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    padding: '8px 15px',
    cursor: 'pointer',
    fontSize: '0.9em',
  };

  const viewHistoryButtonStyle = {
    backgroundColor: 'transparent',
    color: '#007bff',
    border: '1px solid #007bff',
    borderRadius: '5px',
    padding: '8px 15px',
    cursor: 'pointer',
    fontSize: '0.9em',
    marginRight: '5px',
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

  const bottomLinkStyle = {
    color: '#555',
    textDecoration: 'none',
    fontSize: '0.8em',
    marginRight: '10px',
  };

  const separatorStyle = {
    color: '#ccc',
    marginRight: '10px',
  };


return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {/* Navigation Bar */}
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

      {/* Dashboard Content */}
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
            <p style={doctorNameStyle}>Dr. John Smith</p> {/* Replace with actual doctor name */}
          </div>
        </aside>

        {/* Main Content */}
        <main style={contentStyle}>
          <div style={dashboardHeaderStyle}>
            <div style={headerCardStyle}>
              <p style={headerCardTitleStyle}>Total Patients</p>
              <p style={headerCardValueStyle}>1,234</p>
            </div>
            <div style={headerCardStyle}>
              <p style={headerCardTitleStyle}>Prescriptions</p>
              <p style={headerCardValueStyle}>856</p>
            </div>
            <div style={headerCardStyle}>
              <p style={headerCardTitleStyle}>Today's Appointments</p>
              <p style={headerCardValueStyle}>12</p>
            </div>
            <div style={headerCardStyle}>
              <p style={headerCardTitleStyle}>Pending Reviews</p>
              <p style={headerCardValueStyle}>8</p>
            </div>
          </div>

          <div style={recentPrescriptionsStyle}>
            <h2>Recent Prescriptions</h2>
            <table style={recentPrescriptionsTableStyle}>
              <thead>
                <tr>
                  <th style={recentPrescriptionsTableHeaderStyle}>Patient</th>
                  <th style={recentPrescriptionsTableHeaderStyle}>Date</th>
                  <th style={recentPrescriptionsTableHeaderStyle}>Status</th>
                  <th style={recentPrescriptionsTableHeaderStyle}>Actions</th>
                </tr>
              </thead>
               <tbody>
                    <tr style={recentPrescriptionsTableRowStyle}>
                       <td style={recentPrescriptionsTableCellStyle}>
                         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                      <div style={patientAvatarStyle}>JD</div>
                         <span style={{ marginLeft: '10px' }}>John Doe</span>
                     </div>
                     </td>
                        <td style={recentPrescriptionsTableCellStyle}>Apr 27, 2025</td>
                        <td style={recentPrescriptionsTableCellStyle}>Filled</td>
                        <td style={recentPrescriptionsTableCellStyle}>...</td>
                    </tr>
                    <tr style={recentPrescriptionsTableRowStyle}>
                        <td style={recentPrescriptionsTableCellStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                            <div style={{ ...patientAvatarStyle, backgroundColor: '#fd7e14' }}>JS</div>
                            <span style={{ marginLeft: '10px' }}>Jane Smith</span>
                        </div>
                        </td>
                        <td style={recentPrescriptionsTableCellStyle}>Apr 26, 2025</td>
                        <td style={recentPrescriptionsTableCellStyle}>Pending</td>
                        <td style={recentPrescriptionsTableCellStyle}>...</td>
                    </tr>
             </tbody>
            </table>
          </div>

          <div style={recentPatientsStyle}>
            <h2>Recent Patients</h2>
            <ul style={recentPatientsListStyle}>
              <li style={recentPatientCardStyle}>
                <div style={{ ...patientAvatarStyle, backgroundColor: '#6f42c1' }}>RJ</div>
                <p style={patientNameStyle}>Robert Johnson</p>
                <p style={patientVisitStyle}>Last visit: Apr 25, 2025</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                  <button style={viewHistoryButtonStyle}>View History</button>
                  <button style={newPrescriptionButtonStyle}>New Prescription</button>
                </div>
              </li>
              <li style={recentPatientCardStyle}>
                <div style={{ ...patientAvatarStyle, backgroundColor: '#dc3545' }}>MW</div>
                <p style={patientNameStyle}>Mary Williams</p>
                <p style={patientVisitStyle}>Last visit: Apr 24, 2025</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                  <button style={viewHistoryButtonStyle}>View History</button>
                  <button style={newPrescriptionButtonStyle}>New Prescription</button>
                </div>
              </li>
              <li style={recentPatientCardStyle}>
                <div style={{ ...patientAvatarStyle, backgroundColor: '#198754' }}>DB</div>
                <p style={patientNameStyle}>David Brown</p>
                <p style={patientVisitStyle}>Last visit: Apr 23, 2025</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                  <button style={viewHistoryButtonStyle}>View History</button>
                  <button style={newPrescriptionButtonStyle}>New Prescription</button>
                </div>
              </li>
            </ul>
          </div>
        </main>
      </div>

      {/* Footer */}
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
    </div>
  );

};

export default DoctorDashboard;