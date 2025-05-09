import React, { useState } from 'react';
import logo from '../Main_Interface_UI/images/Logo01.png';
import { IoIosArrowForward } from 'react-icons/io';
import { FaPhoneAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterest, FaWhatsapp} from 'react-icons/fa';
import backgroundImage from '../Main_Interface_UI/images/background.jpg'; // Import your image

const RegistrationForm = () => {
  const [userType, setUserType] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');

  const handleUserTypeChange = (type) => {
    setUserType(type);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

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

    // In a real application, you would send this data to your backend for registration
    const registrationData = {
      userType,
      firstName,
      lastName,
      email,
      password,
    };
    console.log('Registration Data:', registrationData);
    // Reset the form and clear errors upon successful submission (for demonstration)
    setUserType('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setAgreeTerms(false);
    setError('');
    alert('Account created successfully!'); // Replace with actual success handling
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
          <Link to="/home2" style={{ textDecoration: 'none' }}> {/* Use Link instead of button */}
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

      <div style={styles.container}>
        <div style={styles.backgroundOverlay} />
        <div style={styles.formContainer}>
          <h2 style={{ ...styles.heading, textAlign: 'center' }}>Create an Account</h2>
          <p style={{ ...styles.subHeading, textAlign: 'center' }}>Join our E-prescription management system</p>
          <div style={styles.userType}>
            <p style={styles.label}>I am a</p>
            <div style={styles.userTypeButtons}>
              <button
                type="button"
                style={{
                  ...styles.userTypeButton,
                  backgroundColor: userType === 'patient' ? '#e0f7fa' : '#f5f5f5',
                  color: userType === 'patient' ? '#00bcd4' : '#333',
                }}
                onClick={() => handleUserTypeChange('patient')}
              >
                <span role="img" aria-label="patient">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={styles.icon}>
                    <path d="M12 4a4 4 0 100 8 4 4 0 000-8zm0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4z" />
                  </svg>
                </span>
                Patient
              </button>
              <button
                type="button"
                style={{
                  ...styles.userTypeButton,
                  backgroundColor: userType === 'doctor' ? '#e0f7fa' : '#f5f5f5',
                  color: userType === 'doctor' ? '#00bcd4' : '#333',
                }}
                onClick={() => handleUserTypeChange('doctor')}
              >
                <span role="img" aria-label="doctor">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={styles.icon}>
                    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 10h-2v2h2v-2zm3 0h-2v2h2v-2zm3 0h-2v2h2v-2z" />
                  </svg>
                </span>
                Doctor
              </button>
              <button
                type="button"
                style={{
                  ...styles.userTypeButton,
                  backgroundColor: userType === 'pharmacist' ? '#e0f7fa' : '#f5f5f5',
                  color: userType === 'pharmacist' ? '#00bcd4' : '#333',
                }}
                onClick={() => handleUserTypeChange('pharmacist')}
              >
                <span role="img" aria-label="pharmacist">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={styles.icon}>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 4.97 6 13 6 13s6-8.03 6-13c0-3.87-3.13-7-7-7zm0 9c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
                  </svg>
                </span>
                Pharmacist
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
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
                  style={styles.input}
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
                  style={styles.input}
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
                style={styles.input}
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
                style={styles.input}
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
                style={styles.input}
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

            <button type="submit" style={styles.createAccountButton}>
              Create Account
            </button>
          </form>

          <p style={styles.loginLink}>
            Already have an account? <Link to="./signin.js" style={styles.link}>Sign in</Link>
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
};

const styles = {
 container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px',
    fontFamily: 'Arial, sans-serif',
    position: 'relative', // Make container relative for absolute positioning of overlay
    overflow: 'hidden', // Clip the background image within the container bounds
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
    filter: 'blur(5px)', // Adjust the blur intensity as needed
    zIndex: -1, // Place the overlay behind the form container
  },
  heading: {
    fontSize: '2.5em',
    marginBottom: '10px',
    color: '#333',
  },
  subHeading: {
    fontSize: '1em',
    color: '#6c757d',
    marginBottom: '30px',
  },
  formContainer: {
    backgroundColor: '#d7f3d2', // Add your desired background color here
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    width: '400px',
    maxWidth: '90%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 1, // Ensure the form container is above the blurred background
  },
  userType: {
    marginBottom: '20px',
    textAlign: 'center',
  },
  userTypeButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginTop: '10px',
  },
  userTypeButton: {
    padding: '10px 15px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: '0.9em',
  },
  icon: {
    width: '20px',
    height: '20px',
    marginBottom: '5px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    color: '#555',
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: '15px',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '1em',
    boxSizing: 'border-box',
  },
  nameFields: {
    display: 'flex',
    gap: '15px',
    marginBottom: '15px',
  },
  terms: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
  },
  checkbox: {
    marginRight: '10px',
  },
  termsLabel: {
    fontSize: '0.9em',
    color: '#555',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
  },
  createAccountButton: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '5px',
    border: 'none',
    fontSize: '1.1em',
    cursor: 'pointer',
    width: '100%',
  },
  loginLink: {
    marginTop: '20px',
    fontSize: '0.9em',
    color: '#555',
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
  },
};
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

export default RegistrationForm;