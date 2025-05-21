import React, { useState } from 'react';
import logo from '../Main_Interface_UI/images/Logo01.png';// Assuming the logo path
import pic from '../Main_Interface_UI/images/Doctor.png'
import { FaPhoneAlt } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterest, FaWhatsapp} from 'react-icons/fa';

const NewPrescriptionForm = () => {
  const [patientName, setPatientName] = useState('');
  const [patientID, setPatientID] = useState('');
  const [age, setAge] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [medications, setMedications] = useState([
    { id: 1, name: '', dosage: '', frequency: '', duration: '' },
  ]);

  const handleAddMedicine = () => {
    setMedications([
      ...medications,
      { id: medications.length + 1, name: '', dosage: '', frequency: '', duration: '' },
    ]);
  };

  const navBarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 50px',
    backgroundColor: '#d7f3d2',
  };

  const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
  };

  const logoStyle = {
    height: '50px',
    marginRight: '10px',
  };

  const titleContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
  };

  const titleStyle = {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
  };

  const subtitleStyle = {
    margin: 0,
    fontSize: '12px',
    color: '#777',
  };

  const contactInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    marginRight: '20px',
    color: '#007bff',
  };

  const homeButtonStyle = {
    textDecoration: 'none',
  };

  const homeButtonDivStyle = {
    padding: '10px 20px',
    border: '1px solid #ddd',
    borderRadius: '20px',
    backgroundColor: 'lightblue',
    color: '#007bff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  };

  const handleRemoveMedicine = (id) => {
    setMedications(medications.filter((med) => med.id !== id));
  };

  const handleMedicineChange = (id, field, value) => {
    setMedications(
      medications.map((med) => (med.id === id ? { ...med, [field]: value } : med))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to an API
    console.log({
      patientName,
      patientID,
      age,
      contactNumber,
      gender,
      bloodGroup,
      diagnosis,
      medications,
      additionalNotes,
    });
    alert('Prescription saved! Check console for data.');
    // You might want to reset the form or navigate away after submission
  };

  const handleCancel = () => {
    console.log('Form cancelled');
    setPatientName('');
    setPatientID('');
    setAge('');
    setContactNumber('');
    setGender('');
    setBloodGroup('');
    setDiagnosis('');
    setMedications([{ id: 1, name: '', dosage: '', frequency: '', duration: '' }]);
    setAdditionalNotes('');
  };

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // --- Inline Styles / Style Objects ---

  const formContainerStyle = {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '900px',
    margin: '40px auto',
    padding: '30px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    backgroundColor: '#fff',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '15px',
    borderBottom: '1px solid #eee',
  };

  const h2Style = {
    margin: '0',
    color: '#333',
    fontSize: '24px',
  };

  const dateStyle = {
    color: '#777',
    fontSize: '14px',
  };

  const sectionGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px 30px',
    marginBottom: '30px',
  };

  const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
  };

  const labelStyle = {
    fontSize: '14px',
    color: '#555',
    marginBottom: '8px',
    fontWeight: '500',
  };

  const inputFieldStyle = {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '15px',
    color: '#333',
    width: '100%',
    boxSizing: 'border-box',
  };

  // For select, we can't directly add custom background image/arrow with inline styles.
  // A CSS-in-JS library would be needed for that, or a wrapper div + SVG.
  // For simplicity here, it will be a standard dropdown.
  const selectFieldStyle = {
    ...inputFieldStyle,
    // -webkit-appearance: 'none', // Cannot be directly applied as a JS style property without libraries
    // -moz-appearance: 'none',
    appearance: 'none', // This one works in JS
    // background: 'url(...) no-repeat right 12px center', // Also tricky to inline
    // backgroundSize: '12px',
  };

  const sectionFullWidthStyle = {
    marginBottom: '30px',
  };

  const textareaStyle = {
    ...inputFieldStyle,
    resize: 'vertical', // Allow vertical resize
    minHeight: '80px',
  };

  const medicationsSectionStyle = {
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #eee',
  };

  const h3Style = {
    marginTop: '0',
    marginBottom: '15px',
    color: '#333',
    fontSize: '18px',
  };

  const addMedicineBtnStyle = {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 18px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    marginBottom: '20px',
    // Hover effect needs to be handled via onMouseEnter/onMouseLeave for pure inline.
    // Or, more robustly, with a CSS-in-JS library.
    transition: 'background-color 0.2s ease-in-out',
  };

  const medicationListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  };

  const medicationRowStyle = {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
    gap: '15px',
    alignItems: 'center',
    padding: '10px',
    border: '1px solid #f0f0f0',
    borderRadius: '6px',
    backgroundColor: '#fcfcfc',
  };

  const medicationInputStyle = {
    padding: '10px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#333',
  };

  const deleteMedicineBtnStyle = {
    background: 'none',
    border: 'none',
    color: '#dc3545',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // Hover needs event handlers or CSS-in-JS
    transition: 'color 0.2s ease-in-out',
  };

  const formActionsStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    marginTop: '30px',
  };

  const buttonBaseStyle = {
    padding: '12px 25px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
  };

  // For hover effects, we'll use local state to manage hover. This is boilerplate.
  // A CSS-in-JS library handles this much more elegantly.
  const [addBtnHover, setAddBtnHover] = useState(false);
  const [cancelBtnHover, setCancelBtnHover] = useState(false);
  const [saveBtnHover, setSaveBtnHover] = useState(false);
  const [deleteBtnHovers, setDeleteBtnHovers] = useState({}); // For dynamic buttons

  const getCancelBtnStyle = () => ({
    ...buttonBaseStyle,
    backgroundColor: cancelBtnHover ? '#e0e0e0' : '#f0f0f0',
    color: '#555',
  });

  const getSaveBtnStyle = () => ({
    ...buttonBaseStyle,
    backgroundColor: saveBtnHover ? '#218838' : '#28a745',
    color: 'white',
  });

  const getAddBtnStyle = () => ({
    ...addMedicineBtnStyle,
    backgroundColor: addBtnHover ? '#0056b3' : '#007bff',
  });

  const getDeleteBtnStyle = (id) => ({
    ...deleteMedicineBtnStyle,
    color: deleteBtnHovers[id] ? '#c82333' : '#dc3545',
  });


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
                  <Link to="/signin" style={{ textDecoration: 'none' }}> {/* Use Link */}
                    <div style={homeButtonDivStyle}>
                      <span>Logout</span>
                      <IoIosArrowForward style={{ marginLeft: '5px' }} />
                    </div>
                  </Link>
                </div>
              </header>
      <div style={headerStyle}>
        <h2 style={h2Style}>Create New Prescription</h2>
        <span style={dateStyle}>Date: {today}</span>
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
            <label htmlFor="patientID" style={labelStyle}>Patient ID</label>
            <input
              type="text"
              id="patientID"
              placeholder="Enter Patient ID"
              value={patientID}
              onChange={(e) => setPatientID(e.target.value)}
              style={inputFieldStyle}
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

        <div style={sectionFullWidthStyle}>
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

        <div style={medicationsSectionStyle}>
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
                  style={medicationInputStyle} // Reusing basic input style for simplicity
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

        <div style={sectionFullWidthStyle}>
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
    </div>
  );
};

export default NewPrescriptionForm;