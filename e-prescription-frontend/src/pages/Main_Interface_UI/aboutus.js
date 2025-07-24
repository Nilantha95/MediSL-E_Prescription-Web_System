import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer';

// Import icons
import { FaUsers, FaLightbulb, FaHeartbeat, FaRocket, FaShieldAlt, FaPhoneAlt, FaArrowRight } from 'react-icons/fa';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';

function AboutUs() {
  // State for hover effects
  const [isRegisterHovered, setIsRegisterHovered] = useState(false);
  const [isGetInTouchHovered, setIsGetInTouchHovered] = useState(false);
  const [isConnectTeamHovered, setIsConnectTeamHovered] = useState(false);
  const [hoveredNavSocialIcon, setHoveredNavSocialIcon] = useState(null);
  const [hoveredCoreValueCard, setHoveredCoreValueCard] = useState(null); // New state for core value card hover

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
    if (screenWidth <= 575) {
      return smallMobileStyle;
    } else if (screenWidth <= 768) {
      return mobileStyle;
    } else if (screenWidth <= 992) {
      return tabletStyle;
    }
    return desktopStyle;
  };

  // Define styles object
  const styles = {
    mainContainer: {
      fontFamily: 'Roboto, sans-serif', // Ensure Roboto is imported in your main CSS or index.html
      overflowX: 'hidden', // Prevent horizontal scroll
      color: '#333',
    },

    // --- Header ---
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: getResponsiveStyle('20px 50px', '15px 40px', '15px 30px', '15px 15px'),
      backgroundColor: '#e0ffe0', // Consistent with other pages
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      flexWrap: 'wrap',
      flexDirection: getResponsiveStyle('row', 'row', 'column', 'column'),
      alignItems: getResponsiveStyle('center', 'center', 'flex-start', 'center'),
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
      flexDirection: getResponsiveStyle('row', 'row', 'row', 'column'),
      textAlign: getResponsiveStyle('left', 'left', 'left', 'center'),
      marginBottom: getResponsiveStyle('0', '0', '0', '15px'),
    },
    logoImage: {
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
    siteSubtitle: {
      margin: 0,
      fontSize: getResponsiveStyle('13px', '13px', '12px', '11px'),
      color: '#7f8c8d',
      whiteSpace: getResponsiveStyle('nowrap', 'nowrap', 'nowrap', 'normal'),
    },
    contactRegisterSection: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      justifyContent: getResponsiveStyle('flex-end', 'flex-end', 'space-between', 'center'),
      marginTop: getResponsiveStyle('0', '0', '15px', '0'),
      width: getResponsiveStyle('auto', 'auto', '100%', '100%'),
      flexDirection: getResponsiveStyle('row', 'row', 'row', 'column'),
    },
    contactInfo: {
      display: 'flex',
      alignItems: 'center',
      marginRight: getResponsiveStyle('25px', '25px', '0', '0'),
      marginBottom: getResponsiveStyle('0', '0', '0', '10px'),
      color: '#2980b9',
      fontWeight: '500',
      fontSize: getResponsiveStyle('15px', '15px', '14px', '14px'),
      whiteSpace: 'nowrap',
    },
    registerButtonLink: {
      textDecoration: 'none',
      flexShrink: 0,
      width: getResponsiveStyle('auto', 'auto', 'auto', '100%'),
    },
    registerButton: {
      padding: getResponsiveStyle('12px 25px', '12px 25px', '10px 20px', '10px 20px'),
      border: isRegisterHovered ? '1px solid #9cd6fc' : '1px solid #a8dadc',
      borderRadius: '30px',
      backgroundColor: isRegisterHovered ? '#9cd6fc' : '#b3e0ff',
      color: isRegisterHovered ? '#fff' : '#2980b9',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      transition: 'all 0.3s ease',
      whiteSpace: 'nowrap',
    },
    registerArrow: {
      marginLeft: '8px',
    },

    // --- Navigation Bar ---
    navBar: {
      backgroundColor: '#fff',
      borderBottom: '1px solid #ecf0f1',
      padding: getResponsiveStyle('15px 50px', '15px 40px', '15px 30px', '10px 15px'),
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
      flexWrap: 'wrap',
      flexDirection: getResponsiveStyle('row', 'row', 'column', 'column'),
      alignItems: 'center',
    },
    navList: {
      listStyle: 'none',
      display: 'flex',
      gap: getResponsiveStyle('35px', '30px', '20px', '10px'),
      margin: 0,
      padding: 0,
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginBottom: getResponsiveStyle('0', '0', '15px', '15px'),
    },
    navLink: {
      textDecoration: 'none',
      color: '#555',
      fontSize: getResponsiveStyle('15px', '15px', '14px', '13px'),
      fontWeight: '600',
      transition: 'color 0.3s ease',
      padding: '5px 0',
    },
    navLinkActive: {
      color: '#2ecc71', // Highlight for active page
    },
    socialNavIcons: {
      display: 'flex',
      gap: getResponsiveStyle('18px', '18px', '15px', '12px'),
      flexShrink: 0,
      marginTop: getResponsiveStyle('0', '0', '10px', '10px'),
    },
    getSocialNavIconStyle: (iconName) => ({
      color: hoveredNavSocialIcon === iconName ? '#007bff' : '#95a5a6',
      fontSize: getResponsiveStyle('18px', '18px', '17px', '16px'),
      transition: 'color 0.3s ease',
    }),

    // --- Hero Section: Our Story ---
    heroSection: {
      background: 'linear-gradient(to right, #e0f7fa, #c5eff7)',
      padding: getResponsiveStyle('80px 50px', '70px 40px', '60px 30px', '50px 20px'),
      textAlign: 'center',
      color: '#2c3e50',
      position: 'relative',
      overflow: 'hidden',
    },
    heroTitle: {
      fontSize: getResponsiveStyle('3.2em', '2.8em', '2.5em', '2.2em'),
      fontWeight: 'bold',
      marginBottom: '20px',
      textShadow: '2px 2px 5px rgba(0,0,0,0.1)',
      lineHeight: '1.2',
    },
    heroSubtitle: {
      fontSize: getResponsiveStyle('1.2em', '1.1em', '1em', '0.9em'),
      maxWidth: getResponsiveStyle('800px', '700px', '90%', '95%'),
      margin: '0 auto 40px auto',
      lineHeight: '1.6',
    },
    // Background blur effects for hero section (optional, can be removed if too heavy)
    heroBlurLayer: {
      position: 'absolute',
      width: '100%',
      height: '50%',
      background: 'rgba(255,255,255,0.3)',
      filter: 'blur(50px)',
      zIndex: 0,
    },

    // --- Our Purpose & What We Do Section ---
    purposeWhatWeDoSection: {
      padding: getResponsiveStyle('60px 50px', '50px 30px', '40px 20px', '30px 15px'),
      backgroundColor: '#ffffff',
      display: 'flex',
      alignItems: 'flex-start', // Align items to the start for better text flow
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: getResponsiveStyle('50px', '40px', '30px', '25px'),
    },
    purposeWhatWeDoColumn: {
      flex: '1',
      minWidth: getResponsiveStyle('320px', '300px', '90%', '95%'), // Responsive minWidth
      maxWidth: getResponsiveStyle('550px', '500px', '100%', '100%'), // Responsive maxWidth
      textAlign: 'left',
    },
    sectionSubTitle: (color) => ({
      fontSize: getResponsiveStyle('2.4em', '2.2em', '2em', '1.8em'),
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '25px',
      borderLeft: `5px solid ${color}`,
      paddingLeft: '20px',
      lineHeight: '1.2',
    }),
    sectionText: {
      fontSize: getResponsiveStyle('1.05em', '1em', '0.95em', '0.9em'),
      color: '#555',
      lineHeight: '1.7',
      marginBottom: '20px',
    },
    actionButton: {
      padding: getResponsiveStyle('12px 30px', '10px 25px', '10px 20px', '8px 18px'),
      backgroundColor: isGetInTouchHovered ? '#218838' : '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: getResponsiveStyle('1em', '0.95em', '0.9em', '0.85em'),
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease, transform 0.2s ease',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      transform: isGetInTouchHovered ? 'scale(1.02)' : 'scale(1)',
    },
    whatWeDoList: {
      listStyle: 'none',
      padding: 0,
      margin: '0 0 10px 0',
      fontSize: getResponsiveStyle('1em', '0.95em', '0.9em', '0.85em'),
      color: '#666',
      lineHeight: '1.8',
    },
    whatWeDoListItem: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '8px',
    },
    whatWeDoListIcon: {
      marginRight: '8px',
      color: '#007bff',
      flexShrink: 0, // Prevent icon from shrinking
    },

    // --- Our Core Values Section ---
    coreValuesSection: {
      padding: getResponsiveStyle('60px 50px', '50px 30px', '40px 20px', '30px 15px'),
      backgroundColor: '#f0f4f7',
    },
    coreValuesTitle: {
      fontSize: getResponsiveStyle('2.6em', '2.4em', '2.2em', '2em'),
      fontWeight: 'bold',
      color: '#333',
      textAlign: 'center',
      marginBottom: getResponsiveStyle('50px', '40px', '30px', '25px'),
    },
    coreValuesGrid: {
      display: 'grid',
      gridTemplateColumns: getResponsiveStyle(
        'repeat(auto-fit, minmax(250px, 1fr))',
        'repeat(auto-fit, minmax(220px, 1fr))',
        'repeat(auto-fit, minmax(200px, 1fr))',
        '1fr' // Single column on small mobile
      ),
      gap: getResponsiveStyle('30px', '25px', '20px', '20px'),
      justifyContent: 'center',
    },
    coreValueCard: (index) => ({
      backgroundColor: '#ffffff',
      padding: getResponsiveStyle('30px', '25px', '20px', '20px'),
      borderRadius: '15px',
      boxShadow: hoveredCoreValueCard === index ? '0 12px 30px rgba(0, 0, 0, 0.18)' : '0 8px 20px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-bottom 0.3s ease',
      borderBottom: hoveredCoreValueCard === index ? '5px solid #007bff' : '5px solid transparent',
      transform: hoveredCoreValueCard === index ? 'translateY(-10px)' : 'translateY(0)',
    }),
    coreValueIconWrapper: {
      marginBottom: '20px',
    },
    coreValueIcon: {
      fontSize: getResponsiveStyle('3.2em', '3em', '2.8em', '2.5em'),
      color: '#007bff',
    },
    coreValueTitle: {
      fontSize: getResponsiveStyle('1.6em', '1.5em', '1.4em', '1.3em'),
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '12px',
    },
    coreValueDescription: {
      fontSize: getResponsiveStyle('0.95em', '0.9em', '0.85em', '0.8em'),
      color: '#555',
      lineHeight: '1.6',
    },

    // --- Call to Action Section - Join Us ---
    callToActionSection: {
      backgroundColor: '#343a40', // Dark background
      color: 'white',
      padding: getResponsiveStyle('60px 50px', '50px 30px', '40px 20px', '30px 15px'),
      textAlign: 'center',
    },
    callToActionTitle: {
      fontSize: getResponsiveStyle('2.4em', '2.2em', '2em', '1.8em'),
      fontWeight: 'bold',
      marginBottom: '20px',
      lineHeight: '1.2',
    },
    callToActionText: {
      fontSize: getResponsiveStyle('1.1em', '1em', '0.95em', '0.9em'),
      maxWidth: getResponsiveStyle('800px', '700px', '90%', '95%'),
      margin: '0 auto 30px auto',
      lineHeight: '1.6',
    },
    connectTeamButton: {
      padding: getResponsiveStyle('15px 40px', '12px 30px', '10px 25px', '8px 20px'),
      backgroundColor: isConnectTeamHovered ? '#0056b3' : '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: getResponsiveStyle('1.1em', '1em', '0.95em', '0.9em'),
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease, transform 0.2s ease',
      boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
      transform: isConnectTeamHovered ? 'scale(1.02)' : 'scale(1)',
    },
  };

  const coreValues = [
    {
      title: 'Innovation',
      description: 'Continuously pushing boundaries to create smarter, more intuitive healthcare solutions.',
      icon: FaLightbulb,
    },
    {
      title: 'Integrity',
      description: 'Upholding the highest standards of trust, transparency, and ethical practices in all we do.',
      icon: FaShieldAlt,
    },
    {
      title: 'Patient-Centricity',
      description: 'Placing the well-being and convenience of patients at the heart of our technology and services.',
      icon: FaHeartbeat,
    },
    {
      title: 'Collaboration',
      description: 'Fostering strong partnerships with doctors, pharmacies, and patients to build a connected ecosystem.',
      icon: FaUsers,
    },
  ];

  return (
    <div style={styles.mainContainer}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoSection}>
          {/* Ensure this path is correct relative to AboutUs.js */}
          <img src={require('../Main_Interface_UI/images/Logo01.png')} alt="E-Prescribe Logo" style={styles.logoImage} />
          <div>
            <h1 style={styles.siteTitle}>E-Prescribe</h1>
            <p style={styles.siteSubtitle}>Digital Healthcare</p>
          </div>
        </div>

        <div style={styles.contactRegisterSection}>
          <div style={styles.contactInfo}>
            <FaPhoneAlt style={{ marginRight: '8px' }} />
            <span>+94 (011) 519-51919</span>
          </div>
          <Link to="/register" style={styles.registerButtonLink}>
            <div
              style={styles.registerButton}
              onMouseEnter={() => setIsRegisterHovered(true)}
              onMouseLeave={() => setIsRegisterHovered(false)}
            >
              <span>REGISTER</span>
              <IoIosArrowForward style={styles.registerArrow} />
            </div>
          </Link>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav style={styles.navBar}>
        <ul style={styles.navList}>
          <li><Link to="/" style={styles.navLink}>HOME</Link></li>
          <li><Link to="/featurepage" style={styles.navLink}>FEATURES</Link></li>
          <li><Link to="/aboutus" style={{ ...styles.navLink, ...styles.navLinkActive }}>ABOUT US</Link></li> {/* Highlight active */}
          <li><Link to="/contact" style={styles.navLink}>CONTACT</Link></li>
        </ul>
        <div style={styles.socialNavIcons}>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.getSocialNavIconStyle('facebook')}
            onMouseEnter={() => setHoveredNavSocialIcon('facebook')}
            onMouseLeave={() => setHoveredNavSocialIcon(null)}
          >
            <FaFacebookF />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.getSocialNavIconStyle('twitter')}
            onMouseEnter={() => setHoveredNavSocialIcon('twitter')}
            onMouseLeave={() => setHoveredNavSocialIcon(null)}
          >
            <FaTwitter />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.getSocialNavIconStyle('instagram')}
            onMouseEnter={() => setHoveredNavSocialIcon('instagram')}
            onMouseLeave={() => setHoveredNavSocialIcon(null)}
          >
            <FaInstagram />
          </a>
        </div>
      </nav>

      {/* Hero Section: Our Story */}
      <section style={styles.heroSection}>
        {/* Background blur effects */}
        <div style={{ ...styles.heroBlurLayer, bottom: '-20%', left: '0%' }}></div>
        <div style={{ ...styles.heroBlurLayer, top: '-20%', right: '0%' }}></div>

        <h1 style={styles.heroTitle}>
          Revolutionizing Healthcare, One Prescription at a Time
        </h1>
        <p style={styles.heroSubtitle}>
          At E-Prescribe, we believe in a healthier, more connected future. Our mission is to transform traditional healthcare processes into a seamless, secure, and intelligent digital experience.
        </p>
      </section>

      {/* Our Purpose & What We Do Section */}
      <section style={styles.purposeWhatWeDoSection}>
        <div style={styles.purposeWhatWeDoColumn}>
          <h2 style={styles.sectionSubTitle('#007bff')}>
            Our Purpose
          </h2>
          <p style={styles.sectionText}>
            We are driven by a singular purpose: to simplify and secure the healthcare ecosystem through technology. In a world where every second counts, we aim to reduce administrative burdens, eliminate prescription errors, and empower patients with immediate access to their care. We envision a future where healthcare is intuitive, efficient, and deeply personalized.
          </p>
          <Link to="/contact" style={{ textDecoration: 'none' }}>
            <button
              style={styles.actionButton}
              onMouseEnter={() => setIsGetInTouchHovered(true)}
              onMouseLeave={() => setIsGetInTouchHovered(false)}
            >
              Get in Touch
            </button>
          </Link>
        </div>
        <div style={styles.purposeWhatWeDoColumn}>
          <h2 style={styles.sectionSubTitle('#28a745')}>
            What We Do
          </h2>
          <p style={styles.sectionText}>
            E-Prescribe is a cutting-edge digital platform that streamlines the prescription process. We connect doctors, patients, and pharmacies in a secure, real-time environment, offering:
          </p>
          <ul style={styles.whatWeDoList}>
            <li style={styles.whatWeDoListItem}>
              <FaArrowRight style={styles.whatWeDoListIcon} /> Instant, error-free digital prescriptions.
            </li>
            <li style={styles.whatWeDoListItem}>
              <FaArrowRight style={styles.whatWeDoListIcon} /> AI-powered support for patients and providers.
            </li>
            <li style={styles.whatWeDoListItem}>
              <FaArrowRight style={styles.whatWeDoListIcon} /> Secure data management and privacy compliance.
            </li>
            <li style={styles.whatWeDoListItem}>
              <FaArrowRight style={styles.whatWeDoListIcon} /> Automated reminders and analytics for better health outcomes.
            </li>
          </ul>
        </div>
      </section>

      {/* Our Core Values Section */}
      <section style={styles.coreValuesSection}>
        <h2 style={styles.coreValuesTitle}>
          Our Core Values
        </h2>
        <div style={styles.coreValuesGrid}>
          {coreValues.map((value, index) => (
            <div
              key={index}
              style={styles.coreValueCard(index)} // Pass index for hover effect
              onMouseEnter={() => setHoveredCoreValueCard(index)}
              onMouseLeave={() => setHoveredCoreValueCard(null)}
            >
              <div style={styles.coreValueIconWrapper}>
                {React.createElement(value.icon, { style: styles.coreValueIcon })}
              </div>
              <h3 style={styles.coreValueTitle}>
                {value.title}
              </h3>
              <p style={styles.coreValueDescription}>
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Section - Join Us */}
      <section style={styles.callToActionSection}>
        <h2 style={styles.callToActionTitle}>
          Join Us in Shaping the Future of Healthcare
        </h2>
        <p style={styles.callToActionText}>
          Whether you're a healthcare professional, a patient seeking convenience, or a partner looking to innovate, we invite you to be a part of the E-Prescribe journey.
        </p>
        <Link to="/contact" style={{ textDecoration: 'none' }}>
          <button
            style={styles.connectTeamButton}
            onMouseEnter={() => setIsConnectTeamHovered(true)}
            onMouseLeave={() => setIsConnectTeamHovered(false)}
          >
            Connect With Our Team!
          </button>
        </Link>
      </section>

      {/* Footer Component */}
      <Footer />
    </div>
  );
}

export default AboutUs;