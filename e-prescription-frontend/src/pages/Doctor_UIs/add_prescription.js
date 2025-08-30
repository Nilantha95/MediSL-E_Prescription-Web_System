// used chatgpt and gemini ai for code enhancement

import React, { useState, useEffect, useRef } from 'react';
import logo from '../Main_Interface_UI/images/Logo01.png';
import pic from '../Main_Interface_UI/images/Doctor.png';
import { FaPhoneAlt } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import { Link } from 'react-router-dom';
import { FaUserMd, FaPrescriptionBottleAlt, FaHistory, FaHome } from 'react-icons/fa';
import Footer from '../Main_Interface_UI/Footer';

// Encryption Library implement
import CryptoJS from 'crypto-js';

// Firebase 
import { db, storage } from '../../firebase';
import { collection, addDoc, Timestamp, doc, updateDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';

// UI Components
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

// QR Code Imports
import QRCodeLib from 'qrcode';

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
    const [qrCodeImageUrl, setQrCodeImageUrl] = useState('');
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

    // State for doctor's profile information (for sidebar)
    const auth = getAuth();
    const [doctorData, setDoctorData] = useState({
        firstName: 'Loading...',
        lastName: '',
        email: '',
        userType: '',
        photoURL: null,
    });
    const [loadingDoctorInfo, setLoadingDoctorInfo] = useState(true);

    
    const [isLogoutHovered, setIsLogoutHovered] = useState(false);


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

    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const docRef = doc(db, 'users', user.uid);
                try {
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setDoctorData({
                            firstName: data.firstName || 'Dr. Unknown',
                            lastName: data.lastName || '',
                            email: user.email || '',
                            userType: data.userType || 'Doctor',
                            photoURL: user.photoURL || pic,
                        });
                    } else {
                        console.log("No such document for the user!");
                        setDoctorData(prev => ({ ...prev, firstName: "Dr. Not Found", photoURL: pic }));
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setDoctorData(prev => ({ ...prev, firstName: "Error", photoURL: pic }));
                }
            } else {
                setDoctorData({ firstName: "Please Log In", lastName: "", email: "", userType: "", photoURL: pic });
            }
            setLoadingDoctorInfo(false);
        });

        return () => unsubscribe();
    }, [auth]);

    
    const getInitials = (firstName, lastName) => {
        const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
        const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
        return `${firstInitial}${lastInitial}`;
    };

    
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
    
    
    // backend Cloud Function to send the QR code email.
    const sendQRCodeEmail = async (patientEmail, qrCodeImageUrl, patientName) => {
        if (!patientEmail) {
            console.log("No patient email provided, skipping email send.");
            return;
        }

        try {
            //connection to Cloud Functions
            const functions = getFunctions();
            //Get a reference to the specific function by its name
            const sendQrCodeEmailCallable = httpsCallable(functions, 'sendQrCodeEmail');

            console.log(`Requesting to send QR code email to: ${patientEmail}`);

            //Call the function with the required payload
            const result = await sendQrCodeEmailCallable({
                to: patientEmail,
                qrCodeImageUrl: qrCodeImageUrl,
                patientName: patientName 
            });

            // 4. Log the success message from the backend
            console.log('Email send function called successfully:', result.data.message);
            alert('An email with the QR code has been sent to the patient.');

        } catch (error) {
            // 5. Catch and log any errors from the cloud function call
            console.error("Error calling sendQrCodeEmail function:", error);
            alert(`Failed to send QR code email. Error: ${error.message}`);
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

            const encryptedDiagnosis = encryptData(diagnosis);
            const encryptedMedications = encryptData(medications);
            const encryptedAdditionalNotes = encryptData(additionalNotes);

            const docRef = await addDoc(collection(db, 'prescriptions'), {
                doctorId: user.uid,
                patientName,
                patientmail,
                age,
                contactNumber,
                gender,
                bloodGroup,
                nationalId,
                diagnosis: encryptedDiagnosis,
                medications: encryptedMedications,
                additionalNotes: encryptedAdditionalNotes,
                patientRelationship,
                prescriptionDate: Timestamp.fromDate(new Date(prescriptionDate.getFullYear(), prescriptionDate.getMonth(), prescriptionDate.getDate())),
                prescriptionTime: prescriptionTime.toLocaleTimeString('en-US'),
                status: 'active',
                qrCodeUrl: '',
            });

            const qrCodeData = JSON.stringify({
                prescriptionId: docRef.id,
                nationalId: nationalId
            });

            const generatedQrCodeDataUrl = await new Promise((resolve, reject) => {
                QRCodeLib.toDataURL(qrCodeData, { width: 300, margin: 1 }, (err, url) => {
                    if (err) reject(err);
                    resolve(url);
                });
            });

            setQrCodeImageUrl(generatedQrCodeDataUrl);

            const qrCodeDownloadURL = await uploadQRCodeToStorage(generatedQrCodeDataUrl, docRef.id);

            if (qrCodeDownloadURL) {
                const prescriptionRef = doc(db, 'prescriptions', docRef.id);
                await updateDoc(prescriptionRef, { qrCodeUrl: qrCodeDownloadURL });
                
                // --- UPDATED CALL ---
                // Now calls the new email function with the patient's name
                if (patientmail) {
                    await sendQRCodeEmail(patientmail, qrCodeDownloadURL, patientName);
                }
            }

            alert("Prescription saved successfully! QR Code generated. You can now print it.");

        } catch (error) {
            console.error("Error saving prescription:", error);
            alert("Failed to save prescription. Please check the console for more details.");
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
        setNationalId('');
        setDiagnosis('');
        setMedications([{ id: 1, name: '', dosage: '', frequency: '', duration: '' }]);
        setAdditionalNotes('');
        setQrCodeImageUrl('');
        setPrescriptionDate(new Date());
        setPrescriptionTime(new Date());
        setPatientRelationship('');
    };

    const handlePrint = () => {
        if (qrCodeContainerRef.current && qrCodeImageUrl) {
            const printContent = qrCodeContainerRef.current;

            const printWindow = window.open('', '_blank', 'height=600,width=800');
            printWindow.document.write('<html><head><title>Prescription QR Code</title>');
            printWindow.document.write('<style>');
            printWindow.document.write(`
                body { font-family: sans-serif; text-align: center; padding: 20px; }
                .qr-print-container { margin: 20px auto; border: 1px solid #ddd; padding: 20px; width: fit-content; }
                .qr-print-container h3 { color: #333; margin-bottom: 15px; }
                .qr-print-container p { font-size: 1.1em; color: #555; margin: 5px 0; }
                .qr-print-container img { display: block; margin: 20px auto; border: 1px solid #eee; padding: 5px; max-width: 200px; height: auto;}
                .qr-print-container .small-text { font-size: 0.9em; color: #666; margin-top: 10px; }
            `);
            printWindow.document.write('</style>');
            printWindow.document.write('</head><body>');

            printWindow.document.write(printContent.outerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();

            printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
            };
        } else {
            alert("QR Code not ready for printing. Please save the prescription first to generate the QR code.");
        }
    };

    const styles = {
        // --- Header Styles ---
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
        siteTitle: { // Updated to match "MediPrescribe"
            margin: 0,
            fontSize: getResponsiveStyle('24px', '24px', '22px', '20px'),
            fontWeight: '700',
            color: '#2c3e50',
            whiteSpace: getResponsiveStyle('nowrap', 'nowrap', 'nowrap', 'normal'),
        },
        tagline: { // Updated to match "Your Digital Healthcare Solution"
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
        logoutButtonLink: { // Renamed from homeButtonLink
            textDecoration: 'none',
            flexShrink: 0,
            width: getResponsiveStyle('auto', 'auto', 'auto', '100%'),
            textAlign: 'center',
        },
        logoutButton: { // Renamed from homeButton
            padding: getResponsiveStyle('12px 25px', '12px 25px', '10px 20px', '8px 18px'),
            border: isLogoutHovered ? '1px solid #9cd6fc' : '1px solid #a8dadc',
            borderRadius: '30px',
            backgroundColor: isLogoutHovered ? '#9cd6fc' : '#b3e0ff',
            color: isLogoutHovered ? '#fff' : '#2980b9',
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
        registerArrow: { // Used for the forward arrow in the logout button
            marginLeft: '5px',
        },

        // Original styles (from your uploaded file) preserved below
        footer: { backgroundColor: '#d7f3d2', padding: '20px' },
        footerContainer: { display: 'flex', justifyContent: 'space-around', paddingBottom: '20px' },
        footerSection: { display: 'flex', flexDirection: 'column' },
        footerHeading: { fontSize: '1.2em', marginBottom: '10px', color: '#333' },
        list: { listStyle: 'none', padding: 0, margin: 0 },
        listItem: { marginBottom: '10px', color: '#555' },
        followUs: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
        socialIconContainer: { display: 'flex' },
        iconLink: { marginRight: '10px', textDecoration: 'none', color: '#333' },
        bottomBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #ccc' },
        copyright: { fontSize: '0.8em', color: '#777' },
        links: { display: 'flex' },
        bottomLink: { color: '#555', textDecoration: 'none', fontSize: '0.8em', marginRight: '10px' },
        separator: { color: '#ccc', marginRight: '10px' },

        dashboardContainer: {
            display: 'flex',
            padding: '20px',
            fontFamily: 'sans-serif'
        },
        sidebar: {
            width: '250px',
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '5px',
            marginRight: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
        },
        sidebarLink: {
            display: 'flex',
            alignItems: 'center',
            padding: '12px 15px',
            color: '#333',
            textDecoration: 'none',
            borderBottom: '1px solid #eee',
            width: '100%',
            textAlign: 'left',
            transition: 'background-color 0.2s, color 0.2s',
            fontSize: '15px',
            fontWeight: '500',
            borderRadius: '5px',
            marginBottom: '5px',
        },
        sidebarLinkActive: {
            color: '#007bff',
            backgroundColor: '#e6f2ff',
            fontWeight: 'bold',
        },
        sidebarIcon: {
            marginRight: '10px',
            fontSize: '1.2em',
        },
        doctorAvatar: {
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#00cba9',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5em',
            fontWeight: 'bold',
            marginBottom: '5px',
            marginTop: '20px',
            overflow: 'hidden'
        },
        doctorName: {
            fontSize: '1.1em',
            color: '#333',
            margin: 0,
            marginTop: '10px',
            fontWeight: 'bold'
        },
        doctorType: {
            fontSize: '0.9em',
            color: '#6c757d',
            margin: '5px 0 0 0'
        },
        doctorInfo: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '15px 0',
            borderBottom: '1px solid #eee',
            backgroundColor: '#d7f3d2',
            borderRadius: '5px',
            marginBottom: '20px',
            width: '100%'
        },

        content: { flexGrow: 1, padding: '20px', backgroundColor: '#fff', borderRadius: '5px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)' },
        formSection: { marginBottom: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fdfdfd' },
        formGroup: { marginBottom: '15px' },
        label: { display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' },
        input: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
        select: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
        textArea: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', minHeight: '80px' },
        medicationTable: { width: '100%', borderCollapse: 'collapse', marginBottom: '20px' },
        tableHeader: { border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f2f2f2' },
        tableCell: { border: '1px solid #ddd', padding: '8px' },
        addMedicineBtn: {
            backgroundColor: addBtnHover ? '#218838' : '#28a745',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1em',
            transition: 'background-color 0.3s ease',
        },
        deleteMedicineBtn: (isHovered) => ({
            backgroundColor: isHovered ? '#c82333' : '#dc3545',
            color: '#fff',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.8em',
            transition: 'background-color 0.3s ease',
        }),
        buttonGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
        saveBtn: {
            backgroundColor: saveBtnHover ? '#0056b3' : '#007bff',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1em',
            transition: 'background-color 0.3s ease',
        },
        cancelBtn: {
            backgroundColor: cancelBtnHover ? '#5a6268' : '#6c757d',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1em',
            transition: 'background-color 0.3s ease',
        },
        printBtn: {
            backgroundColor: printBtnHover ? '#138496' : '#17a2b8',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1em',
            transition: 'background-color 0.3s ease',
            marginLeft: '10px',
        },
        qrCodeContainer: { marginTop: '30px', textAlign: 'center', border: '1px dashed #ccc', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' },
        printDetails: {
            textAlign: 'left',
            marginBottom: '10px',
            fontSize: '1em',
            color: '#333'
        }
    };

    if (loadingDoctorInfo) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading doctor's profile...</div>;
    }

    return (
        <div style={{ fontFamily: 'sans-serif' }}>
            {/* Navigation Bar */}
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <img src={logo} alt="MediPrescribe Logo" style={styles.logo} />
                    <div>
                        <h1 style={styles.siteTitle}>MediPrescribe</h1>
                        <p style={styles.tagline}>Your Digital Healthcare Solution</p>
                    </div>
                </div>
                <div style={styles.headerRight}>
                    <div style={styles.phoneContact}>
                        <FaPhoneAlt style={styles.phoneIcon} />
                        <span>+94 (011) 519-51919</span>
                    </div>
                    <Link to="/signin" style={styles.logoutButtonLink}>
                        <div
                            style={styles.logoutButton}
                            onMouseEnter={() => setIsLogoutHovered(true)}
                            onMouseLeave={() => setIsLogoutHovered(false)}
                        >
                            <span>Logout</span>
                            <IoIosArrowForward style={styles.registerArrow} />
                        </div>
                    </Link>
                </div>
            </header>

            {/* Dashboard Content */}
            <div style={styles.dashboardContainer}>
                {/* Sidebar - Updated to match ProfilePage's design */}
                <aside style={styles.sidebar}>
                    <div style={styles.doctorInfo}>
                        <div style={styles.doctorAvatar}>
                            {doctorData.photoURL ? (
                                <img src={doctorData.photoURL} alt="Doctor Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <span>{getInitials(doctorData.firstName, doctorData.lastName)}</span>
                            )}
                        </div>
                        <p style={styles.doctorName}>{`${doctorData.firstName} ${doctorData.lastName}`}</p>
                        <p style={styles.doctorType}>{doctorData.userType}</p>
                    </div>
                    <Link to="/doctor/dashboard" style={styles.sidebarLink}><FaHome style={styles.sidebarIcon} />Dashboard</Link>
                    <Link to="/newprescription" style={{ ...styles.sidebarLink, ...styles.sidebarLinkActive }}><FaPrescriptionBottleAlt style={styles.sidebarIcon} />Create New Prescription</Link>
                    <Link to="/prescriptionhistory" style={styles.sidebarLink}><FaHistory style={styles.sidebarIcon} />Prescription History</Link>
                    <Link to="/docprofile" style={styles.sidebarLink}><FaUserMd style={styles.sidebarIcon} />Profile</Link>
                </aside>

                {/* Main Content (Prescription Form) */}
                <main style={styles.content}>
                    <h2>Create New Prescription</h2>
                    <form onSubmit={handleSubmit}>
                        {/* Patient Details */}
                        <div style={styles.formSection}>
                            <h3>Patient Details</h3>
                            <div style={styles.formGroup}>
                                <label style={styles.label} htmlFor="patientEmail">Patient Email:</label>
                                <Autocomplete
                                    id="patientEmail"
                                    options={patients}
                                    getOptionLabel={(option) => option.email}
                                    onChange={(event, newValue) => {
                                        setPatientMail(newValue ? newValue.email : '');
                                        setSelectedPatientId(newValue ? newValue.id : '');
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="outlined"
                                            size="small"
                                            inputProps={{
                                                ...params.inputProps,
                                                style: styles.input,
                                            }}
                                        />
                                    )}
                                    value={patients.find(p => p.email === patientmail) || null}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label} htmlFor="patientName">Patient Name:</label>
                                <input
                                    type="text"
                                    id="patientName"
                                    style={styles.input}
                                    value={patientName}
                                    onChange={(e) => setPatientName(e.target.value)}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label} htmlFor="nationalId">National ID (NIC):</label>
                                <input
                                    type="text"
                                    id="nationalId"
                                    style={styles.input}
                                    value={nationalId}
                                    onChange={(e) => setNationalId(e.target.value)}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label} htmlFor="age">Age:</label>
                                <input
                                    type="number"
                                    id="age"
                                    style={styles.input}
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label} htmlFor="contactNumber">Contact Number:</label>
                                <input
                                    type="text"
                                    id="contactNumber"
                                    style={styles.input}
                                    value={contactNumber}
                                    onChange={(e) => setContactNumber(e.target.value)}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label} htmlFor="gender">Gender:</label>
                                <select
                                    id="gender"
                                    style={styles.select}
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label} htmlFor="bloodGroup">Blood Group:</label>
                                <select
                                    id="bloodGroup"
                                    style={styles.select}
                                    value={bloodGroup}
                                    onChange={(e) => setBloodGroup(e.target.value)}
                                >
                                    <option value="">Select Blood Group</option>
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
                            <div style={styles.formGroup}>
                                <label style={styles.label} htmlFor="patientRelationship">Patient Relationship:</label>
                                <select
                                    id="patientRelationship"
                                    style={styles.select}
                                    value={patientRelationship}
                                    onChange={(e) => setPatientRelationship(e.target.value)}
                                    required
                                >
                                    <option value="">Select Relationship</option>
                                    <option value="Patient">Patient</option>
                                    <option value="Guardian">Guardian</option>
                                </select>
                            </div>
                        </div>

                        {/* Medical Details */}
                        <div style={styles.formSection}>
                            <h3>Medical Details</h3>
                            {/* DIAGNOSIS PART MOVED HERE */}
                            <div style={styles.formGroup}>
                                <label style={styles.label} htmlFor="diagnosis">Diagnosis:</label>
                                <textarea
                                    id="diagnosis"
                                    style={styles.textArea}
                                    value={diagnosis}
                                    onChange={(e) => setDiagnosis(e.target.value)}
                                    required
                                ></textarea>
                            </div>

                            <h4>Medications</h4>
                            <table style={styles.medicationTable}>
                                <thead>
                                    <tr>
                                        <th style={styles.tableHeader}>Medicine Name</th>
                                        <th style={styles.tableHeader}>Dosage</th>
                                        <th style={styles.tableHeader}>Frequency</th>
                                        <th style={styles.tableHeader}>Duration</th>
                                        <th style={styles.tableHeader}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medications.map((med) => (
                                        <tr key={med.id}>
                                            <td style={styles.tableCell}>
                                                <input
                                                    type="text"
                                                    style={styles.input}
                                                    value={med.name}
                                                    onChange={(e) => handleMedicineChange(med.id, 'name', e.target.value)}
                                                    required
                                                />
                                            </td>
                                            <td style={styles.tableCell}>
                                                <input
                                                    type="text"
                                                    style={styles.input}
                                                    value={med.dosage}
                                                    onChange={(e) => handleMedicineChange(med.id, 'dosage', e.target.value)}
                                                    required
                                                />
                                            </td>
                                            <td style={styles.tableCell}>
                                                <select
                                                    style={styles.select}
                                                    value={med.frequency}
                                                    onChange={(e) => handleMedicineChange(med.id, 'frequency', e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select Frequency</option>
                                                    <option value="Once Daily">Once Daily</option>
                                                    <option value="Twice Daily">Twice Daily</option>
                                                    <option value="Thrice Daily">Thrice Daily</option>
                                                    <option value="Every 4 hours">Every 4 hours</option>
                                                    <option value="Every 6 hours">Every 6 hours</option>
                                                    <option value="Every 8 hours">Every 8 hours</option>
                                                    <option value="As Needed">As Needed (PRN)</option>
                                                    <option value="Before Meal">Before Meal</option>
                                                    <option value="After Meal">After Meal</option>
                                                    <option value="At Bedtime">At Bedtime</option>
                                                    <option value="Weekly">Weekly</option>
                                                    <option value="Monthly">Monthly</option>
                                                </select>
                                            </td>
                                            <td style={styles.tableCell}>
                                                <input
                                                    type="text"
                                                    style={styles.input}
                                                    value={med.duration}
                                                    onChange={(e) => handleMedicineChange(med.id, 'duration', e.target.value)}
                                                    required
                                                />
                                            </td>
                                            {/* Corrected: Delete button in its own table cell */}
                                            <td style={styles.tableCell}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveMedicine(med.id)}
                                                    style={styles.deleteMedicineBtn(deleteBtnHovers[med.id])}
                                                    onMouseEnter={() => setDeleteBtnHovers(prev => ({ ...prev, [med.id]: true }))}
                                                    onMouseLeave={() => setDeleteBtnHovers(prev => ({ ...prev, [med.id]: false }))}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button
                                type="button"
                                onClick={handleAddMedicine}
                                style={styles.addMedicineBtn}
                                onMouseEnter={() => setAddBtnHover(true)}
                                onMouseLeave={() => setAddBtnHover(false)}
                            >
                                Add Medicine
                            </button>
                            <div style={{ ...styles.formGroup, marginTop: '20px' }}>
                                <label style={styles.label} htmlFor="additionalNotes">Additional Notes (if any):</label>
                                <textarea
                                    id="additionalNotes"
                                    style={styles.textArea}
                                    value={additionalNotes}
                                    onChange={(e) => setAdditionalNotes(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        {/* Prescription Metadata */}
                        <div style={styles.formSection}>
                            <h3>Prescription Details</h3>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Date:</label>
                                <input
                                    type="text"
                                    style={styles.input}
                                    value={prescriptionDate.toLocaleDateString()}
                                    readOnly
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Time:</label>
                                <input
                                    type="text"
                                    style={styles.input}
                                    value={prescriptionTime.toLocaleTimeString()}
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={styles.buttonGroup}>
                            <button
                                type="button"
                                onClick={handleCancel}
                                style={styles.cancelBtn}
                                onMouseEnter={() => setCancelBtnHover(true)}
                                onMouseLeave={() => setCancelBtnHover(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                style={styles.saveBtn}
                                onMouseEnter={() => setSaveBtnHover(true)}
                                onMouseLeave={() => setSaveBtnHover(false)}
                            >
                                Save Prescription
                            </button>
                            {qrCodeImageUrl && (
                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    style={styles.printBtn}
                                    onMouseEnter={() => setPrintBtnHover(true)}
                                    onMouseLeave={() => setPrintBtnHover(false)}
                                >
                                    Print QR Code
                                </button>
                            )}
                        </div>

                        {/* QR Code Display for Print */}
                        {qrCodeImageUrl && (
                            <div ref={qrCodeContainerRef} className="qr-print-container" style={styles.qrCodeContainer}>
                                <h3>Prescription Slip</h3>
                                <div style={styles.printDetails}>
                                    <p><strong>Patient Name:</strong> {patientName}</p>
                                    <p><strong>National ID (NIC):</strong> {nationalId}</p>
                                    <p><strong>Patient Relationship:</strong> {patientRelationship}</p>
                                    <p><strong>Date:</strong> {prescriptionDate.toLocaleDateString()}</p>
                                    <p><strong>Time:</strong> {prescriptionTime.toLocaleTimeString()}</p>
                                </div>
                                <img src={qrCodeImageUrl} alt="QR Code for Prescription" style={{ width: '200px', height: '200px' }} />
                                <p className="small-text">
                                    This QR code contains an encrypted reference to the prescription.
                                </p>
                            </div>
                        )}
                    </form>
                </main>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default NewPrescriptionForm;