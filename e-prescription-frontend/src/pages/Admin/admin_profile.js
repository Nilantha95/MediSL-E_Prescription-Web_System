import React, { useState, useEffect } from 'react';
import logo from '../Main_Interface_UI/images/Logo01.png';
import pic from '../Main_Interface_UI/images/Doctor.png'; // Using this as a placeholder for a default profile pic
import { IoIosArrowForward } from 'react-icons/io';
import { FaPhoneAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { FaUserShield, FaUsers, FaCog, FaHome, FaUser, FaChartBar } from 'react-icons/fa'; // Admin-specific icons and FaChartBar
import { getAuth, onAuthStateChanged, updatePassword, updateProfile, signOut } from 'firebase/auth'; // Import signOut
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase'; // adjust path if needed
import Footer from '../Main_Interface_UI/Footer';

const AdminProfilePage = () => {
    const auth = getAuth();
    const navigate = useNavigate(); // Initialize navigate

    // State for user data and form inputs
    const [user, setUser] = useState(null);
    const [adminData, setAdminData] = useState({ // Renamed from userData to adminData
        firstName: '',
        lastName: '',
        email: '',
        userType: '',
        photoURL: null,
        // Removed address field
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
                        // IMPORTANT: Check userType for admin access
                        if (data.userType === 'admin') {
                            setAdminData({
                                firstName: data.firstName || '',
                                lastName: data.lastName || '',
                                email: currentUser.email,
                                userType: data.userType || '',
                                photoURL: currentUser.photoURL || pic,
                                // Removed address from here
                            });
                        } else {
                            // If not an admin, redirect them
                            alert("You do not have administrative privileges to view this page.");
                            navigate('/'); // Redirect to homepage or other appropriate page
                        }
                    } else {
                        console.log("No such document for user profile!");
                        // Handle case where user document doesn't exist
                        navigate('/signin'); // Redirect to sign-in
                    }
                } catch (error) {
                    console.error("Error fetching admin data:", error);
                    setStatusMessage('Error fetching admin data.');
                    navigate('/signin'); // Redirect on error
                }
            } else {
                setUser(null);
                // Removed address from initial state as well
                setAdminData({ firstName: '', lastName: '', email: '', userType: '', photoURL: null });
                navigate('/signin'); // Redirect if not logged in
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [auth, navigate]); // Added navigate to dependency array

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
                firstName: adminData.firstName,
                lastName: adminData.lastName,
                // Removed address field from update
            });
            setStatusMessage('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            setStatusMessage('Failed to update profile.');
        }
    };

    // Handle password change
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

    // Handle profile picture upload
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
            await updateDoc(docRef, { photoURL }); // Also update in Firestore user document

            setAdminData(prev => ({ ...prev, photoURL }));
            setStatusMessage('Profile picture updated successfully!');
        } catch (error) {
            console.error('Error uploading photo:', error);
            setStatusMessage('Failed to upload photo.');
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/signin'); // Redirect to sign-in page after logout
        } catch (error) {
            console.error("Error logging out:", error);
            alert("Failed to log out. Please try again.");
        }
    };

    // Utility to get initials for avatar
    const getInitials = (firstName, lastName) => {
        const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
        const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
        return `${firstInitial}${lastInitial}`;
    };

    // Consolidated Styles
    const styles = {
        dashboardPage: {
            fontFamily: 'Roboto, sans-serif',
            color: '#333',
            lineHeight: '1.6',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            backgroundColor: '#f4f7f6',
        },
        dashboardContainer: {
            display: 'flex',
            flex: 1,
            padding: getResponsiveStyle('20px', '15px', '10px', '10px'),
            gap: getResponsiveStyle('20px', '15px', '10px', '10px'),
            flexDirection: getResponsiveStyle('row', 'row', 'column', 'column'),
        },

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

        // Sidebar Styles (Adapted for Admin)
        sidebar: {
            width: getResponsiveStyle('250px', '220px', '100%', '100%'),
            backgroundColor: '#f8f9fa',
            padding: getResponsiveStyle('20px', '15px', '15px', '10px'),
            borderRadius: '5px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: getResponsiveStyle('column', 'column', 'row', 'row'),
            alignItems: getResponsiveStyle('center', 'center', 'flex-start', 'flex-start'),
            gap: getResponsiveStyle('0', '0', '10px', '5px'),
            flexShrink: 0,
            marginBottom: getResponsiveStyle('0', '0', '20px', '20px'),
        },
        sidebarItemsContainer: {
            display: 'flex',
            flexDirection: getResponsiveStyle('column', 'column', 'row', 'row'),
            width: getResponsiveStyle('100%', '100%', 'auto', 'auto'),
            flexWrap: 'wrap',
            justifyContent: getResponsiveStyle('flex-start', 'flex-start', 'center', 'center'),
            gap: getResponsiveStyle('0', '0', '5px', '5px'),
            marginTop: getResponsiveStyle('0', '0', '10px', '5px'),
        },
        sidebarLink: {
            display: 'flex',
            alignItems: 'center',
            padding: getResponsiveStyle('12px 15px', '10px 12px', '8px 10px', '6px 8px'),
            color: '#333',
            textDecoration: 'none',
            borderBottom: getResponsiveStyle('1px solid #eee', '1px solid #eee', 'none', 'none'),
            width: getResponsiveStyle('100%', '100%', 'auto', 'auto'),
            textAlign: 'left',
            transition: 'background-color 0.2s, color 0.2s',
            fontSize: getResponsiveStyle('15px', '14px', '13px', '12px'),
            fontWeight: '500',
            borderRadius: '5px',
            marginBottom: getResponsiveStyle('5px', '5px', '0', '0'),
            whiteSpace: 'nowrap',
        },
        sidebarLinkActive: {
            color: '#007bff',
            backgroundColor: '#e6f2ff',
            fontWeight: 'bold',
        },
        sidebarIcon: {
            marginRight: getResponsiveStyle('10px', '8px', '5px', '3px'),
            fontSize: getResponsiveStyle('1.2em', '1.1em', '1em', '0.9em'),
        },
        adminAvatar: { // Renamed from patientAvatar
            width: getResponsiveStyle('80px', '70px', '60px', '50px'),
            height: getResponsiveStyle('80px', '70px', '60px', '50px'),
            borderRadius: '50%',
            backgroundColor: '#00cba9',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: getResponsiveStyle('1.5em', '1.3em', '1.1em', '1em'),
            fontWeight: 'bold',
            marginBottom: getResponsiveStyle('5px', '5px', '0', '0'),
            marginTop: getResponsiveStyle('20px', '15px', '0', '0'),
            overflow: 'hidden',
        },
        adminName: { // Renamed from patientName
            fontSize: getResponsiveStyle('1.1em', '1em', '0.95em', '0.9em'),
            color: '#333',
            margin: '0',
            marginTop: getResponsiveStyle('10px', '8px', '0', '0'),
            fontWeight: 'bold'
        },
        adminType: { // Renamed from patientType
            fontSize: getResponsiveStyle('0.9em', '0.85em', '0.8em', '0.75em'),
            color: '#6c757d',
            margin: '5px 0 0 0'
        },
        adminInfo: { // Renamed from patientInfo
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: getResponsiveStyle('15px 0', '12px 0', '10px 0', '8px 0'),
            borderBottom: getResponsiveStyle('1px solid #eee', '1px solid #eee', 'none', 'none'),
            backgroundColor: '#d7f3d2',
            borderRadius: '5px',
            marginBottom: getResponsiveStyle('20px', '15px', '0', '0'),
            width: '100%',
            flexDirection: getResponsiveStyle('column', 'column', 'row', 'row'),
            gap: getResponsiveStyle('0', '0', '10px', '5px'),
            justifyContent: getResponsiveStyle('center', 'center', 'flex-start', 'flex-start'),
        },

        // Profile Page Specific Styles (using generic names)
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
        <div style={styles.dashboardPage}> {/* Changed to dashboardPage for consistent page styling */}
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
                    <button
                        onClick={handleLogout} // Use the handleLogout function
                        style={styles.logoutButton}
                        onMouseEnter={() => setIsLogoutHovered(true)}
                        onMouseLeave={() => setIsLogoutHovered(false)}
                    >
                        <span>Logout</span>
                        <IoIosArrowForward style={styles.registerArrow} />
                    </button>
                </div>
            </header>

            {/* Dashboard Content */}
            <div style={styles.dashboardContainer}>
                {/* Sidebar (Adapted for Admin) */}
                <aside style={styles.sidebar}>
                    <div style={styles.adminInfo}> {/* Changed to adminInfo */}
                        <div style={styles.adminAvatar}> {/* Changed to adminAvatar */}
                            {adminData.photoURL ? (
                                <img src={adminData.photoURL} alt="Admin Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <span>{getInitials(adminData.firstName, adminData.lastName)}</span>
                            )}
                        </div>
                        <p style={styles.adminName}>{`${adminData.firstName} ${adminData.lastName}`}</p> {/* Changed to adminName */}
                        <p style={styles.adminType}>{adminData.userType}</p> {/* Changed to adminType */}
                    </div>
                    {/* Admin-specific links */}
                    <Link to="/admin/dashboard" style={styles.sidebarLink}><FaHome style={styles.sidebarIcon} />Dashboard</Link>
                    <Link to="/admin-report" style={styles.sidebarLink}><FaChartBar style={styles.sidebarIcon} />Reports</Link> {/* Added Reports link */}
                    <Link to="#" style={{ ...styles.sidebarLink, ...styles.sidebarLinkActive }}><FaUser style={styles.sidebarIcon} />Profile</Link>
                </aside>

                {/* Profile Page Content */}
                <div style={styles.profileContainer}>
                    <h2 style={styles.h2}>Admin Profile</h2>
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
                            <img src={adminData.photoURL || pic} alt="Profile" style={styles.profilePhoto} />
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
                                    value={adminData.email}
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
                                        value={adminData.firstName}
                                        onChange={(e) => setAdminData({ ...adminData, firstName: e.target.value })}
                                        style={styles.inputField}
                                        required
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label htmlFor="lastName" style={styles.label}>Last Name</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        value={adminData.lastName}
                                        onChange={(e) => setAdminData({ ...adminData, lastName: e.target.value })}
                                        style={styles.inputField}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Removed Editable Address Field */}

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

export default AdminProfilePage;