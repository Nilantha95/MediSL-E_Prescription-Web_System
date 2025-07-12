import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase'; // Adjust this path if your firebase.js file is in a different location
import { FaPlus, FaTrashAlt } from 'react-icons/fa';
import CryptoJS from 'crypto-js';
import logo from '../Main_Interface_UI/images/Logo01.png';
import { FaPhoneAlt } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterest, FaWhatsapp } from 'react-icons/fa';
import pic from '../Main_Interface_UI/images/Doctor.png'; // Default doctor image

// The key must be securely managed in a real application.
// It must be the SAME KEY as the one used for encryption.
const SECRET_KEY = "your-super-secret-key-that-should-be-in-a-secure-place";

// Helper function to decrypt data
const decryptData = (encryptedData) => {
    if (!encryptedData) return null;
    try {
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
        const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedString);
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
};

// Helper function to encrypt data
const encryptData = (data) => {
    if (!data) return null;
    try {
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
        return encrypted;
    } catch (error) {
        console.error("Encryption failed:", error);
        return null;
    }
};

const PrescriptionView = () => {
    const { prescriptionId } = useParams();
    const navigate = useNavigate();
    const auth = getAuth();

    // ===================== STATE FROM DOCTOR DASHBOARD =====================
    const [firstName, setFirstName] = useState('Loading...');
    const [lastName, setLastName] = useState('');
    const [doctorPic, setDoctorPic] = useState(null);
    // =======================================================================
    
    const [prescription, setPrescription] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // ===================== USE EFFECT FOR AUTH & DATA FETCHING =====================
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Fetch doctor's profile data
                const userDocRef = doc(db, 'users', user.uid);
                try {
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        setFirstName(userData.firstName || 'Dr. Unknown');
                        setLastName(userData.lastName || '');
                        setDoctorPic(userData.photoURL || pic);
                    } else {
                        console.log("No user profile found!");
                        setFirstName("Dr. Not Found");
                        setDoctorPic(pic);
                    }
                } catch (profileError) {
                    console.error("Error fetching doctor profile:", profileError);
                    setFirstName("Error");
                    setDoctorPic(pic);
                }

                // Fetch prescription data
                const prescriptionDocRef = doc(db, 'prescriptions', prescriptionId);
                try {
                    const docSnap = await getDoc(prescriptionDocRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.doctorId !== user.uid) {
                            setError("You do not have permission to view this prescription.");
                            setLoading(false);
                            return;
                        }
                        
                        const decryptedDiagnosis = decryptData(data.diagnosis);
                        const decryptedMedications = decryptData(data.medications);
                        const decryptedAdditionalNotes = decryptData(data.additionalNotes);

                        setPrescription({
                            ...data,
                            diagnosis: decryptedDiagnosis,
                            medicines: decryptedMedications,
                            additionalNotes: decryptedAdditionalNotes
                        });

                        setMedicines(decryptedMedications || []);
                        
                    } else {
                        setError("Prescription not found.");
                    }
                } catch (err) {
                    console.error("Error fetching prescription:", err);
                    setError("Failed to fetch prescription. Please try again.");
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
                setError("Please log in to view prescriptions.");
                // Optionally redirect to login page
                // navigate('/signin');
            }
        });
        return () => unsubscribe();
    }, [prescriptionId, auth]);
    
    // Function to get initials from a name
    const getInitials = (firstName, lastName) => {
        const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
        const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
        return `${firstInitial}${lastInitial}`;
    };
    
    const handleMedicineChange = (index, field, value) => {
        const updatedMedicines = [...medicines];
        updatedMedicines[index][field] = value;
        setMedicines(updatedMedicines);
    };

    const handleAddMedicine = () => {
        setMedicines([...medicines, { name: '', dosage: '', frequency: '' }]);
    };

    const handleRemoveMedicine = (index) => {
        const updatedMedicines = medicines.filter((_, i) => i !== index);
        setMedicines(updatedMedicines);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const docRef = doc(db, 'prescriptions', prescriptionId);
        
        const encryptedMedications = encryptData(medicines);
        
        try {
            await updateDoc(docRef, {
                medications: encryptedMedications,
                updatedAt: new Date(),
            });
            alert("Prescription updated successfully!");
        } catch (err) {
            console.error("Error updating prescription:", err);
            alert("Failed to save changes. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // ===================== CONSOLIDATED STYLES =====================
    const styles = {
        navBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', backgroundColor: '#d7f3d2' },
        logoContainer: { display: 'flex', alignItems: 'center' },
        logo: { height: '50px', marginRight: '10px' },
        titleContainer: { display: 'flex', flexDirection: 'column' },
        title: { margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#333' },
        subtitle: { margin: 0, fontSize: '12px', color: '#777' },
        contactInfo: { display: 'flex', alignItems: 'center', marginRight: '20px', color: '#007bff' },
        homeButtonDiv: { padding: '10px 20px', border: '1px solid #ddd', borderRadius: '20px', backgroundColor: 'lightblue', color: '#007bff', cursor: 'pointer', display: 'flex', alignItems: 'center' },
        dashboardContainer: { display: 'flex', padding: '20px', fontFamily: 'sans-serif' },
        sidebar: { width: '200px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '5px', marginRight: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
        sidebarLink: { display: 'block', padding: '10px 0', color: '#333', textDecoration: 'none', borderBottom: '1px solid #eee', width: '100%', textAlign: 'center' },
        sidebarLinkActive: { color: '#007bff', fontWeight: 'bold' },
        doctorInfo: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px 0', borderTop: '1px solid #eee', backgroundColor: '#d7f3d2', padding: '10px', borderRadius: '5px', marginTop: '10px', width: '100%' },
        doctorAvatar: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#00cba9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5em', fontWeight: 'bold', marginBottom: '5px', objectFit: 'cover' },
        doctorName: { fontSize: '1em', color: '#555', margin: 0 },
        formContainer: { fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '40px auto', padding: '30px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', backgroundColor: '#fff', flexGrow: 1 },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: '1px solid #eee' },
        section: { marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' },
        medicineItem: { display: 'flex', alignItems: 'center', border: '1px solid #eee', padding: '10px', borderRadius: '4px', backgroundColor: '#f9f9f9', marginBottom: '10px' },
        medicineInput: { flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginRight: '10px' },
        removeBtn: { backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
        addBtn: { backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', padding: '10px 20px', cursor: 'pointer', fontSize: '1em', display: 'flex', alignItems: 'center', gap: '8px' },
        saveBtn: { width: '100%', padding: '15px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1em', marginTop: '20px' },
        buttonContainer: { textAlign: 'right', marginTop: '10px' },
        infoText: { fontSize: '1em', color: '#777' },
        errorText: { color: 'red', textAlign: 'center' },
        loadingText: { color: '#007bff', textAlign: 'center' },
        // Footer styles
        footer: { backgroundColor: '#d7f3d2', padding: '20px', marginTop: '20px' },
        footerContainer: { display: 'flex', justifyContent: 'space-around', paddingBottom: '20px' },
        footerSection: { display: 'flex', flexDirection: 'column' },
        footerHeading: { fontSize: '1.2em', marginBottom: '10px', color: '#333' },
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
    };
    // =========================================================================

    if (loading) {
        return <div style={styles.loadingText}>Loading prescription...</div>;
    }

    if (error) {
        return <div style={styles.errorText}>{error}</div>;
    }
    
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
                    <Link to="/doctor/dashboard" style={{ ...styles.sidebarLink }}>Dashboard</Link>
                    <Link to="/newprescription" style={{ ...styles.sidebarLink, ...styles.sidebarLinkActive }}>Patients</Link>
                    <Link to="/prescriptionhistory" style={styles.sidebarLink}>Prescriptions</Link>
                    <Link to="/appointments" style={styles.sidebarLink}>Appointments</Link>
                    <Link to="/docprofile" style={styles.sidebarLink}>Settings</Link>

                    <div style={styles.doctorInfo}>
                        <div style={styles.doctorAvatar}>
                            {doctorPic ? (
                                <img src={doctorPic} alt="Doctor Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <span>{getInitials(firstName, lastName)}</span>
                            )}
                        </div>
                        <p style={styles.doctorName}>{`${firstName} ${lastName}`}</p>
                    </div>
                </aside>

                {/* Main Content (Prescription View) */}
                <div style={{ flexGrow: 1 }}>
                    <div style={styles.formContainer}>
                        <h1 style={styles.header}>Prescription Details</h1>
                        <div style={styles.section}>
                            <h3 style={{ color: '#007bff' }}>Patient Information</h3>
                            <p style={styles.infoText}><strong>Patient Name:</strong> {prescription?.patientName}</p>
                            <p style={styles.infoText}><strong>Diagnosis:</strong> {prescription?.diagnosis}</p>
                            <p style={styles.infoText}>
                                <strong>Created On:</strong>{' '}
                                {prescription?.createdAt?.toDate ? new Date(prescription.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                            </p>
                            <p style={styles.infoText}><strong>Prescription ID:</strong> {prescriptionId}</p>
                        </div>

                        <div style={styles.section}>
                            <h3 style={{ color: '#28a745' }}>Medicines</h3>
                            <form onSubmit={handleSave}>
                                {medicines.map((med, index) => (
                                    <div key={index} style={styles.medicineItem}>
                                        <input
                                            style={styles.medicineInput}
                                            type="text"
                                            placeholder="Medicine Name"
                                            value={med.name}
                                            onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                                            required
                                        />
                                        <input
                                            style={styles.medicineInput}
                                            type="text"
                                            placeholder="Dosage (e.g., 500mg)"
                                            value={med.dosage}
                                            onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                                            required
                                        />
                                        <input
                                            style={styles.medicineInput}
                                            type="text"
                                            placeholder="Frequency (e.g., 1-1-1)"
                                            value={med.frequency}
                                            onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveMedicine(index)}
                                            style={styles.removeBtn}
                                        >
                                            <FaTrashAlt />
                                        </button>
                                    </div>
                                ))}
                                <div style={styles.buttonContainer}>
                                    <button type="button" onClick={handleAddMedicine} style={styles.addBtn}>
                                        <FaPlus /> Add Medicine
                                    </button>
                                </div>
                                <button type="submit" style={styles.saveBtn} disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Footer */}
            <footer style={styles.footer}>
                <div style={styles.footerContainer}>
                    <div style={styles.footerSection}>
                        <h4 style={styles.footerHeading}>About Us</h4>
                        <ul style={styles.list}>
                            <li style={styles.listItem}>Our Story</li>
                            <li style={styles.listItem}>Contact Us</li>
                            <li style={styles.listItem}>Our Team</li>
                        </ul>
                    </div>
                    <div style={styles.footerSection}>
                        <h4 style={styles.footerHeading}>Services</h4>
                        <ul style={styles.list}>
                            <li style={styles.listItem}>E-Prescriptions</li>
                            <li style={styles.listItem}>Patient Records</li>
                            <li style={styles.listItem}>Appointments</li>
                        </ul>
                    </div>
                    <div style={styles.footerSection}>
                        <h4 style={styles.footerHeading}>Legal</h4>
                        <ul style={styles.list}>
                            <li style={styles.listItem}>Privacy Policy</li>
                            <li style={styles.listItem}>Terms of Service</li>
                        </ul>
                    </div>
                    <div style={styles.followUs}>
                        <h4 style={styles.footerHeading}>Follow Us</h4>
                        <div style={styles.socialIcon}>
                            <Link to="#" style={styles.iconLink}><FaFacebookF /></Link>
                            <Link to="#" style={styles.iconLink}><FaTwitter /></Link>
                            <Link to="#" style={styles.iconLink}><FaInstagram /></Link>
                            <Link to="#" style={styles.iconLink}><FaPinterest /></Link>
                            <Link to="#" style={styles.iconLink}><FaWhatsapp /></Link>
                        </div>
                    </div>
                </div>
                <div style={styles.bottomBar}>
                    <div style={styles.copyright}>
                        &copy; 2024 MediPrescribe. All Rights Reserved.
                    </div>
                    <div style={styles.links}>
                        <Link to="#" style={styles.bottomLink}>Home</Link>
                        <span style={styles.separator}>|</span>
                        <Link to="#" style={styles.bottomLink}>About</Link>
                        <span style={styles.separator}>|</span>
                        <Link to="#" style={styles.bottomLink}>Services</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PrescriptionView;