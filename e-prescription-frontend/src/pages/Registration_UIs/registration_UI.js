import React, { useState, useEffect } from 'react';
import logo from '../Main_Interface_UI/images/Logo01.png';
import { IoIosArrowForward } from 'react-icons/io';
import { FaPhoneAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { FaUser, FaUserMd, FaUserNurse } from 'react-icons/fa';  // Unused, but kept as per original import
import backgroundImage from '../Main_Interface_UI/images/background.jpg';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import Footer from '../Main_Interface_UI/Footer';

const RegistrationForm = () => {
  const [userType, setUserType] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');

  // Header and Button Hover States
  const [isHomeHovered, setIsHomeHovered] = useState(false);
  const [isSubmitButtonHovered, setIsSubmitButtonHovered] = useState(false);
  const [hoveredUserType, setHoveredUserType] = useState(null);

  // Responsive Styles State
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive style utility function
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

  const handleUserTypeChange = (type) => {
    setUserType(type);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!userType) {
      setError('Please select a user type.');
      return;
    }

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    try {
      // Step 1: Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Step 2: Store user role and profile info in Firestore
      await setDoc(doc(db, 'users', uid), {
        uid,
        email,
        firstName,
        lastName,
        userType,
        createdAt: new Date(),
      });

      alert('Account created successfully!');
      // Reset form
      setUserType('');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAgreeTerms(false);
      setError('');
    } catch (error) {
      console.error('Error creating account:', error);
      setError(error.message);
    }
  };

  // --- Styles Object ---
  const styles = {
    registrationPage: {
      fontFamily: 'Roboto, sans-serif',
      color: '#333',
      lineHeight: '1.6',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh', // Ensure page takes full height
    },
    mainContentArea: {
      flexGrow: 1, // Allows main content to take available space, pushing footer down
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center', // Center content vertically
      padding: getResponsiveStyle('40px 20px', '30px 15px', '25px 10px', '20px 10px'), // Responsive padding
      position: 'relative',
      overflow: 'hidden',
    },
    backgroundOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: 'blur(5px)',
      zIndex: -1,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: getResponsiveStyle('20px 50px', '15px 40px', '12px 20px', '10px 15px'),
      backgroundColor: '#e0ffe0',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      flexWrap: 'wrap',
      flexDirection: getResponsiveStyle('row', 'row', 'column', 'column'),
      alignItems: getResponsiveStyle('center', 'center', 'flex-start', 'center'),
      gap: getResponsiveStyle('0px', '0px', '10px', '10px'),
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
      flexDirection: getResponsiveStyle('row', 'row', 'row', 'column'),
      textAlign: getResponsiveStyle('left', 'left', 'left', 'center'),
      marginBottom: getResponsiveStyle('0', '0', '0', '0px'),
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
      justifyContent: getResponsiveStyle('flex-end', 'flex-end', 'center', 'center'),
      marginTop: getResponsiveStyle('0', '0', '10px', '10px'),
      width: getResponsiveStyle('auto', 'auto', '100%', '100%'),
      flexDirection: getResponsiveStyle('row', 'row', 'row', 'column'),
      gap: getResponsiveStyle('0px', '0px', '10px', '10px'),
    },
    phoneContact: {
      display: 'flex',
      alignItems: 'center',
      marginRight: getResponsiveStyle('25px', '25px', '15px', '0'),
      marginBottom: getResponsiveStyle('0', '0', '0', '5px'),
      color: '#2980b9',
      fontWeight: '500',
      fontSize: getResponsiveStyle('15px', '15px', '14px', '13px'),
      whiteSpace: 'nowrap',
    },
    phoneIcon: {
      marginRight: '8px',
      fontSize: '18px',
    },
    homeButtonLink: {
      textDecoration: 'none',
      flexShrink: 0,
      width: getResponsiveStyle('auto', 'auto', 'auto', '100%'),
      textAlign: 'center',
    },
    homeButton: {
      padding: getResponsiveStyle('12px 25px', '12px 25px', '10px 20px', '8px 18px'),
      border: isHomeHovered ? '1px solid #9cd6fc' : '1px solid #a8dadc',
      borderRadius: '30px',
      backgroundColor: isHomeHovered ? '#9cd6fc' : '#b3e0ff',
      color: isHomeHovered ? '#fff' : '#2980b9',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      transition: 'all 0.3s ease',
      whiteSpace: 'nowrap',
      width: getResponsiveStyle('auto', 'auto', 'auto', '80%'),
      margin: getResponsiveStyle('0', '0', '0', '0 auto'),
    },

    // --- Form Specific Styles ---
    formContainer: {
      backgroundColor: '#fff', // Changed to white for better contrast
      padding: getResponsiveStyle('40px', '30px', '25px', '20px'),
      borderRadius: '10px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)', // Enhanced shadow
      width: getResponsiveStyle('500px', '450px', '90%', '95%'),
      maxWidth: '95%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      zIndex: 1,
      marginTop: '20px', // Space below header
      marginBottom: '40px', // Space above footer
    },
    heading: {
      fontSize: getResponsiveStyle('2.5em', '2.2em', '2em', '1.8em'),
      marginBottom: '10px',
      color: '#2c3e50',
      fontWeight: '700',
    },
    subHeading: {
      fontSize: getResponsiveStyle('1em', '0.95em', '0.9em', '0.85em'),
      color: '#7f8c8d',
      marginBottom: '30px',
    },
    userType: {
      marginBottom: '25px',
      textAlign: 'center',
      width: '100%', // Ensure it takes full width of formContainer
    },
    userTypeLabel: {
      display: 'block',
      marginBottom: '10px',
      color: '#555',
      fontWeight: '600',
      fontSize: getResponsiveStyle('1em', '0.95em', '0.9em', '0.85em'),
    },
    userTypeButtons: {
      display: 'flex',
      gap: getResponsiveStyle('15px', '12px', '10px', '8px'),
      justifyContent: 'center',
      flexWrap: 'wrap', // Allow buttons to wrap on smaller screens
    },
    userTypeButton: (type) => ({
      padding: getResponsiveStyle('12px 20px', '10px 18px', '8px 15px', '8px 12px'),
      borderRadius: '8px', // Slightly larger border-radius
      border: `1px solid ${userType === type ? '#2ecc71' : '#e0e0e0'}`, // Green border for active
      backgroundColor: userType === type ? '#e6ffe6' : (hoveredUserType === type ? '#f0f0f0' : '#f9f9f9'), // Light green for active
      color: userType === type ? '#2ecc71' : '#555', // Darker green text for active
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontSize: getResponsiveStyle('0.95em', '0.9em', '0.85em', '0.8em'),
      fontWeight: userType === type ? 'bold' : 'normal',
      transition: 'all 0.3s ease',
      minWidth: getResponsiveStyle('120px', '110px', '100px', '90px'), // Ensure consistent button width
      flexGrow: 1, // Allow buttons to grow to fill space
    }),
    userTypeIcon: {
      width: getResponsiveStyle('25px', '22px', '20px', '18px'),
      height: getResponsiveStyle('25px', '22px', '20px', '18px'),
      marginBottom: '8px',
      color: userType ? (userType === hoveredUserType ? '#2ecc71' : '#007bff') : '#95a5a6', // Dynamic color
      transition: 'color 0.3s ease',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      color: '#555',
      fontWeight: '600',
      fontSize: getResponsiveStyle('0.95em', '0.9em', '0.85em', '0.8em'),
    },
    inputGroup: {
      marginBottom: '20px',
      width: '100%', // Ensure it takes full width
    },
    input: {
      width: '100%',
      padding: getResponsiveStyle('12px', '10px', '9px', '8px'),
      borderRadius: '8px',
      border: '1px solid #ccc',
      fontSize: getResponsiveStyle('1em', '0.95em', '0.9em', '0.85em'),
      boxSizing: 'border-box',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      '&:focus': {
        borderColor: '#2ecc71',
        boxShadow: '0 0 0 3px rgba(46, 204, 113, 0.2)',
        outline: 'none',
      },
    },
    nameFields: {
      display: 'flex',
      gap: getResponsiveStyle('20px', '15px', '10px', '10px'),
      marginBottom: '20px',
      width: '100%',
      flexDirection: getResponsiveStyle('row', 'row', 'column', 'column'), // Stack on small screens
    },
    terms: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '25px',
      width: '100%',
      flexWrap: 'wrap', // Allow text to wrap
    },
    checkbox: {
      marginRight: '10px',
      minWidth: '20px', // Ensure checkbox is not too small
      minHeight: '20px',
      cursor: 'pointer',
    },
    termsLabel: {
      fontSize: getResponsiveStyle('0.9em', '0.85em', '0.8em', '0.75em'),
      color: '#555',
      lineHeight: '1.4',
    },
    link: {
      color: '#2980b9', // A slightly darker blue for better contrast
      textDecoration: 'none',
      transition: 'color 0.3s ease',
      '&:hover': {
        color: '#1a5f8b',
      },
    },
    createAccountButton: {
      backgroundColor: isSubmitButtonHovered ? '#27ae60' : '#2ecc71', // Green shades for consistency
      color: '#fff',
      padding: getResponsiveStyle('15px 30px', '12px 25px', '10px 20px', '8px 18px'),
      borderRadius: '30px',
      border: 'none',
      fontSize: getResponsiveStyle('1.1em', '1em', '0.95em', '0.9em'),
      fontWeight: 'bold',
      cursor: 'pointer',
      width: getResponsiveStyle('100%', '100%', '90%', '90%'), // Wider button
      transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
      boxShadow: isSubmitButtonHovered ? '0 8px 20px rgba(46, 204, 113, 0.4)' : '0 5px 15px rgba(46, 204, 113, 0.3)',
      transform: isSubmitButtonHovered ? 'translateY(-2px)' : 'translateY(0)',
      display: 'flex', // Center text and possibly icon if added
      justifyContent: 'center',
      alignItems: 'center',
      margin: '0 auto', // Center the button horizontally
    },
    loginLink: {
      marginTop: '20px',
      fontSize: getResponsiveStyle('0.9em', '0.85em', '0.8em', '0.75em'),
      color: '#555',
      textAlign: 'center',
    },
    error: {
      color: '#e74c3c', // A more distinct error red
      marginBottom: '15px',
      fontSize: getResponsiveStyle('0.9em', '0.85em', '0.8em', '0.75em'),
      textAlign: 'center',
      width: '100%',
    },
  };

  // Inline styles for input focus (cannot be directly in style object)
  const getInputStyle = (isFocused) => ({
    ...styles.input,
    borderColor: isFocused ? '#2ecc71' : '#ccc',
    boxShadow: isFocused ? '0 0 0 3px rgba(46, 204, 113, 0.2)' : 'none',
  });

  return (
    <div style={styles.registrationPage}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img src={logo} alt="E-Prescribe Logo" style={styles.logo} />
          <div>
            <h1 style={styles.siteTitle}>E-Prescribe</h1>
            <p style={styles.tagline}>Digital Healthcare</p>
          </div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.phoneContact}>
            <FaPhoneAlt style={styles.phoneIcon} />
            <span>+94 (011) 519-51919</span>
          </div>
          <Link to="/" style={styles.homeButtonLink}> {/* Link to Home page */}
            <div
              style={styles.homeButton}
              onMouseEnter={() => setIsHomeHovered(true)}
              onMouseLeave={() => setIsHomeHovered(false)}
            >
              <span>HOME</span>
              <IoIosArrowForward style={styles.registerArrow} />
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={styles.mainContentArea}>
        <div style={styles.backgroundOverlay} />
        <div style={styles.formContainer}>
          <h2 style={styles.heading}>Create an Account</h2>
          <p style={styles.subHeading}>Join our E-prescription management system</p>
          <div style={styles.userType}>
            <p style={styles.userTypeLabel}>I am a</p>
            <div style={styles.userTypeButtons}>
              <button
                            type="button"
                            style={styles.userTypeButton('patient')}
                            onClick={() => handleUserTypeChange('patient')}
                            onMouseEnter={() => setHoveredUserType('patient')}
                            onMouseLeave={() => setHoveredUserType(null)}
                          >
                          <FaUser style={styles.userTypeIcon} />
                            Patient
                          </button>
                          <button
                            type="button"
                            style={styles.userTypeButton('doctor')}
                            onClick={() => handleUserTypeChange('doctor')}
                            onMouseEnter={() => setHoveredUserType('doctor')}
                            onMouseLeave={() => setHoveredUserType(null)}
                          >
                            <FaUserMd style={styles.userTypeIcon} />
                            Doctor
                          </button>
                          <button
                            type="button"
                            style={styles.userTypeButton('pharmacist')}
                            onClick={() => handleUserTypeChange('pharmacist')}
                            onMouseEnter={() => setHoveredUserType('pharmacist')}
                            onMouseLeave={() => setHoveredUserType(null)}
                          >
                            <FaUserNurse style={styles.userTypeIcon} />
                            Pharmacist
                          </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div style={styles.nameFields}>
              <div style={styles.inputGroup}>
                <label htmlFor="firstName" style={styles.label}>
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={getInputStyle(false)} // Pass false as default focus state
                  onFocus={(e) => (e.target.style.borderColor = styles.input['&:focus'].borderColor, e.target.style.boxShadow = styles.input['&:focus'].boxShadow)}
                  onBlur={(e) => (e.target.style.borderColor = styles.input.border.split(' ')[2], e.target.style.boxShadow = 'none')}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="lastName" style={styles.label}>
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={getInputStyle(false)}
                  onFocus={(e) => (e.target.style.borderColor = styles.input['&:focus'].borderColor, e.target.style.boxShadow = styles.input['&:focus'].boxShadow)}
                  onBlur={(e) => (e.target.style.borderColor = styles.input.border.split(' ')[2], e.target.style.boxShadow = 'none')}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="email" style={styles.label}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={getInputStyle(false)}
                onFocus={(e) => (e.target.style.borderColor = styles.input['&:focus'].borderColor, e.target.style.boxShadow = styles.input['&:focus'].boxShadow)}
                onBlur={(e) => (e.target.style.borderColor = styles.input.border.split(' ')[2], e.target.style.boxShadow = 'none')}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="password" style={styles.label}>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={getInputStyle(false)}
                onFocus={(e) => (e.target.style.borderColor = styles.input['&:focus'].borderColor, e.target.style.boxShadow = styles.input['&:focus'].boxShadow)}
                onBlur={(e) => (e.target.style.borderColor = styles.input.border.split(' ')[2], e.target.style.boxShadow = 'none')}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="confirmPassword" style={styles.label}>
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={getInputStyle(false)}
                onFocus={(e) => (e.target.style.borderColor = styles.input['&:focus'].borderColor, e.target.style.boxShadow = styles.input['&:focus'].boxShadow)}
                onBlur={(e) => (e.target.style.borderColor = styles.input.border.split(' ')[2], e.target.style.boxShadow = 'none')}
                required
              />
            </div>

            <div style={styles.terms}>
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={styles.checkbox}
                required
              />
              <label htmlFor="agreeTerms" style={styles.termsLabel}>
                I agree to the <a href="/terms" style={styles.link}>Terms of Service</a> and{' '}
                <a href="/privacy" style={styles.link}>Privacy Policy</a>
              </label>
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button
              type="submit"
              style={styles.createAccountButton}
              onMouseEnter={() => setIsSubmitButtonHovered(true)}
              onMouseLeave={() => setIsSubmitButtonHovered(false)}
            >
              Create Account
            </button>
          </form>

          <p style={styles.loginLink}>
            Already have an account? <Link to="/signin" style={styles.link}>Sign in</Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default RegistrationForm;