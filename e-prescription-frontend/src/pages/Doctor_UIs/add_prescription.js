import React, { useState, useEffect, useRef } from 'react';
import logo from '../Main_Interface_UI/images/Logo01.png';
import pic from '../Main_Interface_UI/images/Doctor.png';
import { FaPhoneAlt } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterest, FaWhatsapp} from 'react-icons/fa';

// Firebase Imports
import { db, storage } from '../firebase'; // Ensure 'storage' is imported from firebase.js
import { collection, addDoc, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { ref, uploadString, getDownloadURL } from 'firebase/storage'; // Specific storage imports

// UI Components
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

// QR Code Imports
import { QRCodeCanvas } from 'qrcode.react'; // Corrected import for display component
import QRCodeLib from 'qrcode'; // Import the underlying 'qrcode' library for programmatic generation


const NewPrescriptionForm = () => {
  const [patientName, setPatientName] = useState('');
  const [patientmail, setPatientMail] = useState('');
  const [age, setAge] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [medications, setMedications] = useState([
    { id: 1, name: '', dosage: '', frequency: '', duration: '' },
  ]);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [qrCodeDisplayValue, setQrCodeDisplayValue] = useState(''); // State to hold the actual data encoded in QR (e.g., URL)

  // Ref for the QR code container (parent div)
  const qrCodeContainerRef = useRef(null);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };
      setCurrentDateTime(now.toLocaleDateString('en-US', options));
    };

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const [patients, setPatients] = useState([]);
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('userType', '==', 'patient'));
        const querySnapshot = await getDocs(q);
        const patientsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          email: doc.data().email || '',
        }));
        setPatients(patientsList);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };
    fetchPatients();
  }, []);

  const handleAddMedicine = () => {
    setMedications([
      ...medications,
      { id: medications.length + 1, name: '', dosage: '', frequency: '', duration: '' },
    ]);
  };

  // --- Style definitions (kept as they were) ---
  const navBarStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', backgroundColor: '#d7f3d2' };
  const logoContainerStyle = { display: 'flex', alignItems: 'center' };
  const logoStyle = { height: '50px', marginRight: '10px' };
  const titleContainerStyle = { display: 'flex', flexDirection: 'column' };
  const titleStyle = { margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#333' };
  const subtitleStyle = { margin: 0, fontSize: '12px', color: '#777' };
  const contactInfoStyle = { display: 'flex', alignItems: 'center', marginRight: '20px', color: '#007bff' };
  const homeButtonDivStyle = { padding: '10px 20px', border: '1px solid #ddd', borderRadius: '20px', backgroundColor: 'lightblue', color: '#007bff', cursor: 'pointer', display: 'flex', alignItems: 'center' };
  const sidebarStyle = { width: '200px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '5px', marginRight: '20px' };
  const sidebarLinkStyle = { display: 'block', padding: '10px 0', color: '#333', textDecoration: 'none', borderBottom: '1px solid #eee' };
  const sidebarLinkActiveStyle = { color: '#007bff', fontWeight: 'bold' };
  const dashboardContainerStyle = { display: 'flex', padding: '20px', fontFamily: 'sans-serif' };
  const doctorAvatarStyle = { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#00cba9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5em', fontWeight: 'bold', marginBottom: '5px' };
  const doctorNameStyle = { fontSize: '1em', color: '#555', margin: 0 };
  const doctorInfoStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px 0', borderTop: '1px solid #eee', backgroundColor: '#d7f3d2', padding: '10px', borderRadius: '5px', margin: '10px 0' };
  const footerStyle = { backgroundColor: '#d7f3d2', padding: '20px', marginTop: '20px' };
  const containerStyle = { display: 'flex', justifyContent: 'space-around', paddingBottom: '20px' };
  const sectionStyle = { display: 'flex', flexDirection: 'column' };
  const headingStyle = { fontSize: '1.2em', marginBottom: '10px', color: '#333' };
  const listStyle = { listStyle: 'none', padding: 0, margin: 0 };
  const listItemStyle = { marginBottom: '10px', color: '#555' };
  const followUsStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
  const socialIconStyle = { display: 'flex' };
  const iconLinkStyle = { marginRight: '10px', textDecoration: 'none', color: '#333' };
  const bottomBarStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #ccc' };
  const copyrightStyle = { fontSize: '0.8em', color: '#777' };
  const linksStyle = { display: 'flex' };
  const bottomLinkStyle = { color: '#555', textDecoration: 'none', fontSize: '0.8em', marginRight: '10px' };
  const separatorStyle = { color: '#ccc', marginRight: '10px' };
  const formContainerStyle = { fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '40px auto', padding: '30px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', backgroundColor: '#fff', flexGrow: 1 };
  const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: '1px solid #eee' };
  const h2Style = { margin: '0', color: '#333', fontSize: '24px' };
  const dateTimeStyle = { color: '#777', fontSize: '14px', textAlign: 'left' };
  const sectionGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 30px', marginBottom: '30px' };
  const inputGroupStyle = { display: 'flex', flexDirection: 'column' };
  const labelStyle = { fontSize: '14px', color: '#555', marginBottom: '8px', fontWeight: '500' };
  const inputFieldStyle = { padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '15px', color: '#333', width: '100%', boxSizing: 'border-box' };
  const selectFieldStyle = { ...inputFieldStyle, appearance: 'none' };
  const borderedSectionStyle = { padding: '20px', marginBottom: '30px', borderRadius: '8px', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)' };
  const medicationsSectionColoredStyle = { ...borderedSectionStyle, backgroundColor: '#f6f9fc' };
  const additionalNotesSectionColoredStyle = { ...borderedSectionStyle, backgroundColor: '#f0fff0' };
  const textareaStyle = { ...inputFieldStyle, resize: 'vertical', minHeight: '80px' };
  const h3Style = { marginTop: '0', marginBottom: '15px', color: '#333', fontSize: '18px' };
  const addMedicineBtnStyle = { backgroundColor: '#007bff', color: 'white', padding: '10px 18px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', marginBottom: '20px', transition: 'background-color 0.2s ease-in-out' };
  const medicationListStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
  const medicationRowStyle = { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '15px', alignItems: 'center', padding: '10px', border: '1px solid #f0f0f0', borderRadius: '6px', backgroundColor: '#fcfcfc' };
  const medicationInputStyle = { padding: '10px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px', color: '#333' };
  const deleteMedicineBtnStyle = { background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '18px', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s ease-in-out' };
  const formActionsStyle = { display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px' };
  const buttonBaseStyle = { padding: '12px 25px', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s ease-in-out' };

  const [addBtnHover, setAddBtnHover] = useState(false);
  const [cancelBtnHover, setCancelBtnHover] = useState(false);
  const [saveBtnHover, setSaveBtnHover] = useState(false);
  const [printBtnHover, setPrintBtnHover] = useState(false);
  const [deleteBtnHovers, setDeleteBtnHovers] = useState({});

  const getCancelBtnStyle = () => ({ ...buttonBaseStyle, backgroundColor: cancelBtnHover ? '#e0e0e0' : '#f0f0f0', color: '#555' });
  const getSaveBtnStyle = () => ({ ...buttonBaseStyle, backgroundColor: saveBtnHover ? '#218838' : '#28a745', color: 'white' });
  const getPrintBtnStyle = () => ({ ...buttonBaseStyle, backgroundColor: printBtnHover ? '#0056b3' : '#007bff', color: 'white' });
  const getAddBtnStyle = () => ({ ...addMedicineBtnStyle, backgroundColor: addBtnHover ? '#0056b3' : '#007bff' });
  const getDeleteBtnStyle = (id) => ({
    ...deleteMedicineBtnStyle,
    color: deleteBtnHovers[id] ? '#c82333' : '#dc3545'
  });

  const handleRemoveMedicine = (id) => {
    setMedications(medications.filter((med) => med.id !== id));
  };

  const handleMedicineChange = (id, field, value) => {
    setMedications(
      medications.map((med) => (med.id === id ? { ...med, [field]: value } : med))
    );
  };

  // Function to upload QR code to Firebase Storage
  const uploadQRCodeToStorage = async (dataUrl, prescriptionId) => {
    try {
      const storageRef = ref(storage, `qrcodes/${prescriptionId}.png`);
      await uploadString(storageRef, dataUrl, 'data_url');
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading QR code to Firebase Storage:", error);
      return null;
    }
  };

  // Placeholder for sending email (requires backend)
  const sendQRCodeEmail = async (patientEmail, qrCodeImageUrl) => {
    console.log(`Attempting to send QR code to ${patientEmail} with image URL: ${qrCodeImageUrl}`);
    try {
      console.log("Email sending request sent to backend (simulated).");
      alert("QR Code email initiated for sending. Check patient's email.");
    } catch (error) {
      console.error("Error sending QR code email:", error);
      alert("Failed to send QR Code email.");
    }
  };

  const handlePrint = () => {
    if (qrCodeContainerRef.current) {
      // Find the canvas element within the QR code container
      const canvasElement = qrCodeContainerRef.current.querySelector('canvas');

      if (!canvasElement) {
        alert("QR Code canvas element not found within the print section.");
        return;
      }

      // Get the data URL of the canvas content (the QR code image)
      const qrCodeDataUrl = canvasElement.toDataURL('image/png');

      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'height=600,width=800');
      printWindow.document.write('<html><head><title>Print QR Code</title>');
      // Optionally include some minimal styling for the printout
      printWindow.document.write('<style>');
      printWindow.document.write(`
        body { font-family: Arial, sans-serif; text-align: center; margin: 20px; }
        h3 { color: #333; margin-bottom: 20px; }
        p { font-size: 14px; color: #555; }
        .qr-code-container {
          display: inline-block;
          padding: 15px;
          border: 1px solid #ddd;
          background-color: #fff;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        img.qr-code-image {
          display: block; /* Ensures it behaves like a block element */
          margin: 0 auto; /* Centers the image */
          max-width: 100%; /* Ensures it fits within its container */
          height: auto;
          image-rendering: pixelated; /* Helps keep QR code sharp on zoom/print */
        }
        @media print {
          body { -webkit-print-color-adjust: exact; }
          .qr-code-container { border: 1px solid #ddd; }
        }
      `);
      printWindow.document.write('</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write('<div class="qr-code-container">'); // Wrap content for better printing style

      // Include the descriptive text and the generated QR code image
      printWindow.document.write(`
        <h3>Prescription QR Code Generated!</h3>
        <p style="font-size: 16px; color: #333; margin-bottom: 15px;">
          Please print this QR code. If applicable, it has been sent to the patient's email address you provided: <strong>${patientmail || 'N/A'}</strong>.
        </p>
        <img src="${qrCodeDataUrl}" class="qr-code-image" alt="QR Code for Prescription" />
        <p style="font-size: 14px; color: #555; margin-top: 15px;">
          Scanning this QR code will allow quick access to the prescription details.
        </p>
      `);

      printWindow.document.write('</div>');
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus(); // Focus on the new window
      printWindow.print(); // Open print dialog
    } else {
      alert("QR Code section not found for printing.");
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert("You must be logged in to add a prescription.");
        return;
      }

      // Add the prescription data to Firestore
      // It will automatically be saved with 'active' status
      const docRef = await addDoc(collection(db, 'prescriptions'), {
        doctorId: user.uid,
        patientName,
        patientmail,
        age,
        contactNumber,
        gender,
        bloodGroup,
        diagnosis,
        additionalNotes,
        medications,
        createdAt: Timestamp.now(),
        // All new prescriptions are saved as 'active' by default
        status: 'active',
        qrCodeUrl: '', // Placeholder for QR code URL
      });

      // Construct the data to encode in the QR code (e.g., URL to view prescription)
      const prescriptionViewUrl = `${window.location.origin}/view-prescription/${docRef.id}`;
      setQrCodeDisplayValue(prescriptionViewUrl); // Set for immediate display in the UI

      // Create a temporary off-screen canvas to draw the QR code for capture
      const tempCanvas = document.createElement('canvas');

      // Use QRCodeLib.toCanvas from the 'qrcode' library to draw the QR code
      QRCodeLib.toCanvas(tempCanvas, prescriptionViewUrl, { width: 300, margin: 1 }, async (error) => {
        if (error) {
          console.error("Error drawing QR code to canvas:", error);
          alert("Failed to generate QR code image.");
          return;
        }

        const qrCodeDataUrl = tempCanvas.toDataURL('image/png');

        // Upload the QR code image to Firebase Storage
        const qrCodeDownloadURL = await uploadQRCodeToStorage(qrCodeDataUrl, docRef.id);

        if (qrCodeDownloadURL) {
          // Update the prescription document with the QR code download URL
          const prescriptionRef = doc(db, 'prescriptions', docRef.id);
          await updateDoc(prescriptionRef, { qrCodeUrl: qrCodeDownloadURL });

          // Send the QR code to the patient's email if patientmail is provided
          if (patientmail) {
            await sendQRCodeEmail(patientmail, qrCodeDownloadURL);
          }
        }
      });

      alert("Prescription saved successfully with 'active' status! QR Code generated and email process initiated. You can now print the QR code.");
    } catch (error) {
      console.error("Error saving prescription:", error);
      alert("Failed to save prescription. Please check console for details and ensure your Firebase Security Rules are correctly configured for both Firestore and Storage.");
    }
  };


  const handleCancel = () => {
    console.log('Form cancelled');
    setPatientName('');
    setPatientMail('');
    setAge('');
    setContactNumber('');
    setGender('');
    setBloodGroup('');
    setDiagnosis('');
    setMedications([{ id: 1, name: '', dosage: '', frequency: '', duration: '' }]);
    setAdditionalNotes('');
    setQrCodeDisplayValue('');
  };


  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {/* Navigation Bar */}
      <header style={navBarStyle}>
        <div style={logoContainerStyle}>
          <img src={logo} alt="E-Prescribe Logo" style={logoStyle} />
          <div style={titleContainerStyle}>
            <h1 style={titleStyle}>MediPrescribe</h1>
            <p style={subtitleStyle}>Your Digital Healthcare Solution</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={contactInfoStyle}>
            <FaPhoneAlt style={{ marginRight: '5px' }} />
            <span>+94 (011) 519-51919</span>
          </div>
          <Link to="/signin" style={{ textDecoration: 'none' }}>
            <div style={homeButtonDivStyle}>
              <span>Logout</span>
              <IoIosArrowForward style={{ marginLeft: '5px' }} />
            </div>
          </Link>
        </div>
      </header>

      {/* Dashboard Content */}
      <div style={dashboardContainerStyle}>
        {/* Sidebar */}
        <aside style={sidebarStyle}>
          <Link to="/doctor/dashboard" style={{ ...sidebarLinkStyle, ...sidebarLinkActiveStyle }}>Dashboard</Link>
          <Link to="/newprescription" style={sidebarLinkStyle}>Patients</Link>
          <Link to="/prescriptionhistory" style={sidebarLinkStyle}>Prescriptions</Link>
          <Link to="/appointments" style={sidebarLinkStyle}>Appointments</Link>
          <Link to="/settings" style={sidebarLinkStyle}>Settings</Link>

          <div style={doctorInfoStyle}>
            <div style={doctorAvatarStyle}>
              <img src={pic} alt="Doctor Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
            <p style={doctorNameStyle}>Dr. John Smith</p>
          </div>
        </aside>

        {/* New prescription form container */}
        <div style={formContainerStyle}>
          <div style={headerStyle}>
            <h2 style={h2Style}>Create New Prescription</h2>
            <p style={dateTimeStyle}>{currentDateTime}</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={sectionGridStyle}>
              <div style={inputGroupStyle}>
                <label htmlFor="patientName" style={labelStyle}>Patient Name</label>
                <input
                  type="text"
                  id="patientName"
                  placeholder="Enter patient name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  style={inputFieldStyle}
                />
              </div>
              <div style={inputGroupStyle}>
              <label htmlFor="patientID" style={labelStyle}>Select Patient Email</label>
              <Autocomplete
                options={patients}
                getOptionLabel={(option) => option.email}
                renderInput={(params) => (
                  <TextField {...params} label="Patient Email" variant="outlined" />
                )}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setPatientMail(newValue.email);
                  } else {
                    setPatientMail('');
                  }
                }}
                fullWidth
              />
            </div>

              <div style={inputGroupStyle}>
                <label htmlFor="age" style={labelStyle}>Age</label>
                <input
                  type="number"
                  id="age"
                  placeholder="Enter age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  style={inputFieldStyle}
                />
              </div>
              <div style={inputGroupStyle}>
                <label htmlFor="contactNumber" style={labelStyle}>Contact Number</label>
                <input
                  type="text"
                  id="contactNumber"
                  placeholder="Enter contact number"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  style={inputFieldStyle}
                />
              </div>
              <div style={inputGroupStyle}>
                <label htmlFor="gender" style={labelStyle}>Gender</label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={selectFieldStyle}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div style={inputGroupStyle}>
                <label htmlFor="bloodGroup" style={labelStyle}>Blood Group</label>
                <select
                  id="bloodGroup"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  style={selectFieldStyle}
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label htmlFor="diagnosis" style={labelStyle}>Diagnosis</label>
              <textarea
                id="diagnosis"
                placeholder="Enter diagnosis details"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                rows="4"
                style={textareaStyle}
              ></textarea>
            </div>

            <div style={medicationsSectionColoredStyle}>
              <h3 style={h3Style}>Medications</h3>
              <button
                type="button"
                style={getAddBtnStyle()}
                onClick={handleAddMedicine}
                onMouseEnter={() => setAddBtnHover(true)}
                onMouseLeave={() => setAddBtnHover(false)}
              >
                + Add Medicine
              </button>
              <div style={medicationListStyle}>
                {medications.map((med) => (
                  <div key={med.id} style={medicationRowStyle}>
                    <input
                      type="text"
                      placeholder="Medicine name"
                      value={med.name}
                      onChange={(e) => handleMedicineChange(med.id, 'name', e.target.value)}
                      style={medicationInputStyle}
                    />
                    <input
                      type="text"
                      placeholder="Dosage"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(med.id, 'dosage', e.target.value)}
                      style={medicationInputStyle}
                    />
                    <select
                      value={med.frequency}
                      onChange={(e) => handleMedicineChange(med.id, 'frequency', e.target.value)}
                      style={medicationInputStyle}
                    >
                      <option value="">Frequency</option>
                      <option value="Once Daily">Once Daily</option>
                      <option value="Twice Daily">Twice Daily</option>
                      <option value="Thrice Daily">Thrice Daily</option>
                      <option value="As Needed">As Needed</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Duration"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(med.id, 'duration', e.target.value)}
                      style={medicationInputStyle}
                    />
                    <button
                      type="button"
                      style={getDeleteBtnStyle(med.id)}
                      onClick={() => handleRemoveMedicine(med.id)}
                      onMouseEnter={() => setDeleteBtnHovers(prev => ({ ...prev, [med.id]: true }))}
                      onMouseLeave={() => setDeleteBtnHovers(prev => ({ ...prev, [med.id]: false }))}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={additionalNotesSectionColoredStyle}>
              <label htmlFor="additionalNotes" style={labelStyle}>Additional Notes</label>
              <textarea
                id="additionalNotes"
                placeholder="Enter additional notes or instructions"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows="4"
                style={textareaStyle}
              ></textarea>
            </div>

            <div style={formActionsStyle}>
              <button
                type="button"
                style={getCancelBtnStyle()}
                onClick={handleCancel}
                onMouseEnter={() => setCancelBtnHover(true)}
                onMouseLeave={() => setCancelBtnHover(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={getSaveBtnStyle()}
                onMouseEnter={() => setSaveBtnHover(true)}
                onMouseLeave={() => setSaveBtnHover(false)}
              >
                Save Prescription
              </button>
            </div>
          </form>

          {/* Display QR Code and instructions */}
          {qrCodeDisplayValue && (
            <div style={{ marginTop: '30px', textAlign: 'center', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#e6ffe6' }}>
              <h3>Prescription QR Code Generated!</h3>
              <p style={{ fontSize: '16px', color: '#333', marginBottom: '15px' }}>
                Please **print** this QR code and, if applicable, it has been **sent to the patient's email address** you provided: **{patientmail}**.
              </p>
              {/* Added ref to this div for printing */}
              <div id="qrCodePrintSection" ref={qrCodeContainerRef} style={{ display: 'inline-block', padding: '10px', border: '1px solid #ddd', backgroundColor: '#fff', borderRadius: '5px' }}>
                <QRCodeCanvas value={qrCodeDisplayValue} size={160} level="H" />
              </div>
              <p style={{ fontSize: '14px', color: '#555', marginTop: '15px' }}>
                Scanning this QR code will allow quick access to the prescription details.
              </p>
              {/* Print Button */}
              <button
                type="button"
                style={{...getPrintBtnStyle(), marginTop: '20px'}} // Adjusted margin for spacing
                onClick={handlePrint}
                onMouseEnter={() => setPrintBtnHover(true)}
                onMouseLeave={() => setPrintBtnHover(false)}
              >
                Print QR Code
              </button>
            </div>
          )}
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
              <a href="#" style={iconLinkStyle}><FaPinterest style={{ fontSize: '1.5em' }} /></a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><FaFacebookF style={{ fontSize: '1.5em' }} /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><FaInstagram style={{ fontSize: '1.5em' }} /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><FaTwitter style={{ fontSize: '1.5em' }} /></a>
              <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><FaWhatsapp style={{ fontSize: '1.5em' }} /></a>
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
        <p>© 2025 MediPrescribe. All rights reserved.</p>
      </div>
    </div>
  );
};

export default NewPrescriptionForm;