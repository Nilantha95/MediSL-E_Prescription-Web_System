import React from 'react';
import logo from '../Main_Interface_UI/images/Logo01.png';
import doc from '../Main_Interface_UI/images/Doctor.png';
import patient from './images/Patient.png';
import phar from './images/pharmacist.png';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import slide1 from './images/slide01.png';
import slide2 from './images/slide02.png';
import slide3 from './images/slide03.png';
import user1 from './images/aboutdoc.png';
import user2 from './images/phar.png';
import background from './images/interfacescrolling.jpg';
import { FaPhoneAlt } from 'react-icons/fa';
import { IoIosArrowForward, IoIosArrowDown } from 'react-icons/io';
import { Link } from 'react-router-dom';
import Footer from './Footer'; // Assuming Footer.js is in the same directory, adjust path if needed

function App() {
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
        {/* Removed social media icons from here as they are in the new footer */}
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '80px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ maxWidth: '500px' }}>
          <h1 style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#333', marginBottom: '20px' }}>Digital Prescription Management Made Simple</h1>
          <p style={{ fontSize: '1em', color: '#555', lineHeight: '1.6' }}>Streamline your healthcare experience with our secure e-prescription platform connecting patients, doctors, and pharmacists.</p>
          <button style={{ padding: '15px 30px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '30px' }}>Get Started</button>
        </div>
        <div style={{ width: '500px', marginLeft: '20px' }}>
          <Slider
            dots={true}
            infinite={true}
            speed={500}
            slidesToShow={1}
            slidesToScroll={1}
            autoplay={true}
            autoplaySpeed={3000}
          >
            {[slide1, slide2, slide3].map((img, idx) => (
              <div key={idx}>
                <img
                  src={img}
                  alt={`Slide ${idx + 1}`}
                  style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: '10px'
                  }}
                />
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* Why Choose E-Prescribe? Section */}
      <section style={{ padding: '60px 50px', backgroundColor: '#f9f9f9' }}>
        <h2 style={{ fontSize: '2em', fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: '40px' }}>Why Choose E-Prescribe?</h2>
        <div style={{ display: 'flex', justifyContent: 'space-around', gap: '30px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <img
              src={doc}
              alt="For Doctors"
              style={{
                height: '100px',
                marginBottom: '10px',
                borderRadius: '100%'
              }} /> {/* Replace with your actual icon path */}
            <h3 style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>For Doctors</h3>
            <p style={{ fontSize: '0.9em', color: '#555', lineHeight: '1.4' }}>Easily create and manage digital prescriptions, access patient history, and ensure accurate medication details.</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <img
              src={patient}
              alt="For Patients"
              style={{
                height: '100px',
                marginBottom: '10px',
                borderRadius: '100%'
              }} />
            <h3 style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>For Patients</h3>
            <p style={{ fontSize: '0.9em', color: '#555', lineHeight: '1.4' }}>Access your prescriptions anywhere, receive medication reminders, and share records securely with healthcare providers.</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <img
              src={phar}
              alt="For Pharmacists"
              style={{
                height: '100px',
                marginBottom: '10px',
                borderRadius: '100%'
              }} />
            <h3 style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>For Pharmacists</h3>
            <p style={{ fontSize: '0.9em', color: '#555', lineHeight: '1.4' }}>Process prescriptions efficiently, reduce errors, and maintain digital records of dispensed medications.</p>
          </div>
        </div>
      </section>

      {/* Parallax Section */}
      <section style={{
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#333', // Darker text color for better contrast
        padding: '100px 50px',
        textAlign: 'center',
        position: 'relative', // Needed for overlay and background styling
      }}>
        {/* Background Image with Blur */}
        <div style={{
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
          zIndex: 0, // Place the background behind other content
        }} />
        {/* Overlay to darken the background slightly for better text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent dark overlay
          zIndex: 1, // Place the overlay above the background
        }} />
        {/* Text Content */}
        <div style={{ position: 'relative', zIndex: 2 }}> {/* Ensure text is above the overlay and background */}
          <h2 style={{ fontSize: '3.0em', fontWeight: 'bold', marginBottom: '25px', color: '#eee', textShadow: '2px 2px 4px #000000' }}>Experience the Future of Prescriptions</h2>
          <p style={{ fontSize: '1.2em', lineHeight: '1.9', maxWidth: '850px', margin: '0 auto', color: '#ddd', textShadow: '1px 1px 2px #000000' }}>
            Experience the future of prescriptions with our smart, secure, and AI-powered platform. Manage medications effortlessly, eliminate paper trails, and connect doctors and pharmacies seamlessly—all in one digital solution.
          </p>
        </div>
      </section>

      {/* What Our Users Say Section */}
      <section style={{ padding: '60px 50px' }}>
        <h2 style={{ fontSize: '2em', fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: '40px' }}>What Our Users Say</h2>
        <div style={{ display: 'flex', justifyContent: 'space-around', gap: '30px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <img src={user1} alt="Dr. John Cena" style={{ height: '80px', width: '80px', borderRadius: '50%', marginRight: '15px', objectFit: 'cover' }} /> {/* Replace with your actual image path */}
              <div>
                <h4 style={{ fontSize: '1em', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>Dr. John Cena</h4>
                <p style={{ fontSize: '0.8em', color: '#777' }}>General Practitioner</p>
              </div>
            </div>
            <p style={{ fontSize: '0.9em', color: '#555', lineHeight: '1.4' }}>"E-Prescribe has revolutionized how I manage prescriptions. It's efficient, secure, and my patients love it!"</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <img src={user2} alt="Menoli Silva" style={{ height: '80px', width: '80px', borderRadius: '80%', marginRight: '15px', objectFit: 'cover' }} /> {/* Replace with your actual image path */}
              <div>
                <h4 style={{ fontSize: '1em', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>Menoli Silva</h4>
                <p style={{ fontSize: '0.8em', color: '#777' }}>Pharmacist</p>
              </div>
            </div>
            <p style={{ fontSize: '0.9em', color: '#555', lineHeight: '1.4' }}>"This platform has streamlined our workflow and reduced prescription processing time significantly."</p>
          </div>
        </div>
      </section>

      {/* New Footer Component */}
      <Footer />
    </div>
  );
}
export default App;