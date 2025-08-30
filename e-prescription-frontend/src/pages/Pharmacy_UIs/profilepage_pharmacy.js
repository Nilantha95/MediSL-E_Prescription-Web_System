// used AI tools to code enhacements and designing parts.

import { faCog, faHistory, faHome } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getAuth, onAuthStateChanged, signOut, updatePassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { FaPhoneAlt } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import { Link, useNavigate } from 'react-router-dom';
import { db, storage } from '../../firebase'; 
import Footer from '../Main_Interface_UI/Footer';
import logo from '../Main_Interface_UI/images/Logo01.png';
import pic from './Images/phar01.jpg'; 


const PharmacistProfilePage = () => {
    const navigate = useNavigate();
    const auth = getAuth();

    // --- STATE MANAGEMENT ---
    const [user, setUser] = useState(null);
    const [pharmacistData, setPharmacistData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        userType: '',
        photoURL: pic, // Default photo
    });
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [isPasswordChangeVisible, setIsPasswordChangeVisible] = useState(false);
    const [loading, setLoading] = useState(true);

    // UI and responsive states
    const [isLogoutHovered, setIsLogoutHovered] = useState(false);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    // --- EFFECTS ---

    // Effect for handling screen resize
    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Effect to fetch user data from Firebase
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const docRef = doc(db, 'users', currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setPharmacistData({
                            firstName: data.firstName || '',
                            lastName: data.lastName || '',
                            email: currentUser.email,
                            userType: data.userType || 'Pharmacist',
                            photoURL: data.photoURL || pic, 
                        });
                    } else {
                        setStatusMessage("User profile not found.");
                    }
                } catch (error) {
                    console.error("Error fetching pharmacist data:", error);
                    setStatusMessage('Error fetching user data.');
                }
            } else {
                navigate('/signin'); // Redirect if not logged in
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [auth, navigate]);


    // --- HANDLER FUNCTIONS ---

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/signin');
        } catch (error) {
            console.error("Error logging out:", error);
            setStatusMessage("Failed to log out.");
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!user) return;
        setStatusMessage('Updating profile...');
        try {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                firstName: pharmacistData.firstName,
                lastName: pharmacistData.lastName,
            });
            
            await updateProfile(user, { displayName: `${pharmacistData.firstName} ${pharmacistData.lastName}` });
            setStatusMessage('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            setStatusMessage('Failed to update profile.');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            setStatusMessage('New passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            setStatusMessage('Password must be at least 6 characters long.');
            return;
        }
        try {
            await updatePassword(user, newPassword);
            setStatusMessage('Password updated successfully!');
            setNewPassword('');
            setConfirmNewPassword('');
            setIsPasswordChangeVisible(false);
        } catch (error) {
            console.error('Error updating password:', error);
            setStatusMessage('Failed to update password. You may need to sign in again.');
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !user) return;

        setStatusMessage('Uploading photo...');
        const storageRef = ref(storage, `profile_pictures/${user.uid}`);
        try {
            await uploadBytes(storageRef, file);
            const photoURL = await getDownloadURL(storageRef);

            // Update photoURL in Firebase Auth and Firestore
            await updateProfile(user, { photoURL });
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { photoURL });

            setPharmacistData(prev => ({ ...prev, photoURL }));
            setStatusMessage('Profile picture updated successfully!');
        } catch (error) {
            console.error('Error uploading photo:', error);
            setStatusMessage('Failed to upload photo.');
        }
    };

    // --- STYLING ---

    const getResponsiveStyle = (desktopStyle, tabletStyle, mobileStyle, smallMobileStyle) => {
        if (screenWidth <= 575) return smallMobileStyle;
        if (screenWidth <= 768) return mobileStyle;
        if (screenWidth <= 992) return tabletStyle;
        return desktopStyle;
    };

    const styles = {
        
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: getResponsiveStyle('20px 50px', '15px 40px', '12px 20px', '10px 15px'),
            backgroundColor: '#e0ffe0',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            flexWrap: 'wrap',
        },
        headerLeft: { display: 'flex', alignItems: 'center' },
        logo: { height: getResponsiveStyle('55px', '55px', '50px', '45px'), marginRight: '15px' },
        siteTitle: { margin: 0, fontSize: getResponsiveStyle('24px', '22px', '20px', '20px'), fontWeight: '700', color: '#2c3e50' },
        tagline: { margin: 0, fontSize: getResponsiveStyle('13px', '12px', '11px', '11px'), color: '#7f8c8d' },
        headerRight: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '15px' },
        phoneContact: { display: 'flex', alignItems: 'center', color: '#2980b9', fontWeight: '500' },
        phoneIcon: { marginRight: '8px' },
        logoutButton: {
            padding: '12px 25px', border: isLogoutHovered ? '1px solid #9cd6fc' : '1px solid #a8dadc',
            borderRadius: '30px', backgroundColor: isLogoutHovered ? '#9cd6fc' : '#b3e0ff',
            color: isLogoutHovered ? '#fff' : '#2980b9', cursor: 'pointer', display: 'flex',
            alignItems: 'center', fontWeight: 'bold', transition: 'all 0.3s ease',
        },

        dashboardContainer: { display: 'flex', padding: '20px', fontFamily: 'sans-serif', gap: '20px' },
        sidebar: {
            width: '250px', flexShrink: 0, backgroundColor: '#f8f9fa', padding: '20px',
            borderRadius: '5px', display: 'flex', flexDirection: 'column', alignItems: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)', alignSelf: 'flex-start',
        },
        mainContent: { flexGrow: 1, padding: '30px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', maxWidth: '800px', margin: '0 auto' },
        
        userInfo: {
            display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px 0',
            borderBottom: '1px solid #eee', backgroundColor: '#d7f3d2', borderRadius: '5px',
            marginBottom: '20px', width: '100%'
        },
        userAvatarContainer: {
            width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#00cba9',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5em', fontWeight: 'bold', overflow: 'hidden',
        },
        userAvatar: { width: '100%', height: '100%', objectFit: 'cover' },
        userName: { fontSize: '1.1em', color: '#333', marginTop: '10px', fontWeight: 'bold' },
        userType: { fontSize: '0.9em', color: '#6c757d', margin: '5px 0 0 0' },
        sidebarLink: {
            display: 'flex', alignItems: 'center', padding: '12px 15px', color: '#333', textDecoration: 'none',
            width: '100%', transition: 'background-color 0.2s', fontSize: '15px', fontWeight: '500',
            borderRadius: '5px', marginBottom: '5px'
        },
        sidebarLinkActive: { color: '#007bff', backgroundColor: '#e6f2ff', fontWeight: 'bold' },
        sidebarIcon: { marginRight: '10px', fontSize: '1.2em' },
        
        // Profile specific styles from doc_profile
        h2: { margin: 0, color: '#333', fontSize: '24px', textAlign: 'center' },
        subHeading: { fontSize: '14px', color: '#6c757d', marginBottom: '30px', textAlign: 'center' },
        profileSection: { marginBottom: '30px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' },
        sectionHeading: { marginTop: 0, color: '#007bff', fontSize: '18px' },
        photoContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' },
        profilePhoto: { width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #007bff' },
        photoEditButton: {
            marginTop: '10px', padding: '8px 15px', backgroundColor: '#f0f0f0', color: '#333',
            border: '1px solid #ddd', borderRadius: '20px', cursor: 'pointer', fontSize: '14px',
            transition: 'background-color 0.2s',
        },
        inputGroup: { marginBottom: '15px' },
        label: { display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' },
        inputField: { width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', fontSize: '15px' },
        nameFields: { display: 'flex', gap: '20px' },
        saveButton: { backgroundColor: '#007bff', color: 'white', padding: '12px 25px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' },
        changePasswordButton: { backgroundColor: '#28a745', color: 'white', padding: '12px 25px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' },
        cancelButton: { backgroundColor: '#f0f0f0', color: '#555', padding: '12px 25px', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' },
        message: { padding: '10px', borderRadius: '5px', marginBottom: '20px', textAlign: 'center' },
    };


    // --- RENDER ---
    
    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading Your Profile...</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            {/* Header */}
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
                    <div style={styles.logoutButton} onMouseEnter={() => setIsLogoutHovered(true)} onMouseLeave={() => setIsLogoutHovered(false)} onClick={handleLogout}>
                        <span>Logout</span>
                        <IoIosArrowForward style={{ marginLeft: '5px' }} />
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div style={styles.dashboardContainer}>
                {/* Sidebar */}
                <aside style={styles.sidebar}>
                    <div style={styles.userInfo}>
                        <div style={styles.userAvatarContainer}>
                            <img src={pharmacistData.photoURL} alt="Pharmacist" style={styles.userAvatar} />
                        </div>
                        <p style={styles.userName}>{`${pharmacistData.firstName} ${pharmacistData.lastName}`}</p>
                        <p style={styles.userType}>{pharmacistData.userType}</p>
                    </div>
                    <Link to="/pharmacy/dashboard" style={styles.sidebarLink}>
                        <FontAwesomeIcon icon={faHome} style={styles.sidebarIcon}/>Dashboard
                    </Link>
                    <Link to="/pharmacy_history" style={styles.sidebarLink}>
                        <FontAwesomeIcon icon={faHistory} style={styles.sidebarIcon}/>Prescription History
                    </Link>
                    <Link to="/pharmacy/settings" style={{...styles.sidebarLink, ...styles.sidebarLinkActive}}>
                        <FontAwesomeIcon icon={faCog} style={styles.sidebarIcon}/>Profile
                    </Link>
                </aside>
                
                {/* Profile Settings Content */}
                <main style={styles.mainContent}>
                    <h2 style={styles.h2}>Pharmacist Profile</h2>
                    <p style={styles.subHeading}>Manage your personal information and account settings.</p>

                    {statusMessage && (
                        <div style={{ ...styles.message, backgroundColor: statusMessage.includes('success') ? '#d4edda' : '#f8d7da', color: statusMessage.includes('success') ? '#155724' : '#721c24' }}>
                            {statusMessage}
                        </div>
                    )}

                    <div style={styles.profileSection}>
                        <h3 style={styles.sectionHeading}>Profile Picture</h3>
                        <div style={styles.photoContainer}>
                            <img src={pharmacistData.photoURL} alt="Profile" style={styles.profilePhoto} />
                            <label style={styles.photoEditButton}>
                                Change Photo
                                <input type="file" onChange={handlePhotoChange} accept="image/*" style={{ display: 'none' }} />
                            </label>
                        </div>
                    </div>

                    <div style={styles.profileSection}>
                        <h3 style={styles.sectionHeading}>Personal Information</h3>
                        <form onSubmit={handleUpdateProfile}>
                            <div style={styles.inputGroup}>
                                <label htmlFor="email" style={styles.label}>Email Address</label>
                                <input type="email" id="email" value={pharmacistData.email} style={{ ...styles.inputField, backgroundColor: '#e9ecef' }} readOnly />
                            </div>
                            <div style={styles.nameFields}>
                                <div style={{...styles.inputGroup, flex: 1}}>
                                    <label htmlFor="firstName" style={styles.label}>First Name</label>
                                    <input type="text" id="firstName" value={pharmacistData.firstName} onChange={(e) => setPharmacistData({ ...pharmacistData, firstName: e.target.value })} style={styles.inputField} required />
                                </div>
                                <div style={{...styles.inputGroup, flex: 1}}>
                                    <label htmlFor="lastName" style={styles.label}>Last Name</label>
                                    <input type="text" id="lastName" value={pharmacistData.lastName} onChange={(e) => setPharmacistData({ ...pharmacistData, lastName: e.target.value })} style={styles.inputField} required />
                                </div>
                            </div>
                            <button type="submit" style={styles.saveButton}>Save Changes</button>
                        </form>
                    </div>

                    <div style={styles.profileSection}>
                        <h3 style={styles.sectionHeading}>Security</h3>
                        {!isPasswordChangeVisible ? (
                            <button onClick={() => setIsPasswordChangeVisible(true)} style={styles.changePasswordButton}>
                                Change Password
                            </button>
                        ) : (
                            <form onSubmit={handleChangePassword}>
                                <div style={styles.inputGroup}>
                                    <label htmlFor="newPassword" style={styles.label}>New Password</label>
                                    <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={styles.inputField} placeholder="Minimum 6 characters" required />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label htmlFor="confirmNewPassword" style={styles.label}>Confirm New Password</label>
                                    <input type="password" id="confirmNewPassword" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} style={styles.inputField} placeholder="Re-enter new password" required />
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="submit" style={styles.saveButton}>Update Password</button>
                                    <button type="button" onClick={() => setIsPasswordChangeVisible(false)} style={styles.cancelButton}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </main>
            </div>
            
            <Footer />
        </div>
    );
};

export default PharmacistProfilePage;