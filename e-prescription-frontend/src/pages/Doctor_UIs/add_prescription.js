import React, { useState, useEffect, useRef } from 'react';
import logo from '../Main_Interface_UI/images/Logo01.png';
import pic from '../Main_Interface_UI/images/Doctor.png';
import { FaPhoneAlt } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterest, FaWhatsapp } from 'react-icons/fa';

// Encryption Library
import CryptoJS from 'crypto-js';

// Firebase Imports
import { db, storage } from '../firebase';
import { collection, addDoc, Timestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

// UI Components
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

// QR Code Imports
import QRCodeLib from 'qrcode';
import { QRCodeCanvas } from 'qrcode.react';

// **SECURITY WARNING**: This is for demonstration.
// The key must be securely managed in a real application.
const SECRET_KEY = "your-super-secret-key-that-should-be-in-a-secure-place";

const encryptData = (data) => {
    if (!data) return null;
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
    return encrypted;
};

const NewPrescriptionForm = () => {
    // State variables for form fields
    const [patientName, setPatientName] = useState('');
    const [patientmail, setPatientMail] = useState('');
    const [age, setAge] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [gender, setGender] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [nationalId, setNationalId] = useState('');
    const [patientRelationship, setPatientRelationship] = useState('');

    // State for dynamic medication fields
    const [medications, setMedications] = useState([
        { id: 1, name: '', dosage: '', frequency: '', duration: '' },
    ]);

    // State for date, time, and QR code
    const [prescriptionDate, setPrescriptionDate] = useState(new Date());
    const [prescriptionTime, setPrescriptionTime] = useState(new Date());
    const [qrCodeDisplayValue, setQrCodeDisplayValue] = useState('');
    const qrCodeContainerRef = useRef(null);

    // State for patient data fetched from Firestore for Autocomplete
    const [patients, setPatients] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState('');

    // State for button hover effects
    const [addBtnHover, setAddBtnHover] = useState(false);
    const [cancelBtnHover, setCancelBtnHover] = useState(false);
    const [saveBtnHover, setSaveBtnHover] = useState(false);
    const [printBtnHover, setPrintBtnHover] = useState(false);
    const [deleteBtnHovers, setDeleteBtnHovers] = useState({});

    // Fetch patients from Firestore on component mount
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('userType', '==', 'patient'));
                const querySnapshot = await getDocs(q);
                const patientsList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    email: doc.data().email || '',
                    name: doc.data().name || '',
                    age: doc.data().age || '',
                    contactNumber: doc.data().contactNumber || '',
                    gender: doc.data().gender || '',
                    bloodGroup: doc.data().bloodGroup || '',
                    nationalId: doc.data().nationalId || '',
                }));
                setPatients(patientsList);
            } catch (error) {
                console.error('Error fetching patients:', error);
            }
        };
        fetchPatients();
    }, []);

    // Update patient details when a patient email is selected from the dropdown
    useEffect(() => {
        const fetchPatientDetails = async () => {
            if (selectedPatientId) {
                try {
                    const patientRef = doc(db, 'users', selectedPatientId);
                    const docSnap = await getDoc(patientRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setPatientName(data.name || '');
                        setAge(data.age || '');
                        setContactNumber(data.contactNumber || '');
                        setGender(data.gender || '');
                        setBloodGroup(data.bloodGroup || '');
                        setNationalId(data.nationalId || '');
                    } else {
                        console.log("No such patient document!");
                    }
                } catch (error) {
                    console.error("Error fetching patient details:", error);
                }
            } else {
                setPatientName('');
                setAge('');
                setContactNumber('');
                setGender('');
                setBloodGroup('');
                setNationalId('');
            }
        };
        fetchPatientDetails();
    }, [selectedPatientId]);


    // Set and update current date and time
    useEffect(() => {
        const now = new Date();
        setPrescriptionDate(now);
        setPrescriptionTime(now);

        const intervalId = setInterval(() => {
            setPrescriptionTime(new Date());
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const handleAddMedicine = () => {
        setMedications([
            ...medications,
            { id: medications.length + 1, name: '', dosage: '', frequency: '', duration: '' },
        ]);
    };

    const handleRemoveMedicine = (id) => {
        setMedications(medications.filter((med) => med.id !== id));
    };

    const handleMedicineChange = (id, field, value) => {
        setMedications(
            medications.map((med) => (med.id === id ? { ...med, [field]: value } : med))
        );
    };

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

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                alert("You must be logged in to add a prescription.");
                return;
            }

            // Encrypt sensitive data
            const encryptedDiagnosis = encryptData(diagnosis);
            const encryptedMedications = encryptData(medications);
            const encryptedAdditionalNotes = encryptData(additionalNotes);

            // Add the prescription data to Firestore
            const docRef = await addDoc(collection(db, 'prescriptions'), {
                doctorId: user.uid,
                patientName,
                patientmail,
                age,
                contactNumber,
                gender,
                bloodGroup,
                nationalId,
                // Save encrypted data
                diagnosis: encryptedDiagnosis,
                medications: encryptedMedications,
                additionalNotes: encryptedAdditionalNotes,
                patientRelationship,
                prescriptionDate: Timestamp.fromDate(new Date(prescriptionDate.getFullYear(), prescriptionDate.getMonth(), prescriptionDate.getDate())),
                prescriptionTime: prescriptionTime.toLocaleTimeString('en-US'),
                status: 'active',
                qrCodeUrl: '',
            });

            // Construct the data to encode in the QR code
            const qrCodeData = JSON.stringify({
                prescriptionId: docRef.id,
                nationalId: nationalId
            });
            setQrCodeDisplayValue(qrCodeData);

            const tempCanvas = document.createElement('canvas');

            QRCodeLib.toCanvas(tempCanvas, qrCodeData, { width: 300, margin: 1 }, async (error) => {
                if (error) {
                    console.error("Error drawing QR code to canvas:", error);
                    alert("Failed to generate QR code image.");
                    return;
                }

                const qrCodeDataUrl = tempCanvas.toDataURL('image/png');
                const qrCodeDownloadURL = await uploadQRCodeToStorage(qrCodeDataUrl, docRef.id);

                if (qrCodeDownloadURL) {
                    const prescriptionRef = doc(db, 'prescriptions', docRef.id);
                    await updateDoc(prescriptionRef, { qrCodeUrl: qrCodeDownloadURL });

                    if (patientmail) {
                        await sendQRCodeEmail(patientmail, qrCodeDownloadURL);
                    }
                }
            });

            alert("Prescription saved successfully! QR Code generated. You can now print it.");
        } catch (error) {
            console.error("Error saving prescription:", error);
            alert("Failed to save prescription. Please check the console for more details.");
        }
    };

    // Handle form reset
    const handleCancel = () => {
        console.log('Form cancelled');
        setPatientName('');
        setPatientMail('');
        setAge('');
        setContactNumber('');
        setGender('');
        setBloodGroup('');
        setNationalId('');
        setDiagnosis('');
        setMedications([{ id: 1, name: '', dosage: '', frequency: '', duration: '' }]);
        setAdditionalNotes('');
        setQrCodeDisplayValue('');
        setPrescriptionDate(new Date());
        setPrescriptionTime(new Date());
        setPatientRelationship('');
    };

    // Handle printing the QR code section
    const handlePrint = () => {
        if (qrCodeContainerRef.current) {
            const canvasElement = qrCodeContainerRef.current.querySelector('canvas');
            if (!canvasElement) {
                alert("QR Code canvas element not found within the print section.");
                return;
            }

            const qrCodeDataUrl = canvasElement.toDataURL('image/png');
            const printWindow = window.open('', '_blank', 'height=600,width=800');
            printWindow.document.write('<html><head><title>Print QR Code</title>');
            printWindow.document.write('<style>');
            printWindow.document.write(`
                body { font-family: Arial, sans-serif; text-align: center; margin: 20px; }
                h3 { color: #333; margin-bottom: 20px; }
                p { font-size: 14px; color: #555; }
                .qr-code-container { display: inline-block; padding: 15px; border: 1px solid #ddd; background-color: #fff; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
                img.qr-code-image { display: block; margin: 0 auto; max-width: 100%; height: auto; image-rendering: pixelated; }
                @media print { body { -webkit-print-color-adjust: exact; } .qr-code-container { border: 1px solid #ddd; } }
            `);
            printWindow.document.write('</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write('<div class="qr-code-container">');
            printWindow.document.write(`
                <h3>Prescription QR Code</h3>
                <p>National ID: <strong>${nationalId}</strong></p>
                <p style="font-size: 16px; color: #333; margin-bottom: 15px;">
                    This QR code provides quick access to the prescription details.
                </p>
                <img src="${qrCodeDataUrl}" class="qr-code-image" alt="QR Code for Prescription" />
            `);
            printWindow.document.write('</div>');
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        } else {
            alert("QR Code section not found for printing.");
        }
    };

    // Refactored Styles (this part is unchanged from the last fix)
    const styles = {
        navBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', backgroundColor: '#d7f3d2' },
        logoContainer: { display: 'flex', alignItems: 'center' },
        logo: { height: '50px', marginRight: '10px' },
        titleContainer: { display: 'flex', flexDirection: 'column' },
        title: { margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#333' },
        subtitle: { margin: 0, fontSize: '12px', color: '#777' },
        contactInfo: { display: 'flex', alignItems: 'center', marginRight: '20px', color: '#007bff' },
        homeButtonDiv: { padding: '10px 20px', border: '1px solid #ddd', borderRadius: '20px', backgroundColor: 'lightblue', color: '#007bff', cursor: 'pointer', display: 'flex', alignItems: 'center' },
        sidebar: { width: '200px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '5px', marginRight: '20px' },
        sidebarLink: { display: 'block', padding: '10px 0', color: '#333', textDecoration: 'none', borderBottom: '1px solid #eee' },
        sidebarLinkActive: { color: '#007bff', fontWeight: 'bold' },
        dashboardContainer: { display: 'flex', padding: '20px', fontFamily: 'sans-serif' },
        doctorAvatar: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#00cba9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5em', fontWeight: 'bold', marginBottom: '5px' },
        doctorName: { fontSize: '1em', color: '#555', margin: 0 },
        doctorInfo: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px 0', borderTop: '1px solid #eee', backgroundColor: '#d7f3d2', padding: '10px', borderRadius: '5px', margin: '10px 0' },
        footer: { backgroundColor: '#d7f3d2', padding: '20px', marginTop: '20px' },
        container: { display: 'flex', justifyContent: 'space-around', paddingBottom: '20px' },
        section: { display: 'flex', flexDirection: 'column' },
        heading: { fontSize: '1.2em', marginBottom: '10px', color: '#333' },
        list: { listStyle: 'none', padding: 0, margin: 0 },
        listItem: { marginBottom: '10px', color: '#555' },
        followUs: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
        socialIcon: { display: 'flex' },
        iconLink: { marginRight: '10px', textDecoration: 'none', color: '#333' },
        bottomBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #ccc' },
        copyright: { fontSize: '0.8em', color: '#777' },
        links: { display: 'flex' },
        bottomLink: { color: '#555', textDecoration: 'none', fontSize: '0.8em', marginRight: '10px' },
        separator: { color: '#ccc', marginRight: '10px' },
        formContainer: { fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '40px auto', padding: '30px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', backgroundColor: '#fff', flexGrow: 1 },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: '1px solid #eee' },
        h2: { margin: '0', color: '#333', fontSize: '24px' },
        dateTime: { color: '#777', fontSize: '14px', textAlign: 'left' },
        sectionGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 30px', marginBottom: '30px' },
        inputGroup: { display: 'flex', flexDirection: 'column' },
        label: { fontSize: '14px', color: '#555', marginBottom: '8px', fontWeight: '500' },
        inputField: { padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '15px', color: '#333', width: '100%', boxSizing: 'border-box' },
        selectField: { padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '15px', color: '#333', width: '100%', boxSizing: 'border-box', appearance: 'none' },
        borderedSection: { padding: '20px', marginBottom: '30px', borderRadius: '8px', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)' },
        medicationsSectionColored: { backgroundColor: '#f6f9fc' },
        additionalNotesSectionColored: { backgroundColor: '#f0fff0' },
        textarea: { resize: 'vertical', minHeight: '80px' },
        h3: { marginTop: '0', marginBottom: '15px', color: '#333', fontSize: '18px' },
        addMedicineBtn: { backgroundColor: '#007bff', color: 'white', padding: '10px 18px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', marginBottom: '20px', transition: 'background-color 0.2s ease-in-out' },
        medicationList: { display: 'flex', flexDirection: 'column', gap: '15px' },
        medicationRow: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '15px', alignItems: 'center', padding: '10px', border: '1px solid #f0f0f0', borderRadius: '6px', backgroundColor: '#fcfcfc' },
        medicationInput: { padding: '10px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px', color: '#333' },
        deleteMedicineBtn: { background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '18px', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s ease-in-out' },
        formActions: { display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px' },
        buttonBase: { padding: '12px 25px', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s ease-in-out' },
        qrCodeContainer: { marginTop: '30px', textAlign: 'center', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#e6ffe6' },
    };

    // Helper functions for button styles based on hover state
    const getCancelBtnStyle = () => ({ ...styles.buttonBase, backgroundColor: cancelBtnHover ? '#e0e0e0' : '#f0f0f0', color: '#555' });
    const getSaveBtnStyle = () => ({ ...styles.buttonBase, backgroundColor: saveBtnHover ? '#218838' : '#28a745', color: 'white' });
    const getPrintBtnStyle = () => ({ ...styles.buttonBase, backgroundColor: printBtnHover ? '#0056b3' : '#007bff', color: 'white' });
    const getAddBtnStyle = () => ({ ...styles.addMedicineBtn, backgroundColor: addBtnHover ? '#0056b3' : '#007bff' });
    const getDeleteBtnStyle = (id) => ({
        ...styles.deleteMedicineBtn,
        color: deleteBtnHovers[id] ? '#c82333' : '#dc3545'
    });

    return (
        <div style={{ fontFamily: 'sans-serif' }}>
            {/* Navigation Bar */}
            <header style={styles.navBar}>
                <div style={styles.logoContainer}>
                    <img src={logo} alt="E-Prescribe Logo" style={styles.logo} />
                    <div style={styles.titleContainer}>
                        <h1 style={styles.title}>MediPrescribe</h1>
                        <p style={styles.subtitle}>Your Digital Healthcare Solution</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={styles.contactInfo}>
                        <FaPhoneAlt style={{ marginRight: '5px' }} />
                        <span>+94 (011) 519-51919</span>
                    </div>
                    <Link to="/signin" style={{ textDecoration: 'none' }}>
                        <div style={styles.homeButtonDiv}>
                            <span>Logout</span>
                            <IoIosArrowForward style={{ marginLeft: '5px' }} />
                        </div>
                    </Link>
                </div>
            </header>

            {/* Dashboard Content */}
            <div style={styles.dashboardContainer}>
                {/* Sidebar */}
                <aside style={styles.sidebar}>
                    <Link to="/doctor/dashboard" style={{ ...styles.sidebarLink, ...styles.sidebarLinkActive }}>Dashboard</Link>
                    <Link to="/newprescription" style={styles.sidebarLink}>Patients</Link>
                    <Link to="/prescriptionhistory" style={styles.sidebarLink}>Prescriptions</Link>
                    <Link to="/appointments" style={styles.sidebarLink}>Appointments</Link>
                    <Link to="/settings" style={styles.sidebarLink}>Settings</Link>

                    <div style={styles.doctorInfo}>
                        <div style={styles.doctorAvatar}>
                            <img src={pic} alt="Doctor Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        </div>
                        <p style={styles.doctorName}>Dr. John Smith</p>
                    </div>
                </aside>

                {/* New prescription form container */}
                <div style={styles.formContainer}>
                    <div style={styles.header}>
                        <h2 style={styles.h2}>Create New Prescription</h2>
                        <p style={styles.dateTime}>
                            {`${prescriptionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} ${prescriptionTime.toLocaleTimeString('en-US')}`}
                        </p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div style={styles.sectionGrid}>
                            <div style={styles.inputGroup}>
                                <label htmlFor="patientmail" style={styles.label}>Select Patient Email</label>
                                <Autocomplete
                                    options={patients}
                                    getOptionLabel={(option) => option.email}
                                    onChange={(event, newValue) => {
                                        if (newValue) {
                                            setPatientMail(newValue.email);
                                            setSelectedPatientId(newValue.id);
                                        } else {
                                            setPatientMail('');
                                            setSelectedPatientId('');
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Patient Email" variant="outlined" />
                                    )}
                                    fullWidth
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label htmlFor="patientRelationship" style={styles.label}>Relationship to Patient</label>
                                <select
                                    id="patientRelationship"
                                    value={patientRelationship}
                                    onChange={(e) => setPatientRelationship(e.target.value)}
                                    style={styles.selectField}
                                >
                                    <option value="">Select relationship</option>
                                    <option value="patient">Patient</option>
                                    <option value="guardian">Guardian</option>
                                </select>
                            </div>
                            <div style={styles.inputGroup}>
                                <label htmlFor="patientName" style={styles.label}>Patient Name</label>
                                <input
                                    type="text"
                                    id="patientName"
                                    placeholder="Enter patient name"
                                    value={patientName}
                                    onChange={(e) => setPatientName(e.target.value)}
                                    style={styles.inputField}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label htmlFor="nationalId" style={styles.label}>National ID</label>
                                <input
                                    type="text"
                                    id="nationalId"
                                    placeholder="Enter National ID"
                                    value={nationalId}
                                    onChange={(e) => setNationalId(e.target.value)}
                                    style={styles.inputField}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label htmlFor="age" style={styles.label}>Age</label>
                                <input
                                    type="number"
                                    id="age"
                                    placeholder="Enter age"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    style={styles.inputField}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label htmlFor="contactNumber" style={styles.label}>Contact Number</label>
                                <input
                                    type="text"
                                    id="contactNumber"
                                    placeholder="Enter contact number"
                                    value={contactNumber}
                                    onChange={(e) => setContactNumber(e.target.value)}
                                    style={styles.inputField}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label htmlFor="gender" style={styles.label}>Gender</label>
                                <select
                                    id="gender"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    style={styles.selectField}
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div style={styles.inputGroup}>
                                <label htmlFor="bloodGroup" style={styles.label}>Blood Group</label>
                                <select
                                    id="bloodGroup"
                                    value={bloodGroup}
                                    onChange={(e) => setBloodGroup(e.target.value)}
                                    style={styles.selectField}
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

                        <div style={{ ...styles.borderedSection, ...styles.additionalNotesSectionColored }}>
                            <label htmlFor="additionalNotes" style={styles.label}>Diagnosis</label>
                            <textarea
                                id="diagnosis"
                                placeholder="Enter diagnosis details"
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                                rows="4"
                                style={{ ...styles.inputField, ...styles.textarea }}
                            ></textarea>
                        </div>
                        
                        <div style={{ ...styles.borderedSection, ...styles.medicationsSectionColored }}>
                            <h3 style={styles.h3}>Medications</h3>
                            <button
                                type="button"
                                style={getAddBtnStyle()}
                                onClick={handleAddMedicine}
                                onMouseEnter={() => setAddBtnHover(true)}
                                onMouseLeave={() => setAddBtnHover(false)}
                            >
                                + Add Medicine
                            </button>
                            <div style={styles.medicationList}>
                                {medications.map((med) => (
                                    <div key={med.id} style={styles.medicationRow}>
                                        <input
                                            type="text"
                                            placeholder="Medicine name"
                                            value={med.name}
                                            onChange={(e) => handleMedicineChange(med.id, 'name', e.target.value)}
                                            style={styles.medicationInput}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Dosage"
                                            value={med.dosage}
                                            onChange={(e) => handleMedicineChange(med.id, 'dosage', e.target.value)}
                                            style={styles.medicationInput}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Frequency"
                                            value={med.frequency}
                                            onChange={(e) => handleMedicineChange(med.id, 'frequency', e.target.value)}
                                            style={styles.medicationInput}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Duration"
                                            value={med.duration}
                                            onChange={(e) => handleMedicineChange(med.id, 'duration', e.target.value)}
                                            style={styles.medicationInput}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveMedicine(med.id)}
                                            style={getDeleteBtnStyle(med.id)}
                                            onMouseEnter={() => setDeleteBtnHovers({ ...deleteBtnHovers, [med.id]: true })}
                                            onMouseLeave={() => setDeleteBtnHovers({ ...deleteBtnHovers, [med.id]: false })}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ ...styles.borderedSection, ...styles.additionalNotesSectionColored }}>
                            <label htmlFor="additionalNotes" style={styles.label}>Additional Notes</label>
                            <textarea
                                id="additionalNotes"
                                placeholder="Enter any additional notes"
                                value={additionalNotes}
                                onChange={(e) => setAdditionalNotes(e.target.value)}
                                rows="4"
                                style={{ ...styles.inputField, ...styles.textarea }}
                            ></textarea>
                        </div>

                        <div style={styles.formActions}>
                            <button
                                type="button"
                                onClick={handleCancel}
                                style={getCancelBtnStyle()}
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

                    {/* QR Code section */}
                    {qrCodeDisplayValue && (
                        <div style={styles.qrCodeContainer} ref={qrCodeContainerRef}>
                            <h3 style={{ color: '#007bff' }}>Generated QR Code</h3>
                            <p style={{ color: '#555', fontSize: '14px', marginBottom: '15px' }}>
                                The QR code contains an encrypted link to the prescription.
                                <br /> Scan it to view the details in a secure web page.
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                                <QRCodeCanvas value={qrCodeDisplayValue} />
                            </div>
                            <button
                                onClick={handlePrint}
                                style={getPrintBtnStyle()}
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
            <footer style={styles.footer}>
                <div style={styles.container}>
                    <div style={styles.section}>
                        <h3 style={styles.heading}>Shop Matcha</h3>
                        <ul style={styles.list}>
                            <li style={styles.listItem}>Starter Kits</li>
                            <li style={styles.listItem}>Lattes & Sweetened</li>
                            <li style={styles.listItem}>Just the Matcha</li>
                            <li style={styles.listItem}>Matchaware</li>
                            <li style={styles.listItem}>Shop All</li>
                        </ul>
                    </div>
                    <div style={styles.section}>
                        <h3 style={styles.heading}>Learn</h3>
                        <ul style={styles.list}>
                            <li style={styles.listItem}>Our Story</li>
                            <li style={styles.listItem}>Matcha Recipes</li>
                            <li style={styles.listItem}>Caffeine Content</li>
                            <li style={styles.listItem}>Health Benefits</li>
                            <li style={styles.listItem}>FAQ's</li>
                        </ul>
                    </div>
                    <div style={styles.section}>
                        <h3 style={styles.heading}>More from Tenzo</h3>
                        <ul style={styles.list}>
                            <li style={styles.listItem}>Sign In</li>
                            <li style={styles.listItem}>Wholesale Opportunities</li>
                            <li style={styles.listItem}>Affiliate</li>
                            <li style={styles.listItem}>Contact Us</li>
                        </ul>
                    </div>
                    <div style={styles.followUs}>
                        <h3 style={styles.heading}>Follow us</h3>
                        <div style={styles.socialIcon}>
                            <a href="#" style={styles.iconLink}><FaPinterest style={{ fontSize: '1.5em' }} /></a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={styles.iconLink}><FaFacebookF style={{ fontSize: '1.5em' }} /></a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={styles.iconLink}><FaInstagram style={{ fontSize: '1.5em' }} /></a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={styles.iconLink}><FaTwitter style={{ fontSize: '1.5em' }} /></a>
                            <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" style={styles.iconLink}><FaWhatsapp style={{ fontSize: '1.5em' }} /></a>
                        </div>
                    </div>
                </div>
                <div style={styles.bottomBar}>
                    <p style={styles.copyright}>© 2025 tenzotea.co</p>
                    <div style={styles.links}>
                        <a href="#" style={styles.bottomLink}>Terms of Service</a>
                        <span style={styles.separator}>|</span>
                        <a href="#" style={styles.bottomLink}>Privacy Policy</a>
                        <span style={styles.separator}>|</span>
                        <a href="#" style={styles.bottomLink}>Refund Policy</a>
                        <span style={styles.separator}>|</span>
                        <a href="#" style={styles.bottomLink}>Accessibility Policy</a>
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