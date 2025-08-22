import React, { useState, useEffect } from 'react';
import { FaPinterest, FaFacebookF, FaInstagram, FaTwitter, FaWhatsapp } from 'react-icons/fa'; // Import social media icons

const Footer = () => {
  // State to manage hover effect for links (workaround for :hover)
  const [hoveredLink, setHoveredLink] = useState(null);

  // State for responsive styles
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Define responsive style variations based on screenWidth
  const getResponsiveStyle = (desktopStyle, tabletStyle, mobileStyle, smallMobileStyle) => {
    if (screenWidth <= 575) { // Small mobile
      return smallMobileStyle;
    } else if (screenWidth <= 768) { // General mobile
      return mobileStyle;
    } else if (screenWidth <= 992) { // Tablet
      return tabletStyle;
    }
    return desktopStyle; // Desktop
  };

  // Define the styles as JavaScript objects
  const styles = {
    footerContainer: {
      backgroundColor: '#d7f3d2',
      padding: getResponsiveStyle('30px 50px', '25px 30px', '20px 20px', '15px 15px'),
      fontFamily: 'Roboto, sans-serif', // Ensure consistent font
      marginTop: '50px', // Add some top margin to separate from content if needed
    },

    footerContent: {
      display: 'flex',
      justifyContent: 'space-around',
      paddingBottom: getResponsiveStyle('30px', '25px', '20px', '15px'),
      flexWrap: 'wrap',
      gap: getResponsiveStyle('20px', '20px', '15px', '10px'),
      flexDirection: getResponsiveStyle('row', 'row', 'column', 'column'), // Stack sections on smaller screens
    },

    footerSection: {
      flex: '1',
      minWidth: getResponsiveStyle('220px', '200px', '100%', '100%'), // Take full width when stacked
      margin: getResponsiveStyle('0 10px', '0 10px', '0', '0'), // Remove horizontal margin when stacked
      textAlign: getResponsiveStyle('left', 'left', 'center', 'center'), // Center text when stacked
      marginBottom: getResponsiveStyle('0', '0', '20px', '15px'), // Add vertical margin between stacked sections
    },

    heading: {
      fontSize: getResponsiveStyle('1.3em', '1.2em', '1.2em', '1.1em'),
      marginBottom: '12px',
      color: '#333',
      fontWeight: 'bold',
    },

    list: {
      listStyle: 'none',
      padding: '0',
      margin: '0',
    },

    listItem: {
      marginBottom: '12px',
      color: '#555',
      fontSize: getResponsiveStyle('1.0em', '0.95em', '0.95em', '0.9em'),
    },

    // Function to get link style based on hover state
    getLinkStyle: (linkName) => ({
      color: hoveredLink === linkName ? '#007bff' : '#555',
      textDecoration: 'none',
      transition: 'color 0.3s ease',
    }),

    iconStyle: {
      marginRight: '10px',
      fontSize: '1.1em',
      color: '#555',
    },

    // Styles for Follow Us section
    followUs: {
      flex: '1',
      minWidth: getResponsiveStyle('220px', '200px', '100%', '100%'),
      margin: getResponsiveStyle('0 10px', '0 10px', '0', '0'),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center', // Always center for follow us section
      textAlign: 'center', // Always center for follow us section
      marginBottom: getResponsiveStyle('0', '0', '20px', '15px'), // Add vertical margin between stacked sections
    },

    socialIconContainer: {
      display: 'flex',
      gap: getResponsiveStyle('15px', '15px', '12px', '10px'),
      marginTop: '10px',
      color: '#333',
    },

    socialIconLink: {
      fontSize: getResponsiveStyle('1.5em', '1.4em', '1.3em', '1.2em'),
      transition: 'color 0.3s ease',
    },

    getSocialIconLinkStyle: (iconName) => ({
      ...styles.socialIconLink, // Inherit base social icon link styles
      color: hoveredLink === iconName ? '#007bff' : '#333', // Change color on hover
    }),

    bottomBar: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: '10px',
      borderTop: '1px solid #ccc',
      marginTop: getResponsiveStyle('20px', '20px', '15px', '10px'),
      flexWrap: 'wrap',
    },

    copyright: {
      fontSize: getResponsiveStyle('0.9em', '0.85em', '0.8em', '0.75em'),
      color: '#777',
      marginBottom: '0px',
      textAlign: 'center', // Center copyright text on smaller screens
    },
  };

  return (
    <footer style={styles.footerContainer}>
      <div style={styles.footerContent}>
        {/* MediSL Lanka Section */}
        <div style={styles.footerSection}>
          <h3 style={styles.heading}>MediSL Lanka</h3>
          <p style={styles.listItem}>Securely manages digital prescriptions, connecting patients, doctors, and pharmacists efficiently.</p>
        </div>

        {/* Quick Links Section */}
        <div style={styles.footerSection}>
          <h3 style={styles.heading}>Quick Links</h3>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <a
                href="/home2"
                style={styles.getLinkStyle('home')}
                onMouseEnter={() => setHoveredLink('home')}
                onMouseLeave={() => setHoveredLink(null)}
              >
                Home
              </a>
            </li>
            <li style={styles.listItem}>
              <a
                href="/featurepage"
                style={styles.getLinkStyle('features')}
                onMouseEnter={() => setHoveredLink('features')}
                onMouseLeave={() => setHoveredLink(null)}
              >
                Features
              </a>
            </li>
            <li style={styles.listItem}>
              <a
                href="/aboutus"
                style={styles.getLinkStyle('doctors')}
                onMouseEnter={() => setHoveredLink('doctors')}
                onMouseLeave={() => setHoveredLink(null)}
              >
                AboutUs
              </a>
            </li>
            <li style={styles.listItem}>
              <a
                href="/contact"
                style={styles.getLinkStyle('patients')}
                onMouseEnter={() => setHoveredLink('patients')}
                onMouseLeave={() => setHoveredLink(null)}
              >
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Info Section */}
        <div style={styles.footerSection}>
          <h3 style={styles.heading}>Contact Info</h3>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <span style={styles.iconStyle}>📞</span>
              <span>+94 11 234 5678</span>
            </li>
            <li style={styles.listItem}>
              <span style={styles.iconStyle}>✉️</span>
              <span>info@medisllanka.com</span>
            </li>
            <li style={styles.listItem}>
              <span style={styles.iconStyle}>📍</span>
              <span>Colombo, Sri Lanka</span>
            </li>
          </ul>
        </div>

        {/* Follow Us Section */}
        <div style={styles.followUs}>
          <h3 style={styles.heading}>Follow us</h3>
          <div style={styles.socialIconContainer}>
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.getSocialIconLinkStyle('pinterest')}
              onMouseEnter={() => setHoveredLink('pinterest')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <FaPinterest />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.getSocialIconLinkStyle('facebook')}
              onMouseEnter={() => setHoveredLink('facebook')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <FaFacebookF />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.getSocialIconLinkStyle('instagram')}
              onMouseEnter={() => setHoveredLink('instagram')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <FaInstagram />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.getSocialIconLinkStyle('twitter')}
              onMouseEnter={() => setHoveredLink('twitter')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <FaTwitter />
            </a>
            <a
              href="https://whatsapp.com"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.getSocialIconLinkStyle('whatsapp')}
              onMouseEnter={() => setHoveredLink('whatsapp')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <FaWhatsapp />
            </a>
          </div>
        </div>
      </div>

      <div style={styles.bottomBar}>
        <p style={styles.copyright}>© 2025 MediSL Lanka. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;