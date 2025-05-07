import React from 'react';
//import mainimage from './images/ePrescribing-Market-Website-1-New-e1652693967748.jpg';
import logo from '../Main_Interface_UI/images/Logo_02.png';
import doc from '../Main_Interface_UI/images/Doctor.png';
import patient from './images/Patient.png';
import phar from './images/pharmacist.png';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import slide1 from './images/slide01.png';
import slide2 from './images/slide02.png';
import slide3 from './images/slide03.png';



function App() {
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', borderBottom: '1px solid #eee' }}>
        <div>
        <img src={logo} alt="E-Prescribe Logo" style={{ height: '50px' }} />
        </div>
        <nav>
          <ul style={{ listStyle: 'none', display: 'flex', gap: '20px', margin: 0, padding: 0 }}>
            <li><a href="/" style={{ textDecoration: 'none', color: '#333' }}>Home</a></li>
            <li><a href="/about" style={{ textDecoration: 'none', color: '#333' }}>About Us</a></li>
            <li><a href="/contact" style={{ textDecoration: 'none', color: '#333' }}>Contact</a></li>
          </ul>
        </nav>
        <button style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Login</button>
      </header>

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
                  }} 
/> {/* Replace with your actual icon path */}
            <h3 style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>For Doctors</h3>
            <p style={{ fontSize: '0.9em', color: '#555', lineHeight: '1.4' }}>Easily create and manage digital prescriptions, access patient history, and ensure accurate medication details.</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
          <img 
            src={patient} 
            alt="For Doctors" 
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
            alt="For Doctors" 
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

      {/* What Our Users Say Section */}
      <section style={{ padding: '60px 50px' }}>
        <h2 style={{ fontSize: '2em', fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: '40px' }}>What Our Users Say</h2>
        <div style={{ display: 'flex', justifyContent: 'space-around', gap: '30px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <img src="/user1.png" alt="Dr. Sarah Johnson" style={{ height: '50px', width: '50px', borderRadius: '50%', marginRight: '15px', objectFit: 'cover' }} /> {/* Replace with your actual image path */}
              <div>
                <h4 style={{ fontSize: '1em', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>Dr. Sarah Johnson</h4>
                <p style={{ fontSize: '0.8em', color: '#777' }}>General Practitioner</p>
              </div>
            </div>
            <p style={{ fontSize: '0.9em', color: '#555', lineHeight: '1.4' }}>"E-Prescribe has revolutionized how I manage prescriptions. It's efficient, secure, and my patients love it!"</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <img src="/user2.png" alt="Michael Chen" style={{ height: '50px', width: '50px', borderRadius: '50%', marginRight: '15px', objectFit: 'cover' }} /> {/* Replace with your actual image path */}
              <div>
                <h4 style={{ fontSize: '1em', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>Michael Chen</h4>
                <p style={{ fontSize: '0.8em', color: '#777' }}>Pharmacist</p>
              </div>
            </div>
            <p style={{ fontSize: '0.9em', color: '#555', lineHeight: '1.4' }}>"This platform has streamlined our workflow and reduced prescription processing time significantly."</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#222', color: 'white', padding: '40px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '0.9em' }}>
        <div>
          <h4 style={{ marginBottom: '15px' }}>E-Prescribe</h4>
          <p>Making healthcare more accessible and efficient through digital solutions.</p>
        </div>
        <div>
          <h4 style={{ marginBottom: '15px' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li><a href="/" style={{ textDecoration: 'none', color: '#eee' }}>Home</a></li>
            <li><a href="/about" style={{ textDecoration: 'none', color: '#eee' }}>About Us</a></li>
            <li><a href="/contact" style={{ textDecoration: 'none', color: '#eee' }}>Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 style={{ marginBottom: '15px' }}>Contact Us</h4>
          <p>Email: <a href="mailto:info@eprescribe.com" style={{ color: '#eee', textDecoration: 'none' }}>info@eprescribe.com</a></p>
          <p>Phone: +1 (555) 123-4567</p>
        </div>
        <div>
          <h4 style={{ marginBottom: '15px' }}>Follow Us</h4>
          {/* Add social media icons here */}
          <div>
            <a href="/" style={{ color: '#eee', marginRight: '10px' }}>{/* Facebook Icon */}</a>
            <a href="/" style={{ color: '#eee', marginRight: '10px' }}>{/* Twitter Icon */}</a>
            <a href="/" style={{ color: '#eee' }}>{/* LinkedIn Icon */}</a>
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