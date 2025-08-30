// used AI tools to code enhacements and designing parts.

import React, { useState, useEffect } from 'react';
import logo from '../Main_Interface_UI/images/Logo01.png';
import { IoIosArrowForward } from 'react-icons/io';
import { FaPhoneAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaUserSecret } from 'react-icons/fa';
import { FaUser, FaUserMd, FaUserNurse } from 'react-icons/fa';
import backgroundImage from '../Main_Interface_UI/images/background.jpg';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import Footer from '../Main_Interface_UI/Footer';

const SignInForm = () => {
  const [userType, setUserType] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Header and Button Hover States
  const [isHomeHovered, setIsHomeHovered] = useState(false);
  const [isSignInButtonHovered, setIsSignInButtonHovered] = useState(false);
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

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('Logged in Firebase User UID:', user.uid);

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      console.log('Does Firestore document exist for this UID?', docSnap.exists());

      if (docSnap.exists()) {
        const userData = docSnap.data();

        console.log('Firestore Data for this UID:', userData);
        console.log('Selected User Type on form:', userType);
        console.log('Firestore userType:', userData.userType);

        if (userData.userType !== userType) {
          setError(`You are registered as a ${userData.userType}. Please select the correct user type.`);
          return;
        }

        // Role-based navigation
        if (userType === 'doctor') {
          navigate('/doctor/dashboard');
        } else if (userType === 'patient') {
          navigate('/patient/dashboard');
        } else if (userType === 'pharmacist') {
          navigate('/pharmacy/dashboard');
        } else if (userType === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('User role not found. Please register or contact support.');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Failed to sign in. Please try again later.');
      }
    }
  };

  // --- Styles Object ---
  const styles = {
    signInPage: {
      fontFamily: 'Roboto, sans-serif',
      color: '#333',
      lineHeight: '1.6',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
    },
    mainContentArea: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: getResponsiveStyle('40px 20px', '30px 15px', '25px 10px', '20px 10px'),
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
      backgroundColor: '#fff',
      padding: getResponsiveStyle('40px', '30px', '25px', '20px'),
      borderRadius: '10px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
      width: getResponsiveStyle('450px', '400px', '90%', '95%'),
      maxWidth: '95%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      zIndex: 1,
      marginTop: '20px',
      marginBottom: '40px',
    },
    heading: {
      fontSize: getResponsiveStyle('2.5em', '2.2em', '2em', '1.8em'),
      marginBottom: '20px',
      color: '#2c3e50',
      fontWeight: '700',
      textAlign: 'center',
    },
    userType: {
      display: 'flex',
      gap: getResponsiveStyle('15px', '12px', '10px', '8px'),
      marginBottom: '25px',
      width: '100%',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    userTypeButton: (type) => ({
      padding: getResponsiveStyle('12px 20px', '10px 18px', '8px 15px', '8px 12px'),
      borderRadius: '8px',
      border: `1px solid ${userType === type ? '#2ecc71' : '#e0e0e0'}`,
      backgroundColor: userType === type ? '#e6ffe6' : (hoveredUserType === type ? '#f0f0f0' : '#f9f9f9'),
      color: userType === type ? '#2ecc71' : '#555',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontSize: getResponsiveStyle('0.95em', '0.9em', '0.85em', '0.8em'),
      fontWeight: userType === type ? 'bold' : 'normal',
      transition: 'all 0.3s ease',
      minWidth: getResponsiveStyle('120px', '110px', '100px', '90px'),
      flexGrow: 1,
    }),
    userTypeIcon: {
      width: getResponsiveStyle('25px', '22px', '20px', '18px'),
      height: getResponsiveStyle('25px', '22px', '20px', '18px'),
      marginBottom: '8px',
      color: (userType === hoveredUserType && userType) ? '#2ecc71' : (userType === 'patient' || userType === 'doctor' || userType === 'pharmacist' || userType === 'admin' ? '#2980b9' : '#95a5a6'),
      transition: 'color 0.3s ease',
    },
    inputGroup: {
      marginBottom: '20px',
      width: '100%',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      color: '#555',
      fontWeight: '600',
      fontSize: getResponsiveStyle('0.95em', '0.9em', '0.85em', '0.8em'),
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
    rememberForgotPassword: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '25px',
      width: '100%',
      fontSize: getResponsiveStyle('0.9em', '0.85em', '0.8em', '0.75em'),
      flexWrap: 'wrap',
      gap: getResponsiveStyle('0', '0', '10px', '10px'),
    },
    rememberLabel: {
      display: 'flex',
      alignItems: 'center',
      color: '#555',
      cursor: 'pointer',
    },
    checkbox: {
      marginRight: '8px',
      minWidth: '20px',
      minHeight: '20px',
      cursor: 'pointer',
    },
    forgotPasswordLink: {
      color: '#2980b9',
      textDecoration: 'none',
      transition: 'color 0.3s ease',
      '&:hover': {
        color: '#1a5f8b',
      },
    },
    signInButton: {
      backgroundColor: isSignInButtonHovered ? '#27ae60' : '#2ecc71',
      color: '#fff',
      padding: getResponsiveStyle('15px 30px', '12px 25px', '10px 20px', '8px 18px'),
      borderRadius: '30px',
      border: 'none',
      fontSize: getResponsiveStyle('1.1em', '1em', '0.95em', '0.9em'),
      fontWeight: 'bold',
      cursor: 'pointer',
      width: getResponsiveStyle('100%', '100%', '90%', '90%'),
      transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
      boxShadow: isSignInButtonHovered ? '0 8px 20px rgba(46, 204, 113, 0.4)' : '0 5px 15px rgba(46, 204, 113, 0.3)',
      transform: isSignInButtonHovered ? 'translateY(-2px)' : 'translateY(0)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '0 auto',
    },
    registerLink: {
      marginTop: '25px',
      fontSize: getResponsiveStyle('0.9em', '0.85em', '0.8em', '0.75em'),
      color: '#555',
      textAlign: 'center',
    },
    link: {
      color: '#2980b9',
      textDecoration: 'none',
      transition: 'color 0.3s ease',
      '&:hover': {
        color: '#1a5f8b',
      },
    },
    error: {
      color: '#e74c3c',
      marginBottom: '15px',
      fontSize: getResponsiveStyle('0.9em', '0.85em', '0.8em', '0.75em'),
      textAlign: 'center',
      width: '100%',
      fontWeight: '500',
    },
  };

  // Inline styles for input focus (applied via onFocus/onBlur)
  const getInputStyle = () => ({
    ...styles.input,
  });

  return (
    <div style={styles.signInPage}>
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
          <Link to="/" style={styles.homeButtonLink}>
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
          <h2 style={styles.heading}>Sign in to your account</h2>

          <div style={styles.userType}>
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
            <button
              type="button"
              style={styles.userTypeButton('admin')}
              onClick={() => handleUserTypeChange('admin')}
              onMouseEnter={() => setHoveredUserType('admin')}
              onMouseLeave={() => setHoveredUserType(null)}
            >
              <FaUserSecret style={styles.userTypeIcon} />
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div style={styles.inputGroup}>
              <label htmlFor="email" style={styles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={getInputStyle()}
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
                style={getInputStyle()}
                onFocus={(e) => (e.target.style.borderColor = styles.input['&:focus'].borderColor, e.target.style.boxShadow = styles.input['&:focus'].boxShadow)}
                onBlur={(e) => (e.target.style.borderColor = styles.input.border.split(' ')[2], e.target.style.boxShadow = 'none')}
                required
              />
            </div>

            <div style={styles.rememberForgotPassword}>
              <label style={styles.rememberLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={styles.checkbox}
                />
                Remember me
              </label>
              <Link to="/forgot-password" style={styles.forgotPasswordLink}>
                Forgot password?
              </Link>
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button
              type="submit"
              style={styles.signInButton}
              onMouseEnter={() => setIsSignInButtonHovered(true)}
              onMouseLeave={() => setIsSignInButtonHovered(false)}
            >
              Sign In
            </button>
          </form>

          <p style={styles.registerLink}>
            Don't have an account? <Link to="/register" style={styles.link}>Register here</Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SignInForm;