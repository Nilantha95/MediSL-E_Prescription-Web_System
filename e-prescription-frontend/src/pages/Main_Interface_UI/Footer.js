import React, { useState } from 'react';
import { FaPinterest, FaFacebookF, FaInstagram, FaTwitter, FaWhatsapp } from 'react-icons/fa'; // Import social media icons

const Footer = () => {
  // State to manage hover effect for links (workaround for :hover)
  const [hoveredLink, setHoveredLink] = useState(null);

  // Define the styles as JavaScript objects
  const footerContainerStyle = {
    backgroundColor: '#d7f3d2', // Black background
    color: 'black', // White text
    padding: '40px 20px', // Reverted to original padding for overall footer height
    fontFamily: 'Roboto, sans-serif', // Default font for the footer content
  };

  const footerContentStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    maxWidth: '1800px',
    margin: '0 auto',
    flexWrap: 'wrap',
  };

  const footerSectionStyle = {
    flex: '1',
    minWidth: '200px', // Reverted to original min-width
    margin: '0 15px 30px 15px', // Reverted to original horizontal and bottom margin
  };

  const headingStyle = {
    fontSize: '1.2em', // Reverted to original heading size
    marginBottom: '20px', // Reverted to original margin below heading
    color: 'black',
    fontFamily: 'Montserrat, sans-serif', // Montserrat for headings
    fontWeight: '700', // Make headings bold
  };

  const paragraphStyle = {
    fontSize: '0.9em', // Reverted to original paragraph text size
    lineHeight: '1.6', // Reverted to original line height
    color: 'black',
    fontFamily: 'Roboto, sans-serif', // Roboto for paragraphs
  };

  const listStyle = {
    listStyle: 'none',
    padding: '0',
    margin: '0',
  };

  const listItemStyle = {
    marginBottom: '10px', // Reverted to original margin between list items
    fontSize: '0.9em', // Reverted to original list item text size
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'Roboto, sans-serif', // Roboto for list items
  };

  // Function to get link style based on hover state
  const getLinkStyle = (linkName) => ({
    color: hoveredLink === linkName ? 'black' : 'black', // White on hover, else grey
    textDecoration: 'none',
    transition: 'color 0.3s ease',
    fontFamily: 'Roboto, sans-serif', // Ensure links also use Roboto
  });

  const iconStyle = {
    marginRight: '10px', // Reverted to original icon margin
    fontSize: '1.1em', // Reverted to original icon size
    color: 'black', // Set to black for consistency
  };

  // Styles for Follow Us section
  const followUsStyle = {
    flex: '1',
    minWidth: '200px', // Reverted to original min-width for consistency
    margin: '0 15px 30px 15px', // Consistent margins with other sections
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const followUsHeadingStyle = { // Specific style for Follow Us heading
    ...headingStyle, // Inherit base heading styles
    textAlign: 'center', // Override to center just this heading
  };

  const socialIconStyle = {
    display: 'flex',
    gap: '15px', // Reverted to original space between icons
    fontSize: '1.5em', // Reverted to original size of social media icons
    color: 'black', // Color of social media icons
  };

  const iconLinkStyle = {
    color: 'black', // Ensures icon color is black
    textDecoration: 'none', // Removes underline from links
  };

  return (
    <footer style={footerContainerStyle}>
      <div style={footerContentStyle}>
        {/* MediSL Lanka Section */}
        <div style={footerSectionStyle}>
          <h3 style={headingStyle}>MediSL Lanka</h3>
          <p style={paragraphStyle}>Securely manages digital prescriptions, connecting patients, doctors, and pharmacists efficiently.</p>
        </div>

        {/* Quick Links Section */}
        <div style={footerSectionStyle}>
          <h3 style={headingStyle}>Quick Links</h3>
          <ul style={listStyle}>
            <li style={listItemStyle}>
              <a
                href="/home"
                style={getLinkStyle('home')}
                onMouseEnter={() => setHoveredLink('home')}
                onMouseLeave={() => setHoveredLink(null)}
              >
                Home
              </a>
            </li>
            <li style={listItemStyle}>
              <a
                href="/about"
                style={getLinkStyle('about')}
                onMouseEnter={() => setHoveredLink('about')}
                onMouseLeave={() => setHoveredLink(null)}
              >
                About
              </a>
            </li>
            <li style={listItemStyle}>
              <a
                href="/products"
                style={getLinkStyle('products')}
                onMouseEnter={() => setHoveredLink('products')}
                onMouseLeave={() => setHoveredLink(null)}
              >
                Products
              </a>
            </li>
            <li style={listItemStyle}>
              <a
                href="/shop"
                style={getLinkStyle('shop')}
                onMouseEnter={() => setHoveredLink('shop')}
                onMouseLeave={() => setHoveredLink(null)}
              >
                Shop
              </a>
            </li>
          </ul>
        </div>

        {/* Support Section */}
        <div style={footerSectionStyle}>
          <h3 style={headingStyle}>Support</h3>
          <ul style={listStyle}>
            <li style={listItemStyle}>
              <a
                href="/contact"
                style={getLinkStyle('contact')}
                onMouseEnter={() => setHoveredLink('contact')}
                onMouseLeave={() => setHoveredLink(null)}
              >
                Contact Us
              </a>
            </li>
            <li style={listItemStyle}>
              <a
                href="/faq"
                style={getLinkStyle('faq')}
                onMouseEnter={() => setHoveredLink('faq')}
                onMouseLeave={() => setHoveredLink(null)}
              >
                FAQ
              </a>
            </li>
            <li style={listItemStyle}>
              <a
                href="/shipping"
                style={getLinkStyle('shipping')}
                onMouseEnter={() => setHoveredLink('shipping')}
                onMouseLeave={() => setHoveredLink(null)}
              >
                Shipping
              </a>
            </li>
            <li style={listItemStyle}>
              <a
                href="/returns"
                style={getLinkStyle('returns')}
                onMouseEnter={() => setHoveredLink('returns')}
                onMouseLeave={() => setHoveredLink(null)}
              >
                Returns
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Info Section */}
        <div style={footerSectionStyle}>
          <h3 style={headingStyle}>Contact Info</h3>
          <ul style={listStyle}>
            <li style={listItemStyle}>
              <span style={iconStyle}>📞</span>
              <span>+94 11 234 5678</span>
            </li>
            <li style={listItemStyle}>
              <span style={iconStyle}>✉️</span>
              <span>info@tyveklanka.com</span>
            </li>
            <li style={listItemStyle}>
              <span style={iconStyle}>📍</span>
              <span>Colombo, Sri Lanka</span>
            </li>
          </ul>
        </div>

        {/* Follow Us Section - Only this section will have flex-column and centered content */}
        <div style={followUsStyle}>
          <h3 style={followUsHeadingStyle}>Follow us</h3> {/* Use the specific heading style here */}
          <div style={socialIconStyle}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><FaFacebookF /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><FaInstagram /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><FaTwitter /></a>
            <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><FaWhatsapp /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;