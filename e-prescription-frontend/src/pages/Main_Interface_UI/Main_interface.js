import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Footer from './Footer';

// Import icons
import { FaFacebookF, FaTwitter, FaInstagram, FaPhoneAlt } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';

// Import images
import logo from '../Main_Interface_UI/images/Logo01.png';
import doc from '../Main_Interface_UI/images/Doctor.png';
import patient from './images/Patient.png';
import phar from './images/pharmacist.png';
import slide1 from './images/slide01.png';
import slide2 from './images/slide02.png';
import slide3 from './images/slide03.png';
import user1 from './images/aboutdoc.png';
import user2 from './images/phar.png';
import background from './images/interfacescrolling.jpg';

function App() {
  // State for hover effects
  const [isRegisterHovered, setIsRegisterHovered] = useState(false);
  const [isGetStartedHovered, setIsGetStartedHovered] = useState(false);
  const [hoveredNavSocialIcon, setHoveredNavSocialIcon] = useState(null);
  const [hoveredWhyChooseCard, setHoveredWhyChooseCard] = useState(null); // New state for why choose cards
  const [hoveredTestimonialCard, setHoveredTestimonialCard] = useState(null); // New state for testimonial cards


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
    mainContainer: {
      fontFamily: 'Roboto, sans-serif', // Consistent font
      overflowX: 'hidden',
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

    // --- Hero Section ---
    heroSection: {
      padding: getResponsiveStyle('80px 50px', '70px 40px', '60px 30px', '40px 20px'),
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: getResponsiveStyle('row', 'row', 'column', 'column'), // Stack vertically on smaller screens
      textAlign: getResponsiveStyle('left', 'left', 'center', 'center'), // Center text when stacked
    },
    heroContent: {
      maxWidth: getResponsiveStyle('500px', '450px', '100%', '100%'),
      marginBottom: getResponsiveStyle('0', '0', '40px', '30px'), // Add margin when stacked
      textAlign: getResponsiveStyle('left', 'left', 'center', 'center'),
    },
    heroTitle: {
      fontSize: getResponsiveStyle('2.8em', '2.5em', '2.2em', '1.8em'), // Adjusted font size
      fontWeight: 'bold',
      color: '#2c3e50', // Consistent color
      marginBottom: '20px',
      lineHeight: '1.2',
    },
    heroSubtitle: {
      fontSize: getResponsiveStyle('1.1em', '1em', '0.95em', '0.85em'),
      color: '#555',
      lineHeight: '1.6',
      maxWidth: getResponsiveStyle('none', 'none', '80%', '95%'), // Limit width of subtitle
      margin: getResponsiveStyle('0', '0', '0 auto 0 auto', '0 auto 0 auto'),
    },
    getStartedBtn: {
      padding: getResponsiveStyle('15px 30px', '14px 28px', '12px 25px', '10px 20px'),
      backgroundColor: isGetStartedHovered ? '#218838' : '#28a745', // Consistent hover
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      marginTop: getResponsiveStyle('30px', '25px', '20px', '15px'),
      fontSize: getResponsiveStyle('1em', '0.95em', '0.9em', '0.85em'),
      fontWeight: '600',
      transition: 'background-color 0.3s ease, transform 0.2s ease',
      transform: isGetStartedHovered ? 'scale(1.02)' : 'scale(1)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)', // Add subtle shadow
    },
    heroImageSliderContainer: {
      width: getResponsiveStyle('500px', '450px', '90%', '100%'), // Make slider responsive
      marginLeft: getResponsiveStyle('20px', '20px', '0', '0'), // Remove margin when stacked
    },
    sliderImage: {
      width: '100%',
      height: 'auto',
      objectFit: 'contain',
      borderRadius: '10px',
    },

    // --- Why Choose E-Prescribe? Section ---
    whyChooseSection: {
      padding: getResponsiveStyle('60px 50px', '50px 30px', '40px 20px', '30px 15px'),
      backgroundColor: '#f9f9f9',
    },
    sectionTitle: {
      fontSize: getResponsiveStyle('2.2em', '2em', '1.8em', '1.6em'),
      fontWeight: 'bold',
      color: '#2c3e50',
      textAlign: 'center',
      marginBottom: getResponsiveStyle('40px', '35px', '30px', '25px'),
    },
    whyChooseCardsContainer: {
      display: 'flex',
      justifyContent: 'space-around',
      gap: getResponsiveStyle('30px', '25px', '20px', '20px'),
      flexDirection: getResponsiveStyle('row', 'row', 'column', 'column'), // Stack vertically
      alignItems: getResponsiveStyle('stretch', 'stretch', 'center', 'center'), // Center items when stacked
    },
    whyChooseCard: (index) => ({ // This is now a function for dynamic styling
      backgroundColor: 'white',
      padding: getResponsiveStyle('25px', '20px', '20px', '15px'),
      borderRadius: '12px', // Slightly larger border-radius
      boxShadow: hoveredWhyChooseCard === index ? '0 8px 16px rgba(0, 0, 0, 0.15)' : '0 4px 8px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      maxWidth: getResponsiveStyle('30%', '45%', '80%', '95%'), // Responsive width
      flex: '1', // Allow flex items to grow/shrink
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      transform: hoveredWhyChooseCard === index ? 'translateY(-5px)' : 'translateY(0)',
      borderBottom: hoveredWhyChooseCard === index ? '3px solid #007bff' : '3px solid transparent', // Subtle highlight
      marginBottom: getResponsiveStyle('0', '0', '15px', '15px'), // Margin between stacked cards
    }),
    whyChooseCardImage: {
      height: getResponsiveStyle('120px', '100px', '90px', '80px'),
      width: getResponsiveStyle('120px', '100px', '90px', '80px'),
      marginBottom: '15px',
      borderRadius: '50%', // Ensures images are circular
      objectFit: 'cover',
      border: '3px solid #eee', // Add a subtle border
    },
    whyChooseCardTitle: {
      fontSize: getResponsiveStyle('1.3em', '1.2em', '1.1em', '1em'),
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: '10px',
    },
    whyChooseCardText: {
      fontSize: getResponsiveStyle('0.95em', '0.9em', '0.85em', '0.8em'),
      color: '#555',
      lineHeight: '1.5',
    },

    // --- Parallax Section ---
    parallaxSection: {
      backgroundAttachment: 'fixed', // This creates the parallax effect
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: '#333',
      padding: getResponsiveStyle('100px 50px', '80px 40px', '60px 30px', '50px 20px'),
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden', // Ensures blur doesn't go outside
    },
    parallaxBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundImage: `url(${background})`,
      backgroundAttachment: 'fixed',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: 'blur(5px)',
      zIndex: 0,
    },
    parallaxOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.4)', // Slightly more opaque overlay for better text contrast
      zIndex: 1,
    },
    parallaxContent: {
      position: 'relative',
      zIndex: 2,
    },
    parallaxTitle: {
      fontSize: getResponsiveStyle('3.5em', '3em', '2.5em', '2em'), // Larger and responsive
      fontWeight: 'bold',
      marginBottom: '25px',
      color: '#ecf0f1', // Lighter color for contrast
      textShadow: '2px 2px 5px rgba(0,0,0,0.7)', // Stronger shadow
      lineHeight: '1.2',
    },
    parallaxText: {
      fontSize: getResponsiveStyle('1.4em', '1.2em', '1.1em', '1em'),
      lineHeight: '1.8',
      maxWidth: getResponsiveStyle('900px', '80%', '90%', '95%'),
      margin: '0 auto',
      color: '#bdc3c7', // Slightly muted lighter color
      textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
    },

    // --- What Our Users Say Section ---
    testimonialsSection: {
      padding: getResponsiveStyle('60px 50px', '50px 30px', '40px 20px', '30px 15px'),
      backgroundColor: '#fdfdfd', // A very light white
    },
    testimonialsContainer: {
      display: 'flex',
      justifyContent: 'space-around',
      gap: getResponsiveStyle('30px', '25px', '20px', '20px'),
      flexDirection: getResponsiveStyle('row', 'row', 'column', 'column'), // Stack vertically
      alignItems: getResponsiveStyle('stretch', 'stretch', 'center', 'center'),
    },
    testimonialCard: (index) => ({ // This is now a function for dynamic styling
      backgroundColor: 'white',
      padding: getResponsiveStyle('25px', '20px', '20px', '15px'),
      borderRadius: '12px',
      boxShadow: hoveredTestimonialCard === index ? '0 8px 16px rgba(0, 0, 0, 0.15)' : '0 4px 8px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      maxWidth: getResponsiveStyle('45%', '45%', '80%', '95%'), // Responsive width
      flex: '1',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      transform: hoveredTestimonialCard === index ? 'translateY(-5px)' : 'translateY(0)',
      borderLeft: hoveredTestimonialCard === index ? '4px solid #2ecc71' : '4px solid transparent', // Left border highlight
      marginBottom: getResponsiveStyle('0', '0', '15px', '15px'),
    }),
    testimonialHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '15px',
      flexDirection: getResponsiveStyle('row', 'row', 'row', 'column'), // Stack user info on small mobiles
      textAlign: getResponsiveStyle('left', 'left', 'left', 'center'),
      justifyContent: getResponsiveStyle('flex-start', 'flex-start', 'flex-start', 'center'),
    },
    testimonialImage: {
      height: getResponsiveStyle('80px', '70px', '60px', '50px'),
      width: getResponsiveStyle('80px', '70px', '60px', '50px'),
      borderRadius: '50%',
      marginRight: getResponsiveStyle('15px', '15px', '15px', '0'), // Remove margin on small mobile when stacked
      marginBottom: getResponsiveStyle('0', '0', '0', '10px'), // Add margin on small mobile when stacked
      objectFit: 'cover',
      border: '2px solid #ddd',
    },
    testimonialUserInfo: {
      // Flexbox might already center it if column direction
    },
    testimonialName: {
      fontSize: getResponsiveStyle('1.1em', '1em', '0.95em', '0.9em'),
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '5px',
    },
    testimonialRole: {
      fontSize: getResponsiveStyle('0.85em', '0.8em', '0.75em', '0.7em'),
      color: '#777',
    },
    testimonialText: {
      fontSize: getResponsiveStyle('0.95em', '0.9em', '0.85em', '0.8em'),
      color: '#555',
      lineHeight: '1.5',
      fontStyle: 'italic', // Make testimonials slightly italic
    },
  };

  // React Slick settings
  const slickSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: getResponsiveStyle(true, true, false, false), // Hide arrows on smaller screens
  };

  return (
    <div style={styles.mainContainer}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoSection}>
          <img src={logo} alt="E-Prescribe Logo" style={styles.logoImage} />
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
          <li><Link to="/" style={{ ...styles.navLink, ...styles.navLinkActive }}>HOME</Link></li> {/* Highlight active */}
          <li><Link to="/featurepage" style={styles.navLink}>FEATURES</Link></li>
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

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Digital Prescription Management Made Simple</h1>
          <p style={styles.heroSubtitle}>Streamline your healthcare experience with our secure e-prescription platform connecting patients, doctors, and pharmacists.</p>
          <button
            style={styles.getStartedBtn}
            onMouseEnter={() => setIsGetStartedHovered(true)}
            onMouseLeave={() => setIsGetStartedHovered(false)}
          >
            Get Started
          </button>
        </div>
        <div style={styles.heroImageSliderContainer}>
          <Slider {...slickSettings}>
            {[slide1, slide2, slide3].map((img, idx) => (
              <div key={idx}>
                <img
                  src={img}
                  alt={`Slide ${idx + 1}`}
                  style={styles.sliderImage}
                />
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* Why Choose E-Prescribe? Section */}
      <section style={styles.whyChooseSection}>
        <h2 style={styles.sectionTitle}>Why Choose E-Prescribe?</h2>
        <div style={styles.whyChooseCardsContainer}>
          {[
            { img: doc, title: 'For Doctors', description: 'Easily create and manage digital prescriptions, access patient history, and ensure accurate medication details.' },
            { img: patient, title: 'For Patients', description: 'Access your prescriptions anywhere, receive medication reminders, and share records securely with healthcare providers.' },
            { img: phar, title: 'For Pharmacists', description: 'Process prescriptions efficiently, reduce errors, and maintain digital records of dispensed medications.' },
          ].map((card, index) => (
            <div
              key={index}
              style={styles.whyChooseCard(index)} // Pass index to style function for hover
              onMouseEnter={() => setHoveredWhyChooseCard(index)}
              onMouseLeave={() => setHoveredWhyChooseCard(null)}
            >
              <img src={card.img} alt={card.title} style={styles.whyChooseCardImage} />
              <h3 style={styles.whyChooseCardTitle}>{card.title}</h3>
              <p style={styles.whyChooseCardText}>{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Parallax Section */}
      <section style={styles.parallaxSection}>
        <div style={styles.parallaxBackground} />
        <div style={styles.parallaxOverlay} />
        <div style={styles.parallaxContent}>
          <h2 style={styles.parallaxTitle}>Experience the Future of Prescriptions</h2>
          <p style={styles.parallaxText}>
            Experience the future of prescriptions with our smart, secure, and AI-powered platform. Manage medications effortlessly, eliminate paper trails, and connect doctors and pharmacies seamlessly—all in one digital solution.
          </p>
        </div>
      </section>

      {/* What Our Users Say Section */}
      <section style={styles.testimonialsSection}>
        <h2 style={styles.sectionTitle}>What Our Users Say</h2>
        <div style={styles.testimonialsContainer}>
          {[
            { userImg: user1, name: 'Dr. Upul Fernando', role: 'General Practitioner', quote: "E-Prescribe has revolutionized how I manage prescriptions. It's efficient, secure, and my patients love it!" },
            { userImg: user2, name: 'Menoli Silva', role: 'Pharmacist', quote: "This platform has streamlined our workflow and reduced prescription processing time significantly." },
          ].map((testimonial, index) => (
            <div
              key={index}
              style={styles.testimonialCard(index)} // Pass index to style function for hover
              onMouseEnter={() => setHoveredTestimonialCard(index)}
              onMouseLeave={() => setHoveredTestimonialCard(null)}
            >
              <div style={styles.testimonialHeader}>
                <img src={testimonial.userImg} alt={testimonial.name} style={styles.testimonialImage} />
                <div style={styles.testimonialUserInfo}>
                  <h4 style={styles.testimonialName}>{testimonial.name}</h4>
                  <p style={styles.testimonialRole}>{testimonial.role}</p>
                </div>
              </div>
              <p style={styles.testimonialText}>"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* New Footer Component */}
      <Footer />
    </div>
  );
}
export default App;