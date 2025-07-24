import React, { useState, useEffect } from 'react';
import { IoIosArrowForward } from 'react-icons/io';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaPhoneAlt, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';
import logo from '../Main_Interface_UI/images/Logo01.png';
import contactBg from './images/background.jpg';
import Footer from './Footer';

function ContactUs() {
  // State for hover effects
  const [isRegisterHovered, setIsRegisterHovered] = useState(false);
  const [hoveredNavSocialIcon, setHoveredNavSocialIcon] = useState(null);
  const [isSubmitButtonHovered, setIsSubmitButtonHovered] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

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

  const styles = {
    // General Styling
    contactUsPage: {
      fontFamily: 'Roboto, sans-serif',
      color: '#333',
      lineHeight: '1.6',
      overflowX: 'hidden',
      // Reverted: Removed minHeight, display, flexDirection
    },

    // Header (Kept previous optimizations for header spacing)
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: getResponsiveStyle('20px 50px', '15px 40px', '12px 20px', '10px 15px'), // Optimized
      backgroundColor: '#e0ffe0',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      flexWrap: 'wrap',
      flexDirection: getResponsiveStyle('row', 'row', 'column', 'column'),
      alignItems: getResponsiveStyle('center', 'center', 'flex-start', 'center'),
      gap: getResponsiveStyle('0px', '0px', '10px', '10px'), // Optimized
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
      flexDirection: getResponsiveStyle('row', 'row', 'row', 'column'),
      textAlign: getResponsiveStyle('left', 'left', 'left', 'center'),
      marginBottom: getResponsiveStyle('0', '0', '0', '0px'), // Optimized
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
      justifyContent: getResponsiveStyle('flex-end', 'flex-end', 'center', 'center'), // Optimized
      marginTop: getResponsiveStyle('0', '0', '10px', '10px'), // Optimized
      width: getResponsiveStyle('auto', 'auto', '100%', '100%'),
      flexDirection: getResponsiveStyle('row', 'row', 'row', 'column'),
      gap: getResponsiveStyle('0px', '0px', '10px', '10px'), // Optimized
    },
    phoneContact: {
      display: 'flex',
      alignItems: 'center',
      marginRight: getResponsiveStyle('25px', '25px', '15px', '0'), // Optimized
      marginBottom: getResponsiveStyle('0', '0', '0', '5px'), // Optimized
      color: '#2980b9',
      fontWeight: '500',
      fontSize: getResponsiveStyle('15px', '15px', '14px', '13px'), // Optimized
      whiteSpace: 'nowrap',
    },
    phoneIcon: {
      marginRight: '8px',
      fontSize: '18px',
    },
    registerButtonLink: {
      textDecoration: 'none',
      flexShrink: 0,
      width: getResponsiveStyle('auto', 'auto', 'auto', '100%'),
      textAlign: 'center', // Optimized
    },
    registerButton: {
      padding: getResponsiveStyle('12px 25px', '12px 25px', '10px 20px', '8px 18px'), // Optimized
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
      width: getResponsiveStyle('auto', 'auto', 'auto', '80%'), // Optimized
      margin: getResponsiveStyle('0', '0', '0', '0 auto'), // Optimized
    },
    registerArrow: {
      marginLeft: '8px',
    },

    // Navigation Bar (Reverted to original spacing)
    navbar: {
      backgroundColor: '#fff',
      borderBottom: '1px solid #ecf0f1',
      padding: getResponsiveStyle('15px 50px', '15px 40px', '15px 30px', '10px 15px'), // REVERTED
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
      flexWrap: 'wrap',
      flexDirection: getResponsiveStyle('row', 'row', 'column', 'column'), // REVERTED (though original had this)
      alignItems: 'center',
      // Removed gap for navbar directly
    },
    navLinks: {
      listStyle: 'none',
      display: 'flex',
      gap: getResponsiveStyle('35px', '30px', '20px', '10px'), // REVERTED
      margin: 0,
      padding: 0,
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginBottom: getResponsiveStyle('0', '0', '15px', '15px'), // REVERTED
    },
    navLink: {
      textDecoration: 'none',
      color: '#555',
      fontSize: getResponsiveStyle('15px', '15px', '14px', '13px'), // REVERTED
      fontWeight: '600',
      transition: 'color 0.3s ease',
      padding: '5px 0',
    },
    socialIcons: {
      display: 'flex',
      gap: getResponsiveStyle('18px', '18px', '15px', '12px'), // REVERTED
      flexShrink: 0,
      marginTop: getResponsiveStyle('0', '0', '10px', '10px'), // REVERTED
    },
    getSocialNavIconStyle: (iconName) => ({
      color: hoveredNavSocialIcon === iconName ? '#007bff' : '#95a5a6',
      fontSize: getResponsiveStyle('18px', '18px', '17px', '16px'), // REVERTED
      transition: 'color 0.3s ease',
    }),

    // Main Content
    mainContent: {
      paddingBottom: '50px',
    },

    heroSection: {
      padding: getResponsiveStyle('120px 20px', '100px 20px', '80px 20px', '60px 15px'), // Optimized
      textAlign: 'center',
      position: 'relative',
      color: 'white',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      backgroundImage: `url(${contactBg})`,
    },
    heroOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: getResponsiveStyle('flex-start', 'flex-start', 'center', 'center'),
      alignItems: 'center',
      paddingLeft: getResponsiveStyle('80px', '60px', '30px', '15px'),
      textAlign: getResponsiveStyle('left', 'left', 'center', 'center'),
    },
    heroTitle: {
      fontSize: getResponsiveStyle('3.2em', '2.8em', '2.2em', '1.8em'), // Optimized
      margin: 0,
      fontWeight: '700',
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.4)',
    },

    contactDetailsFormSection: {
      display: 'flex',
      padding: getResponsiveStyle('60px 80px', '50px 40px', '30px 20px', '25px 15px'), // Optimized
      gap: getResponsiveStyle('60px', '50px', '40px', '25px'), // Optimized
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    howToFindUs: {
      flex: 1,
      minWidth: getResponsiveStyle('350px', '300px', '100%', '100%'), // Optimized
      maxWidth: getResponsiveStyle('600px', '600px', '100%', '100%'),
    },
    getInTouchForm: {
      flex: 1,
      minWidth: getResponsiveStyle('350px', '300px', '100%', '100%'), // Optimized
      maxWidth: getResponsiveStyle('600px', '600px', '100%', '100%'),
    },

    sectionHeading: {
      fontSize: getResponsiveStyle('2.2em', '2em', '1.8em', '1.6em'), // Optimized
      marginBottom: '25px',
      color: '#2c3e50',
      borderBottom: '2px solid #2ecc71',
      paddingBottom: '10px',
      display: 'inline-block',
      whiteSpace: getResponsiveStyle('nowrap', 'nowrap', 'normal', 'normal'),
    },
    sectionDescription: {
      lineHeight: '1.8',
      marginBottom: '30px',
      color: '#555',
      fontSize: getResponsiveStyle('1em', '0.95em', '0.9em', '0.85em'), // Optimized
    },
    mapContainer: {
      marginBottom: '30px',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      width: '100%',
      height: getResponsiveStyle('300px', '280px', '250px', '200px'), // Optimized
    },
    mapIframe: {
      width: '100%',
      height: '100%',
      border: 0,
      borderRadius: '10px',
    },
    mapCaption: {
      fontSize: '0.95em',
      color: '#777',
      marginTop: '10px',
      textAlign: 'center',
      fontStyle: 'italic',
    },
    headquartersInfo: {
      marginTop: '40px',
      paddingTop: '20px',
      borderTop: '1px dashed #ddd',
    },
    subHeading: {
      fontSize: getResponsiveStyle('1.5em', '1.4em', '1.3em', '1.2em'), // Optimized
      marginBottom: '15px',
      color: '#2c3e50',
    },
    infoItem: {
      marginBottom: '10px',
      display: 'flex',
      alignItems: 'flex-start',
      color: '#555',
      fontSize: getResponsiveStyle('1em', '0.95em', '0.9em', '0.85em'), // Optimized
    },
    infoItemIcon: {
      marginRight: '10px',
      color: '#2ecc71',
      fontSize: '1.1em',
      flexShrink: 0,
      marginTop: '3px',
    },
    infoLink: {
      color: '#2980b9',
      textDecoration: 'none',
      transition: 'color 0.3s ease',
      wordBreak: 'break-all',
    },

    // Contact Form (Kept previous optimizations for form spacing)
    contactForm: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f9f9f9',
      padding: getResponsiveStyle('30px', '25px', '20px', '15px'), // Optimized
      borderRadius: '10px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    },
    formGroup: {
      display: 'flex',
      gap: '20px',
      marginBottom: '20px', // Optimized
      flexWrap: 'wrap',
      flexDirection: getResponsiveStyle('row', 'row', 'column', 'column'),
    },
    formInput: (isFocused) => ({
      flex: 1,
      padding: getResponsiveStyle('15px', '12px', '10px', '10px'), // Optimized
      border: `1px solid ${isFocused ? '#2ecc71' : '#e0e0e0'}`,
      borderRadius: '8px',
      fontSize: getResponsiveStyle('1em', '0.95em', '0.9em', '0.85em'), // Optimized
      color: '#333',
      background: '#fff',
      minWidth: getResponsiveStyle('150px', '150px', 'unset', 'unset'),
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      boxShadow: isFocused ? '0 0 0 3px rgba(46, 204, 113, 0.2)' : 'none',
    }),
    formTextarea: (isFocused) => ({
      flex: 1,
      padding: getResponsiveStyle('15px', '12px', '10px', '10px'), // Optimized
      border: `1px solid ${isFocused ? '#2ecc71' : '#e0e0e0'}`,
      borderRadius: '8px',
      fontSize: getResponsiveStyle('1em', '0.95em', '0.9em', '0.85em'), // Optimized
      color: '#333',
      background: '#fff',
      minHeight: getResponsiveStyle('180px', '160px', '140px', '120px'), // Optimized
      marginBottom: '15px', // Optimized
      resize: 'vertical',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      boxShadow: isFocused ? '0 0 0 3px rgba(46, 204, 113, 0.2)' : 'none',
    }),
    submitButton: {
      padding: getResponsiveStyle('15px 30px', '12px 25px', '10px 20px', '8px 18px'), // Optimized
      backgroundColor: isSubmitButtonHovered ? '#27ae60' : '#2ecc71',
      color: 'white',
      border: 'none',
      borderRadius: '30px',
      fontSize: getResponsiveStyle('1.1em', '1em', '0.95em', '0.9em'), // Optimized
      fontWeight: 'bold',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'background-color 0.3s ease, transform 0.2s ease',
      boxShadow: isSubmitButtonHovered ? '0 8px 20px rgba(46, 204, 113, 0.4)' : '0 5px 15px rgba(46, 204, 113, 0.3)',
      transform: isSubmitButtonHovered ? 'translateY(-2px)' : 'translateY(0)',
      marginTop: '15px',
      width: getResponsiveStyle('fit-content', 'fit-content', '100%', '90%'), // Optimized
      alignSelf: getResponsiveStyle('flex-end', 'flex-end', 'center', 'center'),
      margin: getResponsiveStyle('15px 0 0 auto', '15px 0 0 auto', '15px auto 0 auto', '15px auto 0 auto'), // Optimized
    },
  };

  return (
    <div style={styles.contactUsPage}>
      {/* Header */}
      <header style={styles.header}>
        {/* Left Section: Logo and Team Name */}
        <div style={styles.headerLeft}>
          <img src={logo} alt="E-Prescribe Logo" style={styles.logo} />
          <div>
            <h1 style={styles.siteTitle}>E-Prescribe</h1>
            <p style={styles.tagline}>Digital Healthcare</p>
          </div>
        </div>

        {/* Right Section: Contact Info and Register Button */}
        <div style={styles.headerRight}>
          <div style={styles.phoneContact}>
            <FaPhoneAlt style={styles.phoneIcon} />
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
      <nav style={styles.navbar}>
        <ul style={styles.navLinks}>
          <li><Link to="/" style={styles.navLink}>HOME</Link></li>
          <li><Link to="/featurepage" style={styles.navLink}>FEATURES</Link></li>
          <li><Link to="/aboutus" style={styles.navLink}>ABOUT US</Link></li>
          <li><Link to="/contact" style={{ ...styles.navLink, color: '#2ecc71' }}>CONTACT</Link></li> {/* Highlight active */}
        </ul>
        <div style={styles.socialIcons}>
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

      {/* Main Content (Removed mainContentArea wrapper with flexGrow) */}
      <div style={styles.mainContent}>
        <div style={styles.heroSection}>
          <div style={styles.heroOverlay}>
            <h1 style={styles.heroTitle}>Contact Us</h1>
          </div>
        </div>

        <div style={styles.contactDetailsFormSection}>
          <div style={styles.howToFindUs}>
            <h2 style={styles.sectionHeading}>How to Find Us</h2>
            <p style={styles.sectionDescription}>
              If you have any questions, just fill in the contact form, and we will answer you shortly.
              If you are living nearby, come visit E-Prescribe at one of our comfortable offices.
            </p>

            <div style={styles.mapContainer}>
              {/* IMPORTANT: REPLACE THE src BELOW WITH THE ACTUAL EMBED URL FROM GOOGLE MAPS */}
              {/* Go to Google Maps, search for a location, click 'Share' -> 'Embed a map' -> copy the src from the iframe code */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15837.79589939103!2d79.95726359999999!3d7.00977465!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae256c36746f3dd%3A0x6a8779b9a52862a!2sKadawatha!5e0!3m2!1sen!2slk!4v1701389270000!5m2!1sen!2slk"
                style={styles.mapIframe}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Map of Kadawatha, Sri Lanka"
              ></iframe>
              <p style={styles.mapCaption}>Our office in Kadawatha, Sri Lanka</p>
            </div>

            <div style={styles.headquartersInfo}>
              <h3 style={styles.subHeading}>Headquarters</h3>
              <p style={styles.infoItem}>
                <FaMapMarkerAlt style={styles.infoItemIcon} /> 8863 - 9867 MILL ROAD, CAMBRIDGE, MG09 99HT.
              </p>
              <p style={styles.infoItem}>
                <FaPhoneAlt style={styles.infoItemIcon} /> Telephone: +1 800 603 6035
              </p>
              <p style={styles.infoItem}>
                <FaEnvelope style={styles.infoItemIcon} /> E-mail: <a href="mailto:mail@demolink.org" style={styles.infoLink}>mail@demolink.org</a>
              </p>
            </div>
          </div>

          <div style={styles.getInTouchForm}>
            <h2 style={styles.sectionHeading}>Get in Touch</h2>
            <form style={styles.contactForm}>
              <div style={styles.formGroup}>
                <input
                  type="text"
                  placeholder="Name"
                  style={styles.formInput(focusedInput === 'name')}
                  required
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput(null)}
                />
                <input
                  type="email"
                  placeholder="Email"
                  style={styles.formInput(focusedInput === 'email')}
                  required
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
              <div style={styles.formGroup}>
                <textarea
                  placeholder="Message"
                  style={styles.formTextarea(focusedInput === 'message')}
                  required
                  onFocus={() => setFocusedInput('message')}
                  onBlur={() => setFocusedInput(null)}
                ></textarea>
              </div>
              <button
                type="submit"
                style={styles.submitButton}
                onMouseEnter={() => setIsSubmitButtonHovered(true)}
                onMouseLeave={() => setIsSubmitButtonHovered(false)}
              >
                Send Message <IoIosArrowForward />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default ContactUs;