import React from 'react';
import { IoIosArrowForward } from 'react-icons/io';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterest, FaWhatsapp} from 'react-icons/fa';
import { IoIosArrowDown } from 'react-icons/io';
import { FaPhoneAlt } from 'react-icons/fa';
import logo from '../Main_Interface_UI/images/Logo01.png';
import contactBg from './images/background.jpg'; // Import your background image

function ContactUs() {
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', backgroundColor: '#d7f3d2' }}>
        {/* Left Section: Logo and Team Name (Adjusted for E-Prescribe) */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="E-Prescribe Logo" style={{ height: '50px', marginRight: '10px' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#333' }}>E-Prescribe</h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#777' }}>Digital Healthcare</p>
          </div>
        </div>

        {/* Right Section: Contact Info and Register Button */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px', color: '#007bff' }}>
            <FaPhoneAlt style={{ marginRight: '5px' }} />
            <span>+94 (011) 519-51919</span>
          </div>
          <Link to="/register" style={{ textDecoration: 'none' }}> {/* Use Link instead of button */}
            <div
              style={{
                padding: '10px 20px',
                border: '1px solid #ddd',
                borderRadius: '20px',
                backgroundColor: 'lightblue',
                color: '#007bff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span>REGISTER</span>
              <IoIosArrowForward style={{ marginLeft: '5px' }} />
            </div>
          </Link>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav style={{ backgroundColor: '#fff', borderBottom: '1px solid #eee', padding: '15px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ul style={{ listStyle: 'none', display: 'flex', gap: '30px', margin: 0, padding: 0 }}>
          <li><Link to="/" style={{ textDecoration: 'none', color: '#333', fontSize: '14px', fontWeight: 'bold' }}>HOME</Link></li>
          <li><Link to="/features" style={{ textDecoration: 'none', color: '#333', fontSize: '14px', fontWeight: 'bold' }}>FEATURES</Link></li>
          <li><Link to="/doctors" style={{ textDecoration: 'none', color: '#333', fontSize: '14px', fontWeight: 'bold' }}>DOCTORS</Link></li>
          <li><Link to="/patients" style={{ textDecoration: 'none', color: '#333', fontSize: '14px', fontWeight: 'bold' }}>PATIENTS</Link></li>
          <li style={{ position: 'relative' }}>
            <Link to="/pages" style={{ textDecoration: 'none', color: '#333', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              PAGES <IoIosArrowDown style={{ marginLeft: '5px' }} />
            </Link>
            {/* Add dropdown menu here if needed */}
          </li>
          <li><Link to="/blog" style={{ textDecoration: 'none', color: '#333', fontSize: '14px', fontWeight: 'bold' }}>BLOG</Link></li>
          <li><Link to="/contact" style={{ textDecoration: 'none', color: '#333', fontSize: '14px', fontWeight: 'bold' }}>CONTACT</Link></li>
        </ul>
        <div style={{ display: 'flex', gap: '15px', color: '#ccc' }}>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}><FaFacebookF /></a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ color: '#1da1f2' }}><FaTwitter /></a>
          {/* Add other social media icons as needed */}
        </div>
      </nav>
      <div style={styles.container}>
        <div style={{ ...styles.header, backgroundImage: `url(${contactBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div style={styles.overlay}>
            <h1 style={styles.headerText}>Contact Us</h1>
          </div>
        </div>
        <div style={styles.content}>
          <div style={styles.findUs}>
            <h2 style={styles.sectionTitle}>How to Find Us</h2>
            <p style={styles.paragraph}>
              If you have any questions, just fill in the contact form, and we will answer you shortly.
              If you are living nearby, come visit TaxExpert at one of our comfortable offices.
            </p>
            {/* Google Map Section */}
            <div style={styles.mapContainer}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2435.288849298712!2d-0.1277583!3d51.5073509!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48761d4731199129%3A0x3cca2f5549730e5d!2sLondon%2C%20UK!5e0!3m2!1sen!2slk!4v1715372379819!5m2!1sen!2slk"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Map of London (Example)" // Added a title for accessibility
              ></iframe>
              <p style={styles.mapCaption}>Our office in London (Example Location)</p> {/* Added a caption for context */}
            </div>
            {/* End of Google Map Section */}
            <div style={styles.headquarters}>
              <h3 style={styles.subTitle}>Headquarters</h3>
              <p style={styles.address}>
                8863 - 9867 MILL ROAD, CAMBRIDGE, MG09 99HT.
              </p>
              <p style={styles.phone}>
                Telephone: +1 800 603 6035
              </p>
              <p style={styles.email}>
                E-mail: <a href="mailto:mail@demolink.org" style={styles.link}>mail@demolink.org</a>
              </p>
            </div>
          </div>
          <div style={styles.getInTouch}>
            <h2 style={styles.sectionTitle}>Get in Touch</h2>
            <form style={styles.form}>
              <div style={styles.formRow}>
                <input type="text" placeholder="Name" style={styles.input} />
                <input type="email" placeholder="Email" style={styles.input} />
              </div>
              <div style={styles.formRow}>
                <textarea placeholder="Message" style={{ ...styles.textarea, minHeight: '200px', minWidth:'800px' }}></textarea> {/* Increased minHeight */}
              </div>
              {/* You'd likely add a submit button here */}
            </form>
          </div>
        </div>
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
              <a href="#" style={iconLinkStyle}><FaPinterest style={socialIconStyle} /></a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><FaFacebookF style={socialIconStyle} /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><FaInstagram style={socialIconStyle} /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><FaTwitter style={socialIconStyle} /></a>
              <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><FaWhatsapp style={socialIconStyle} /></a>
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
        <p>© 2025 E-Prescribe. All rights reserved.</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'sans-serif',
    color: '#333',
  },
  header: {
    padding: '100px 20px', // Increased padding for better visibility
    textAlign: 'center',
    position: 'relative', // Needed for overlay
    color: 'white', // Set text color to white for better contrast
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black overlay
    display: 'flex',
    justifyContent: 'flex-start', // Align content to the start (left)
    alignItems: 'center',
    paddingLeft: '50px', // Add some left padding for the text
  },
  headerText: {
    fontSize: '2.5em', // Increased font size
    margin: '0',
    fontWeight: 'bold',
  },
  content: {
    display: 'flex',
    padding: '40px 50px', // Increased padding for content area
    gap: '40px',
  },
  findUs: {
    flex: 1,
  },
  getInTouch: {
    flex: 1,
    padding: '8px', // Add some padding to the form container
    borderRadius: '0px', // Optional: Add rounded corners
  },
  sectionTitle: {
    fontSize: '1.8em',
    marginBottom: '20px',
    color: 'black',
  },
  paragraph: {
    lineHeight: '1.6',
    marginBottom: '25px',
  },
  mapContainer: {
    marginBottom: '25px',
    borderRadius: '8px', // Optional: round the corners of the map
    overflow: 'hidden', // Ensures the iframe respects the border-radius
  },
  mapCaption: {
    fontSize: '0.9em',
    color: '#777',
    marginTop: '5px',
    textAlign: 'center',
  },
  headquarters: {
    marginTop: '30px',
  },
  subTitle: {
    fontSize: '1.3em',
    marginBottom: '12px',
    color: 'black',
  },
  address: {
    marginBottom: '8px',
  },
  phone: {
    marginBottom: '8px',
  },
  email: {
    marginBottom: '8px',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formRow: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
  },
  input: {
    flex: 1,
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '1em',
  },
  textarea: {
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    minHeight: '150px',
    marginBottom: '20px',
    fontSize: '1em',
  },
};

const footerStyle = {
  backgroundColor: '#d7f3d2',
  padding: '30px 50px',
};

const containerStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  paddingBottom: '30px',
};

const sectionStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const headingStyle = {
  fontSize: '1.3em',
  marginBottom: '12px',
  color: '#333',
};

const listStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
};

const listItemStyle = {
  marginBottom: '12px',
  color: '#555',
};

const followUsStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const socialIconStyle = {
  display: 'flex',
  marginTop: '10px',
};

const iconLinkStyle = {
  marginRight: '15px',
  textDecoration: 'none',
  color: '#333',
  fontSize: '1.2em', // Adjust icon size
};

const bottomBarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: '15px',
  borderTop: '1px solid #ccc',
};

const copyrightStyle = {
  fontSize: '0.9em',
  color: '#777',
};

const linksStyle = {
  display: 'flex',
};

const bottomLinkStyle = {
  color: '#555',
  textDecoration: 'none',
  fontSize: '0.9em',
  marginRight: '15px',
};

const separatorStyle = {
  color: '#ccc',
  marginRight: '15px',
};

export default ContactUs;