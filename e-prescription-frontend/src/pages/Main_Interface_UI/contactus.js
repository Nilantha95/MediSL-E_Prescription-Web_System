import React from 'react';
import { IoIosArrowForward } from 'react-icons/io';
import { Link } from 'react-router-dom';

function ContactUs() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerText}>Contact Us</h1>
        {/* You might want to include the image here as a background or an <img> tag */}
      </div>
      <div style={styles.content}>
        <div style={styles.findUs}>
          <h2 style={styles.sectionTitle}>How to Find Us</h2>
          <p style={styles.paragraph}>
            If you have any questions, just fill in the contact form, and we will answer you shortly.
            If you are living nearby, come visit TaxExpert at one of our comfortable offices.
          </p>
          <div style={styles.headquarters}>
            <h3 style={styles.subTitle}>Headquarters</h3>
            <p style={styles.address}>
              8863 - 9867 MILL ROAD, CAMBRIDGE, MG09 99HT.
            </p>
            <p style={styles.phone}>
              Telephone: +1 800 603 6035
            </p>
            <p style={styles.email}>
              E-mail: <a href="mailto:mail@demolink.org" style={styles.link}>mail@demolink.org</a>
            </p>
          </div>
        </div>
        <div style={styles.getInTouch}>
          <h2 style={styles.sectionTitle}>Get in Touch</h2>
          <form style={styles.form}>
            <div style={styles.formRow}>
              <input type="text" placeholder="Name" style={styles.input} />
              <input type="email" placeholder="Email" style={styles.input} />
            </div>
            <div style={styles.formRow}>
              <textarea placeholder="Message" style={styles.textarea}></textarea>
            </div>
            {/* You'd likely add a submit button here */}
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'sans-serif', // Add your desired font
    color: '#333', // Add your desired text color
  },
  header: {
    backgroundColor: '#f0f0f0', // Example background color
    padding: '20px',
    textAlign: 'center',
    // Add background image styles here if needed
  },
  headerText: {
    fontSize: '2em',
    margin: '0',
  },
  content: {
    display: 'flex',
    padding: '20px',
    gap: '40px', // Space between the two sections
  },
  findUs: {
    flex: 1,
  },
  getInTouch: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: '1.5em',
    marginBottom: '15px',
    color: '#555',
  },
  paragraph: {
    lineHeight: '1.6',
    marginBottom: '20px',
  },
  headquarters: {
    marginTop: '20px',
  },
  subTitle: {
    fontSize: '1.2em',
    marginBottom: '10px',
    color: '#777',
  },
  address: {
    marginBottom: '5px',
  },
  phone: {
    marginBottom: '5px',
  },
  email: {
    marginBottom: '5px',
  },
  link: {
    color: '#007bff', // Example link color
    textDecoration: 'none',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
  },
  input: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
  },
  textarea: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    minHeight: '100px',
    marginBottom: '15px',
  },
};

export default ContactUs;