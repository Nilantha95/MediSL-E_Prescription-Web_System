import React, { useState } from 'react';
import logo from '../Main_Interface_UI/images/Logo01.png';
import { IoIosArrowForward } from 'react-icons/io';
import { FaPhoneAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterest, FaWhatsapp} from 'react-icons/fa';
import backgroundImage from '../Main_Interface_UI/images/background.jpg'; // Import your image

const SignInForm = () => {
  const [userType, setUserType] = useState('patient'); // Default to patient
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleUserTypeChange = (type) => {
    setUserType(type);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    // In a real application, you would authenticate the user here
    const loginData = {
      userType,
      email,
      password,
      rememberMe,
    };
    console.log('Sign In Data:', loginData);
    alert('Sign In Successful (for demonstration)'); // Replace with actual authentication logic
    // Optionally redirect the user after successful login
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

        {/* Right Section: Contact Info and Home Button */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px', color: '#007bff' }}>
            <FaPhoneAlt style={{ marginRight: '5px' }} />
            <span>+94 (011) 519-51919</span>
          </div>
          <Link to="/home2" style={{ textDecoration: 'none' }}> {/* Use Link */}
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
              <span>Home</span>
              <IoIosArrowForward style={{ marginLeft: '5px' }} />
            </div>
          </Link>
        </div>
      </header>

      <div style={signInStyles.container}>
        <div style={signInStyles.backgroundOverlay} />
        <div style={signInStyles.formContainer}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
            <div
              style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                marginBottom: '15px',
              }}
            >
              <img
                src="URL_TO_YOUR_SIGN_IN_IMAGE" // Replace with the actual URL or import of your sign-in image
                alt="Sign In"
                style={{ width: '100%', maxWidth: '200px', height: 'auto', display: 'block', margin: '0 auto' }}
              />
            </div>
            <h2 style={signInStyles.heading}>Sign in to your account</h2>
          </div>

          <div style={signInStyles.userType}>
            <button
              type="button"
              style={{
                ...signInStyles.userTypeButton,
                backgroundColor: userType === 'patient' ? '#e0f7fa' : '#f5f5f5',
                color: userType === 'patient' ? '#00bcd4' : '#333',
              }}
              onClick={() => handleUserTypeChange('patient')}
            >
              Patient
            </button>
            <button
              type="button"
              style={{
                ...signInStyles.userTypeButton,
                backgroundColor: userType === 'doctor' ? '#e0f7fa' : '#f5f5f5',
                color: userType === 'doctor' ? '#00bcd4' : '#333',
              }}
              onClick={() => handleUserTypeChange('doctor')}
            >
              Doctor
            </button>
            <button
              type="button"
              style={{
                ...signInStyles.userTypeButton,
                backgroundColor: userType === 'pharmacist' ? '#e0f7fa' : '#f5f5f5',
                color: userType === 'pharmacist' ? '#00bcd4' : '#333',
              }}
              onClick={() => handleUserTypeChange('pharmacist')}
            >
              Pharmacist
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div style={signInStyles.inputGroup}>
              <label htmlFor="email" style={signInStyles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={signInStyles.input}
                required
              />
            </div>

            <div style={signInStyles.inputGroup}>
              <label htmlFor="password" style={signInStyles.label}>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={signInStyles.input}
                required
              />
            </div>

            <div style={signInStyles.rememberForgotPassword}>
              <label style={signInStyles.rememberLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={signInStyles.checkbox}
                />
                Remember me
              </label>
              <Link to="/forgot-password" style={signInStyles.forgotPasswordLink}>
                Forgot password?
              </Link>
            </div>

            {error && <p style={signInStyles.error}>{error}</p>}

            <button type="submit" style={signInStyles.signInButton}>
              Sign In
            </button>
          </form>

          <p style={signInStyles.registerLink}>
            Don't have an account? <Link to="/register" style={signInStyles.link}>Register here</Link>
          </p>
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
              <a href="#" style={iconLinkStyle}><FaPinterest style={socialIcon} /></a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><FaFacebookF style={socialIcon} /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><FaInstagram style={socialIcon} /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><FaTwitter style={socialIcon} /></a>
              <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><FaWhatsapp style={socialIcon} /></a>
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
};

const signInStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px',
    fontFamily: 'Arial, sans-serif',
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
  formContainer: {
    backgroundColor: '#d7f3d2',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    width: '400px',
    maxWidth: '90%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 1,
  },
  heading: {
    fontSize: '2em',
    marginBottom: '20px',
    color: '#333',
    textAlign: 'center',
  },
  userType: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  userTypeButton: {
    padding: '10px 15px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    cursor: 'pointer',
    fontSize: '0.9em',
  },
  inputGroup: {
    marginBottom: '15px',
    width: '100%',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    color: '#555',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '1em',
    boxSizing: 'border-box',
  },
  rememberForgotPassword: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    width: '100%',
    fontSize: '0.9em',
  },
  rememberLabel: {
    display: 'flex',
    alignItems: 'center',
    color: '#555',
  },
  checkbox: {
    marginRight: '5px',
  },
  forgotPasswordLink: {
    color: '#007bff',
    textDecoration: 'none',
  },
  signInButton: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '5px',
    border: 'none',
    fontSize: '1.1em',
    cursor: 'pointer',
    width: '100%',
  },
  registerLink: {
    marginTop: '20px',
    fontSize: '0.9em',
    color: '#555',
    textAlign: 'center',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
  },
};

// Reusing footer styles from RegistrationForm
const footerStyle = {
  backgroundColor: '#d7f3d2',
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
  color: '#333',
};

const socialIcon = {
  // Define your social icon styles here if needed
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

export default SignInForm;