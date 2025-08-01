import React, { useState, useEffect } from 'react';
import logo from '../Main_Interface_UI/images/Logo01.png';
import pic from '../Main_Interface_UI/images/Doctor.png'; // Using this as a placeholder for a default profile pic
import { IoIosArrowForward } from 'react-icons/io';
import { FaPhoneAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { FaUser, FaHistory, FaFileMedical, FaHome } from 'react-icons/fa'; // Patient-specific icons
import { getAuth, onAuthStateChanged, updatePassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase'; // adjust path if needed
import Footer from '../Main_Interface_UI/Footer';

const PatientProfilePage = () => {
    const auth = getAuth();

    // State for user data and form inputs
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        userType: '',
        photoURL: null,
        address: '', // Now Editable
    });
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [isPasswordChangeVisible, setIsPasswordChangeVisible] = useState(false);
    const [loading, setLoading] = useState(true);

    // Header and Logout Button Hover State
    const [isLogoutHovered, setIsLogoutHovered] = useState(false);

    // Responsive Styles State
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


    // Fetch user data from Firebase Auth and Firestore on component mount
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const docRef = doc(db, 'users', currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setUserData({
                            firstName: data.firstName || '',
                            lastName: data.lastName || '',
                            email: currentUser.email,
                            userType: data.userType || '',
                            photoURL: currentUser.photoURL || pic,
                            address: data.address || '',
                        });
                    } else {
                        console.log("No such document for user profile!");
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setStatusMessage('Error fetching user data.');
                }
            } else {
                setUser(null);
                // Removed DOB, gender, NIC, contactNumber from initial state as well
                setUserData({ firstName: '', lastName: '', email: '', userType: '', photoURL: null, address: '' });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [auth]);

    // Handle profile information update
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setStatusMessage('');

        if (!user) {
            setStatusMessage('You must be logged in to update your profile.');
            return;
        }

        try {
            const docRef = doc(db, 'users', user.uid);
            await updateDoc(docRef, {
                firstName: userData.firstName,
                lastName: userData.lastName,
                address: userData.address,
            });
            setStatusMessage('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            setStatusMessage('Failed to update profile.');
        }
    };

    // Handle password change (re-enabled)
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setStatusMessage('');

        if (newPassword !== confirmNewPassword) {
            setStatusMessage('Passwords do not match.');
            return;
        }

        if (newPassword.length < 6) {
            setStatusMessage('Password should be at least 6 characters.');
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
            setStatusMessage('Failed to update password. Please sign in again and try.');
        }
    };

    // Handle profile picture upload (unchanged)
    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setStatusMessage('Uploading photo...');
        try {
            const storageRef = ref(storage, `profile_pictures/${user.uid}`);
            await uploadBytes(storageRef, file);
            const photoURL = await getDownloadURL(storageRef);

            await updateProfile(user, { photoURL });

            const docRef = doc(db, 'users', user.uid);
            await updateDoc(docRef, { photoURL });

            setUserData(prev => ({ ...prev, photoURL }));
            setStatusMessage('Profile picture updated successfully!');
        } catch (error) {
            console.error('Error uploading photo:', error);
            setStatusMessage('Failed to upload photo.');
        }
    };

    // Consolidated Styles
    const styles = {
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
        siteTitle: {
            margin: 0,
            fontSize: getResponsiveStyle('24px', '24px', '22px', '20px'),
            fontWeight: '700',
            color: '#2c3e50',
            whiteSpace: getResponsiveStyle('nowrap', 'nowrap', 'nowrap', 'normal'),
        },
        tagline: {
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
        logoutButtonLink: {
            textDecoration: 'none',
            flexShrink: 0,
            width: getResponsiveStyle('auto', 'auto', 'auto', '100%'),
            textAlign: 'center',
        },
        logoutButton: {
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
        registerArrow: {
            marginLeft: '5px',
        },


        // Sidebar Styles (Adapted for Patient)
        dashboardContainer: { display: 'flex', padding: '20px', fontFamily: 'sans-serif' },
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
        },
        sidebarLinkActive: {
            color: '#007bff',
            backgroundColor: '#e6f2ff',
            fontWeight: 'bold',
            borderRadius: '5px',
        },
        sidebarIcon: {
            marginRight: '10px',
            fontSize: '1.2em',
        },
        patientAvatar: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#00cba9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5em', fontWeight: 'bold', marginBottom: '5px', marginTop: '20px', overflow: 'hidden' },
        patientName: { fontSize: '1.1em', color: '#333', margin: 0, marginTop: '10px', fontWeight: 'bold' },
        patientType: { fontSize: '0.9em', color: '#6c757d', margin: '5px 0 0 0' },
        patientInfo: {
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

        // Profile Page Specific Styles
        profileContainer: { flexGrow: 1, padding: '30px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', maxWidth: '800px', margin: '0 auto' },
        h2: { margin: 0, color: '#333', fontSize: '24px', textAlign: 'center' },
        subHeading: { fontSize: '14px', color: '#6c757d', marginBottom: '30px', textAlign: 'center' },
        profileSection: { marginBottom: '30px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px' },
        sectionHeading: { marginTop: 0, color: '#007bff', fontSize: '18px' },
        photoContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' },
        profilePhoto: { width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #007bff' },
        photoEditButton: {
            marginTop: '10px',
            padding: '8px 15px',
            backgroundColor: '#f0f0f0',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background-color 0.2s',
            '&:hover': {
                backgroundColor: '#e0e0e0',
            },
        },
        inputGroup: { marginBottom: '15px' },
        label: { display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' },
        inputField: { width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', fontSize: '15px' },
        readOnlyField: { // Style for read-only fields
            width: '100%',
            padding: '12px',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            boxSizing: 'border-box',
            fontSize: '15px',
            backgroundColor: '#f8f8f8',
            color: '#6c757d',
        },
        nameFields: { display: 'flex', gap: '20px' },
        saveButton: {
            backgroundColor: '#007bff',
            color: 'white',
            padding: '12px 25px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'background-color 0.2s',
            '&:hover': { backgroundColor: '#0056b3' }
        },
        changePasswordButton: {
            backgroundColor: '#28a745',
            color: 'white',
            padding: '12px 25px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'background-color 0.2s',
            '&:hover': { backgroundColor: '#218838' }
        },
        cancelButton: {
            backgroundColor: '#f0f0f0',
            color: '#555',
            padding: '12px 25px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'background-color 0.2s',
            '&:hover': { backgroundColor: '#e0e0e0' }
        },
        message: {
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
            textAlign: 'center',
        },
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading profile...</div>;
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
                {/* Sidebar (Adapted for Patient) */}
                <aside style={styles.sidebar}>
                    <div style={styles.patientInfo}>
                        <div style={styles.patientAvatar}>
                            <img src={userData.photoURL || pic} alt="User Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        </div>
                        <p style={styles.patientName}>{`${userData.firstName} ${userData.lastName}`}</p>
                        <p style={styles.patientType}>{userData.userType}</p>
                    </div>
                    <Link to="/patient/dashboard" style={styles.sidebarLink}><FaHome style={styles.sidebarIcon} />Dashboard</Link>
                    <Link to="/patient/prescriptions" style={styles.sidebarLink}><FaFileMedical style={styles.sidebarIcon} />My Prescriptions</Link>
                    <Link to="/patient-health-records" style={styles.sidebarLink}><FaHistory style={styles.sidebarIcon} />My Health Records</Link>
                    <Link to="#" style={{ ...styles.sidebarLink, ...styles.sidebarLinkActive }}><FaUser style={styles.sidebarIcon} />Profile</Link>
                </aside>

                {/* Profile Page Content */}
                <div style={styles.profileContainer}>
                    <h2 style={styles.h2}>Patient Profile</h2>
                    <p style={styles.subHeading}>Manage your personal information and security settings.</p>

                    {statusMessage && (
                        <div style={{ ...styles.message, backgroundColor: statusMessage.includes('successfully') ? '#e6ffe6' : '#ffe6e6' }}>
                            {statusMessage}
                        </div>
                    )}

                    {/* Profile Picture Section */}
                    <div style={styles.profileSection}>
                        <h3 style={styles.sectionHeading}>Profile Picture</h3>
                        <div style={styles.photoContainer}>
                            <img src={userData.photoURL || pic} alt="Profile" style={styles.profilePhoto} />
                            <label style={styles.photoEditButton}>
                                Edit
                                <input type="file" onChange={handlePhotoChange} style={{ display: 'none' }} />
                            </label>
                        </div>
                    </div>

                    {/* Personal Information Section */}
                    <div style={styles.profileSection}>
                        <h3 style={styles.sectionHeading}>Personal Information</h3>
                        <form onSubmit={handleUpdateProfile}>
                            <div style={styles.inputGroup}>
                                <label htmlFor="email" style={styles.label}>Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={userData.email}
                                    style={styles.readOnlyField}
                                    disabled
                                />
                            </div>
                            <div style={styles.nameFields}>
                                <div style={styles.inputGroup}>
                                    <label htmlFor="firstName" style={styles.label}>First Name</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        value={userData.firstName}
                                        onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                                        style={styles.inputField}
                                        required
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label htmlFor="lastName" style={styles.label}>Last Name</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        value={userData.lastName}
                                        onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                                        style={styles.inputField}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Editable Address Field */}
                            <div style={styles.inputGroup}>
                                <label htmlFor="address" style={styles.label}>Address</label>
                                <input
                                    type="text"
                                    id="address"
                                    value={userData.address}
                                    onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                                    style={styles.inputField}
                                />
                            </div>

                            <button type="submit" style={styles.saveButton}>Save Changes</button>
                        </form>
                    </div>

                    {/* Password Change Section */}
                    <div style={styles.profileSection}>
                        <h3 style={styles.sectionHeading}>Change Password</h3>
                        {!isPasswordChangeVisible ? (
                            <button onClick={() => setIsPasswordChangeVisible(true)} style={styles.changePasswordButton}>
                                Change Password
                            </button>
                        ) : (
                            <form onSubmit={handleChangePassword}>
                                <div style={styles.inputGroup}>
                                    <label htmlFor="newPassword" style={styles.label}>New Password</label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        style={styles.inputField}
                                        placeholder="Enter new password (min 6 characters)"
                                        required
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label htmlFor="confirmNewPassword" style={styles.label}>Confirm New Password</label>
                                    <input
                                        type="password"
                                        id="confirmNewPassword"
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        style={styles.inputField}
                                        placeholder="Confirm new password"
                                        required
                                    />
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
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default PatientProfilePage;