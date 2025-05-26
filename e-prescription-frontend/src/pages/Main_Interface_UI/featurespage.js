import React from 'react';
import EPrescribeImage from './images/RX05.png'; // Correct import path
import logo from '../Main_Interface_UI/images/Logo01.png';
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterest, FaWhatsapp} from 'react-icons/fa';
import { IoIosArrowForward, IoIosArrowDown } from 'react-icons/io';
import { FaPhoneAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Import your local images for the background slider
import healthSlide1 from './images/Newslide02.jpg'; // Adjust path and filename
import healthSlide2 from './images/Newslide02.jpg'; // Adjust path and filename
import healthSlide3 from './images/Newslide03.jpg'; // Adjust path and filename

function App() {
  // State to manage the current slide index for the background image slider
  const [currentSlide, setCurrentSlide] = React.useState(0);

  // Array of background image URLs for the slider
  // NOW USING LOCALLY IMPORTED IMAGES
  const backgroundImages = [
    healthSlide1,
    healthSlide2,
    healthSlide3, // Add more if you imported them
  ];

  // Effect to automatically change the background slide
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % backgroundImages.length);
    }, 5000); // Change slide every 5 seconds (adjust as needed)

    // Cleanup the interval when the component unmounts
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'sans-serif',
      boxSizing: 'border-box',
    },
    leftSection: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingRight: '40px', // Space between image and cards
    },
    image: {
      maxWidth: '100%',
      height: 'auto',
      borderRadius: '8px', // Optional: adds a slight roundness to the image
    },
    rightSection: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-around', // Distributes space between cards
      gap: '30px', // Space between cards
    },
    card: {
      backgroundColor: '#f9f9f9',
      padding: '25px',
      borderRadius: '8px',
      textAlign: 'left',
    },
    darkCard: {
      backgroundColor: '#000', // Black background for the middle card
      color: '#fff', // White text for the middle card
    },
    cardHeading: {
      marginTop: '10px',
      marginBottom: '10px',
      fontSize: '1.5em',
      fontWeight: 'normal',
    },
    cardParagraph: {
      fontSize: '0.9em',
      lineHeight: '1.6',
      color: '#555', // Adjust text color for general cards
    },
    darkCardParagraph: {
      color: '#ccc', // Lighter text for the dark card
    },
    iconWrapper: {
      marginBottom: '15px',
    },
    icon: {
      width: '40px', // Adjust icon size as needed
      height: '40px',
      color: '#333', // Default icon color
    },
    darkCardIcon: {
      color: '#fff', // White icon for the dark card
    },

    // --- New Styles for the Added Section with Blur Image Slider ---
    newHeaderStyle: {
      textAlign: 'center',
      padding: '60px 20px',
      backgroundColor: '#f8f8f8',
      position: 'relative', // Crucial for positioning the background images
      overflow: 'hidden', // Hides parts of images outside the div during transition
      minHeight: '300px', // Give it a minimum height to see the background
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    newHeaderTitleStyle: {
      fontSize: '2.5em',
      color: '#333',
      marginBottom: '15px',
      position: 'relative', // Keeps text above the background
      zIndex: 2, // Higher z-index for text
      textShadow: '1px 1px 2px rgba(0,0,0,0.1)', // Optional: subtle text shadow
    },
    newHeaderSubtitleStyle: {
      fontSize: '1.1em',
      color: '#666',
      maxWidth: '800px',
      margin: '0 auto 20px auto',
      lineHeight: '1.6',
      position: 'relative',
      zIndex: 2,
    },
    newImagesCreditStyle: {
      fontSize: '0.9em',
      color: '#999',
      position: 'relative',
      zIndex: 2,
    },
    // Style for the individual blurred background image elements
    blurredBackgroundImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: 'blur(10px)', // Adjust blur amount (e.g., 5px, 15px)
      opacity: 0, // Initially hidden
      transition: 'opacity 1.5s ease-in-out, transform 1.5s ease-in-out', // Smooth transition for opacity and slide
      zIndex: 1, // Lower z-index for background images
    },
    newFeatureSectionStyle: {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px', // Space between cards
      padding: '40px 20px',
      flexWrap: 'wrap', // Allows cards to wrap on smaller screens
      backgroundColor: '#e6e6e6', // A slightly darker background than the header
    },
    newFeatureCardStyle: {
      backgroundColor: '#3f51b5', // A deep blue, similar to the image
      color: 'white',
      padding: '30px',
      borderRadius: '8px',
      width: '280px', // Fixed width, adjust as needed
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center', // Center content horizontally
      textAlign: 'center',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      transition: 'transform 0.3s ease-in-out',
      // For the background image with overlay (conceptual placeholder)
      backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://via.placeholder.com/400x300?text=Business+Background)', // Replace with actual image URL if available
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundBlendMode: 'multiply',
    },
    newFeatureIconStyle: {
      fontSize: '3em', // Adjust icon size
      marginBottom: '20px',
      backgroundColor: 'rgba(255, 255, 255, 0.2)', // A subtle background for the icon
      borderRadius: '50%',
      padding: '15px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '80px', // Make it a circle
      height: '80px',
    },
    newFeatureTitleStyle: {
      fontSize: '1.5em',
      marginBottom: '15px',
      textTransform: 'uppercase',
      fontWeight: 'bold',
    },
    newFeatureDescriptionStyle: {
      fontSize: '0.95em',
      lineHeight: '1.5',
    },
  };

  const featuresData = [
    {
      icon: '💰', // Replace with an actual SVG or image component
      title: 'CONSULTING',
      description: 'Sample text. Click to select the text box. Click again or double click to start editing the text.',
    },
    {
      icon: ' strateg', // Replace with an actual SVG or image component
      title: 'STRATEGY',
      description: 'Sample text. Click to select the text box. Click again or double click to start editing the text.',
    },
    {
      icon: ' 🚩', // Replace with an actual SVG or image component
      title: 'MISSION',
      description: 'Sample text. Click to select the text box. Click again or double click to start editing the text.',
    },
    {
      icon: ' 🔄', // Replace with an actual SVG or image component
      title: 'INVESTMENT',
      description: 'Sample text. Click to select the text box. Click again or double click to start editing the text.',
    },
  ];

  const footerStyle = {
    backgroundColor: '#d7f3d2', // Light green background
    padding: '20px',
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
    color: '#333', // Placeholder for icon color
  };

  const socialIcon = {
    backgroundColor: '#333', // Placeholder for icon background
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '1em',
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
          <li><Link to="/featurepage" style={{ textDecoration: 'none', color: '#333', fontSize: '14px', fontWeight: 'bold' }}>FEATURES</Link></li>
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

      {/* Main Content Area: E-Prescribe Image and Cards */}
      <div style={styles.container}>
        <div style={styles.leftSection}>
          <img src={EPrescribeImage} alt="Person using a tablet" style={styles.image} />
        </div>
        <div style={styles.rightSection}>
          <div style={styles.card}>
            <div style={styles.iconWrapper}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={styles.icon}
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
                <circle cx="12" cy="9" r="3"></circle>
              </svg>
            </div>
            <h3 style={styles.cardHeading}>Business Strategy</h3>
            <p style={styles.cardParagraph}>
              Sample text. Lorem ipsum dolor sit amet, consectetur adipiscing elit
              nullam nunc justo sagittis ultrices.
            </p>
          </div>

          <div style={{ ...styles.card, ...styles.darkCard }}> {/* Merge card and darkCard styles */}
            <div style={styles.iconWrapper}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ ...styles.icon, ...styles.darkCardIcon }} // Merge icon and darkCardIcon styles
              >
                <path d="M4 16h16M4 8h16M4 12h16M4 20h16"></path>
              </svg>
            </div>
            <h3 style={styles.cardHeading}>Projects Management</h3>
            <p style={{ ...styles.cardParagraph, ...styles.darkCardParagraph }}> {/* Merge paragraph styles */}
              Sample text. Lorem ipsum ipsum dolor sit amet, consectetur adipiscing elit
              nullam nunc justo sagittis ultrices.
            </p>
          </div>

          <div style={styles.card}>
            <div style={styles.iconWrapper}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={styles.icon}
              >
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 3h-8"></path>
                <line x1="12" y1="3" x2="12" y2="7"></line>
                <line x1="8" y1="11" x2="8" y2="15"></line>
                <line x1="16" y1="11" x2="16" y2="15"></line>
              </svg>
            </div>
            <h3 style={styles.cardHeading}>Internet Technology</h3>
            <p style={styles.cardParagraph}>
              Sample text. Lorem ipsum dolor sit amet, consectetur adipiscing elit
              nullam nunc justo sagittis ultrices.
            </p>
          </div>
        </div>
      </div>

      {/* --- ADDED DESIGN SECTION START --- */}
      <div style={styles.newHeaderStyle}>
        {/* Blurred Image Slider Background */}
        {backgroundImages.map((imageUrl, index) => (
          <div
            key={index}
            style={{
              ...styles.blurredBackgroundImage,
              backgroundImage: `url(${imageUrl})`, // Use url() with the imported image variable
              opacity: index === currentSlide ? 1 : 0, // Current slide visible, others hidden
              // Optional: Add a sliding effect
              transform: `translateX(${index === currentSlide ? '0%' : index < currentSlide ? '-100%' : '100%'})`,
            }}
          />
        ))}

        {/* Text Content */}
        <h1 style={styles.newHeaderTitleStyle}>Get Great Work for Your Budget</h1>
        <p style={styles.newHeaderSubtitleStyle}>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa
        </p>
        <p style={styles.newImagesCreditStyle}>Images from Freepik</p>
      </div>

      <section style={styles.newFeatureSectionStyle}>
        {featuresData.map((feature, index) => (
          <div key={index} style={styles.newFeatureCardStyle}>
            <div style={styles.newFeatureIconStyle}>{feature.icon}</div>
            <h3 style={styles.newFeatureTitleStyle}>{feature.title}</h3>
            <p style={styles.newFeatureDescriptionStyle}>{feature.description}</p>
          </div>
        ))}
      </section>
      {/* --- ADDED DESIGN SECTION END --- */}

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

export default App;