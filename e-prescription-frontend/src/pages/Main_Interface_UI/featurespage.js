import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer';

// Import icons from react-icons/fa (Font Awesome)
import { FaFacebookF, FaTwitter, FaInstagram, FaPhoneAlt } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';

// Import icons specifically for the feature cards (Material Design Icons)
import {
  MdMedication, MdSecurity, MdChat, MdNotificationsActive,
  MdAnalytics, MdDashboard, MdCloudUpload, MdSupportAgent
} from 'react-icons/md';
import { BsCheckCircleFill } from 'react-icons/bs';

// Import your local images for the background slider (ensure correct paths)
import healthSlide1 from './images/Newslide02.jpg';
import healthSlide2 from './images/Newslide02.jpg';
import healthSlide3 from './images/Newslide03.jpg';

function Features() {
  // State to manage the current slide index for the background image slider
  const [currentSlide, setCurrentSlide] = useState(0);

  // State for hover effects
  const [isRegisterHovered, setIsRegisterHovered] = useState(false);
  const [isCallToActionHovered, setIsCallToActionHovered] = useState(false);
  const [hoveredNavSocialIcon, setHoveredNavSocialIcon] = useState(null);
  const [hoveredFeatureCard, setHoveredFeatureCard] = useState(null); // Keep this for feature card hover

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

  // Array of background image URLs for the slider
  const backgroundImages = [
    healthSlide1,
    healthSlide2,
    healthSlide3,
  ];

  // Effect to automatically change the background slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % backgroundImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Define styles object
  const styles = {
    mainContainer: {
      fontFamily: 'Roboto, sans-serif',
      overflowX: 'hidden',
      color: '#333',
    },

    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: getResponsiveStyle('20px 50px', '15px 40px', '15px 30px', '15px 15px'),
      backgroundColor: '#e0ffe0',
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
      color: '#2ecc71',
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

    heroSection: {
      textAlign: 'center',
      padding: getResponsiveStyle('120px 20px', '100px 20px', '100px 20px', '80px 15px'),
      backgroundColor: '#f0f4f7',
      position: 'relative',
      overflow: 'hidden',
      minHeight: getResponsiveStyle('400px', '350px', '300px', '250px'),
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    heroTitle: {
      fontSize: getResponsiveStyle('3.2em', '2.8em', '2.5em', '2em'),
      color: 'white',
      marginBottom: '20px',
      position: 'relative',
      zIndex: 2,
      textShadow: '2px 2px 4px rgba(0,0,0,0.4)',
      fontWeight: 'bold',
      lineHeight: '1.2',
    },
    heroSubtitle: {
      fontSize: getResponsiveStyle('1.2em', '1.1em', '1.0em', '0.9em'),
      color: 'white',
      maxWidth: getResponsiveStyle('900px', '700px', '90%', '90%'),
      margin: '0 auto 30px auto',
      lineHeight: '1.6',
      position: 'relative',
      zIndex: 2,
    },
    heroImageCredit: {
      fontSize: getResponsiveStyle('0.9em', '0.85em', '0.8em', '0.75em'),
      color: 'white',
      position: 'relative',
      zIndex: 2,
    },
    blurredBackgroundImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: 'blur(5px) brightness(0.9)',
      opacity: 0,
      transition: 'opacity 1.8s ease-in-out',
      zIndex: 1,
    },

    featuresGridSection: {
      display: 'grid',
      gridTemplateColumns: getResponsiveStyle(
        'repeat(auto-fit, minmax(300px, 1fr))',
        'repeat(auto-fit, minmax(280px, 1fr))',
        'repeat(auto-fit, minmax(250px, 1fr))',
        '1fr'
      ),
      gap: getResponsiveStyle('40px', '30px', '25px', '20px'),
      padding: getResponsiveStyle('60px 50px', '50px 30px', '40px 20px', '30px 15px'),
      backgroundColor: '#ffffff',
      justifyContent: 'center',
      alignItems: 'stretch',
    },
    // The featureCard style should be a direct object here
    featureCard: {
      backgroundColor: '#f8f9fa',
      color: '#34495e',
      padding: getResponsiveStyle('35px', '30px', '25px', '20px'),
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      boxShadow: '0 6px 15px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, border-bottom-color 0.3s ease-in-out',
      cursor: 'pointer',
    },
    featureIconWrapper: {
      marginBottom: '25px',
      color: '#007bff',
      fontSize: getResponsiveStyle('3.5em', '3em', '2.8em', '2.5em'),
    },
    featureTitle: {
      fontSize: getResponsiveStyle('1.8em', '1.6em', '1.5em', '1.4em'),
      marginBottom: '18px',
      fontWeight: 'bold',
      color: '#2c3e50',
    },
    featureDescription: {
      fontSize: getResponsiveStyle('1em', '0.95em', '0.9em', '0.85em'),
      lineHeight: '1.6',
      color: '#6c757d',
    },

    callToActionSection: {
      backgroundColor: '#343a40',
      color: 'white',
      padding: getResponsiveStyle('80px 50px', '60px 30px', '50px 20px', '40px 15px'),
      textAlign: 'center',
    },
    callToActionTitle: {
      fontSize: getResponsiveStyle('2.8em', '2.4em', '2.2em', '1.8em'),
      fontWeight: 'bold',
      marginBottom: '25px',
      lineHeight: '1.2',
    },
    callToActionText: {
      fontSize: getResponsiveStyle('1.3em', '1.1em', '1.0em', '0.9em'),
      maxWidth: getResponsiveStyle('900px', '700px', '90%', '90%'),
      margin: '0 auto 40px auto',
      lineHeight: '1.8',
    },
    callToActionBtn: {
      padding: getResponsiveStyle('18px 45px', '15px 35px', '12px 30px', '10px 25px'),
      backgroundColor: isCallToActionHovered ? '#218838' : '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: getResponsiveStyle('1.3em', '1.1em', '1.0em', '0.9em'),
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease, transform 0.2s ease',
      boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
      transform: isCallToActionHovered ? 'scale(1.02)' : 'scale(1)',
    },
  };

  const featuresData = [
    {
      icon: MdMedication,
      title: 'Instant Digital Prescriptions',
      description: 'Doctors can create and send digital prescriptions directly to pharmacies in real-time. Patients receive them instantly, reducing wait times and manual errors.',
    },
    {
      icon: MdSecurity,
      title: 'Advanced Data Security',
      description: 'Your health information is protected with industry-leading encryption and robust privacy protocols, ensuring full compliance with healthcare regulations.',
    },
    {
      icon: MdChat,
      title: 'AI-Powered Patient Chatbot',
      description: 'Our intelligent chatbot provides immediate answers to common health questions, medication details, and navigates patients through the E-Prescribe platform effortlessly.',
    },
    {
      icon: MdNotificationsActive,
      title: 'Smart Reminders',
      description: 'Automated medication reminders for patients and prescription renewal alerts for doctors ensure adherence and timely care.',
    },
    {
      icon: MdDashboard,
      title: 'Intuitive Dashboards',
      description: 'Streamlined dashboards for doctors, pharmacists, and patients provide quick overviews and easy navigation to key functions.',
    },
    {
      icon: MdCloudUpload,
      title: 'Cloud-Based Access',
      description: 'Access E-Prescribe from anywhere, at any time, on any device. Your data is securely stored and always available.',
    },
    {
      icon: BsCheckCircleFill,
      title: 'Seamless Integration',
      description: 'Effortlessly integrate with existing EMR/EHR systems and pharmacy management software for a unified workflow.',
    },
    {
      icon: MdSupportAgent,
      title: 'Dedicated Support',
      description: 'Our expert support team is available around the clock to assist you with any questions or technical issues.',
    },
  ];

  return (
    <div style={styles.mainContainer}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoSection}>
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
          <li><Link to="/featurepage" style={{ ...styles.navLink, ...styles.navLinkActive }}>FEATURES</Link></li>
          <li><Link to="/aboutus" style={styles.navLink}>ABOUT US</Link></li>
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

      {/* Hero Section: Comprehensive Digital Healthcare Solutions (with Blurred Slider) */}
      <section style={styles.heroSection}>
        {/* Blurred Image Slider Background */}
        {backgroundImages.map((imageUrl, index) => (
          <div
            key={index}
            style={{
              ...styles.blurredBackgroundImage,
              backgroundImage: `url(${imageUrl})`,
              opacity: index === currentSlide ? 1 : 0,
            }}
          />
        ))}

        {/* Text Content */}
        <h1 style={styles.heroTitle}>Comprehensive Digital Healthcare Solutions</h1>
        <p style={styles.heroSubtitle}>
          E-Prescribe goes beyond basic prescriptions, offering a suite of powerful features designed to enhance efficiency, safety, and patient engagement across the healthcare ecosystem.
        </p>
        <p style={styles.heroImageCredit}>Images from Freepik</p>
      </section>

      {/* Main Features Grid Section */}
      <section style={styles.featuresGridSection}>
        {featuresData.map((feature, index) => (
          <div
            key={index}
            // Apply base style and then conditionally apply hover styles
            style={{
              ...styles.featureCard, // Base styles
              borderBottom: hoveredFeatureCard === index ? '4px solid #007bff' : '4px solid transparent',
              transform: hoveredFeatureCard === index ? 'translateY(-8px)' : 'translateY(0)',
              boxShadow: hoveredFeatureCard === index ? '0 10px 25px rgba(0, 0, 0, 0.15)' : '0 6px 15px rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={() => setHoveredFeatureCard(index)}
            onMouseLeave={() => setHoveredFeatureCard(null)}
          >
            <div style={styles.featureIconWrapper}>
              {React.createElement(feature.icon)}
            </div>
            <h3 style={styles.featureTitle}>{feature.title}</h3>
            <p style={styles.featureDescription}>{feature.description}</p>
          </div>
        ))}
      </section>

      {/* Call to Action Section */}
      <section style={styles.callToActionSection}>
        <h2 style={styles.callToActionTitle}>Ready to Experience Seamless Digital Prescriptions?</h2>
        <p style={styles.callToActionText}>
          Discover how E-Prescribe can revolutionize your medical practice, improve patient care, and streamline pharmacy operations.
        </p>
        <Link to="/register" style={{ textDecoration: 'none' }}>
          <button
            style={styles.callToActionBtn}
            onMouseEnter={() => setIsCallToActionHovered(true)}
            onMouseLeave={() => setIsCallToActionHovered(false)}
          >
            Get Started Today!
          </button>
        </Link>
      </section>

      {/* Footer Component */}
      <Footer />
    </div>
  );
}

export default Features;