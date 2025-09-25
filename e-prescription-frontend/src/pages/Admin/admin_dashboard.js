
// Used chatgpt and gemini ai used for enhance the code. 


import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; 
import { collection, getDocs, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions'; 
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'; 
import { Link, useNavigate } from 'react-router-dom'; 

// --- Imports from DoctorDashboard for UI elements ---
import logo from '../Main_Interface_UI/images/Logo01.png';
import { FaPhoneAlt } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import {FaHome, FaChartBar, FaQuestionCircle, FaUser } from 'react-icons/fa'; 
import pic from '../Main_Interface_UI/images/Doctor.png'; 
import Footer from '../Main_Interface_UI/Footer';

const AdminDashboard = () => {
    const auth = getAuth();
    const navigate = useNavigate();

    const [adminData, setAdminData] = useState({
        firstName: 'Loading...',
        lastName: '',
        email: '',
        userType: '',
        photoURL: null, // For avatar display
    });
    const [loadingUser, setLoadingUser] = useState(true); 
    const [users, setUsers] = useState([]); 
    const [loadingUsersList, setLoadingUsersList] = useState(true); 
    const [error, setError] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    const functions = getFunctions();
    const deleteUserFunction = httpsCallable(functions, 'deleteUserAccount'); 

    // Header and Logout Button Hover State
    const [isLogoutHovered, setIsLogoutHovered] = useState(false);

    
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    
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
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const docRef = doc(db, 'users', currentUser.uid);
                try {
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.userType === 'admin') {
                            setAdminData({
                                firstName: data.firstName || 'Admin',
                                lastName: data.lastName || 'User',
                                email: currentUser.email || '',
                                userType: data.userType || 'Admin',
                                photoURL: data.photoURL || pic, 
                            });
                            fetchUsers(); 
                        } else {
                            setError("You don't have administrative privileges to access this page.");
                            setLoadingUsersList(false); 
                            navigate('/'); 
                        }
                    } else {
                        console.log("No user document found for the logged-in UID.");
                        setError("User profile not found. Please log in again.");
                        navigate('/signin'); 
                    }
                } catch (err) {
                    console.error("Error fetching admin data:", err);
                    setError("Failed to verify admin status: " + err.message);
                    navigate('/signin'); 
                }
            } else {
                setError("You must be logged in to view this page.");
                navigate('/signin'); 
            }
            setLoadingUser(false); 
        });

        return () => unsubscribe();
    }, [auth, navigate]);


    // Fetch all users details for management
    const fetchUsers = async () => {
        setLoadingUsersList(true);
        setError(null);
        try {
            const usersCollectionRef = collection(db, 'users');
            const querySnapshot = await getDocs(usersCollectionRef);
            const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersList);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Failed to fetch users: " + err.message);
        } finally {
            setLoadingUsersList(false);
        }
    };

    const handleDeleteUser = async (userId, userEmail) => {
        if (window.confirm(`Are you sure you want to delete user: ${userEmail}? This action is irreversible.`)) {
            try {
                const result = await deleteUserFunction({ uid: userId });
                console.log(result.data.message);
                alert(result.data.message);
                fetchUsers(); 
            } catch (err) {
                console.error("Error deleting user:", err.message);
                alert(`Failed to delete user: ${err.message}`);
            }
        }
    };

    const handleEditClick = (user) => {
        setEditingUser(user.id);
        setEditFormData(user); 
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEdit = async () => {
        try {
            const userDocRef = doc(db, 'users', editingUser);
            await updateDoc(userDocRef, editFormData);
            alert("User updated successfully!");
            setEditingUser(null); 
            setEditFormData({});
            fetchUsers(); 
        } catch (err) {
            console.error("Error updating user:", err);
            alert("Failed to update user: " + err.message);
        }
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setEditFormData({});
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/signin'); 
        } catch (error) {
            console.error("Error logging out:", error);
            alert("Failed to log out. Please try again.");
        }
    };

    const getInitials = (firstName, lastName) => {
        const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
        const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
        return `${firstInitial}${lastInitial}`;
    };

    const styles = {
        // --- Base Page & Container Styles ---
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
            flex: 1, // Allow main content to grow
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
        adminAvatar: {
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
        adminInfo: {
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
        adminName: {
            fontSize: getResponsiveStyle('1.1em', '1em', '0.95em', '0.9em'),
            color: '#333',
            margin: '0',
            marginTop: getResponsiveStyle('10px', '8px', '0', '0'),
            fontWeight: 'bold'
        },
        adminType: {
            fontSize: getResponsiveStyle('0.9em', '0.85em', '0.8em', '0.75em'),
            color: '#6c757d',
            margin: '5px 0 0 0'
        },

        content: {
            flexGrow: 1,
            padding: getResponsiveStyle('20px', '15px', '10px', '10px'),
            backgroundColor: '#fff',
            borderRadius: '5px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)',
        },
        sectionTitle: {
            fontSize: getResponsiveStyle('2em', '1.8em', '1.6em', '1.4em'),
            marginBottom: getResponsiveStyle('20px', '15px', '10px', '10px'),
            color: '#2c3e50',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '20px',
            fontSize: getResponsiveStyle('0.9em', '0.85em', '0.8em', '0.75em'),
        },
        th: {
            backgroundColor: '#e9ecef',
            padding: getResponsiveStyle('12px 15px', '10px 12px', '8px 10px', '7px 8px'),
            textAlign: 'left',
            borderBottom: '1px solid #ddd',
        },
        td: {
            padding: getResponsiveStyle('10px 15px', '8px 12px', '7px 10px', '6px 8px'),
            borderBottom: '1px solid #eee',
            verticalAlign: 'middle',
        },
        button: {
            padding: getResponsiveStyle('8px 12px', '7px 10px', '6px 9px', '5px 8px'),
            margin: '3px',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
            fontSize: getResponsiveStyle('0.9em', '0.85em', '0.8em', '0.75em'),
            transition: 'background-color 0.2s',
        },
        editButton: {
            backgroundColor: '#007bff',
            color: 'white',
            '&:hover': {
                backgroundColor: '#0056b3',
            },
        },
        deleteButton: {
            backgroundColor: '#dc3545',
            color: 'white',
            '&:hover': {
                backgroundColor: '#bd2130',
            },
        },
        saveButton: {
            backgroundColor: '#28a745',
            color: 'white',
            '&:hover': {
                backgroundColor: '#1e7e34',
            },
        },
        cancelButton: {
            backgroundColor: '#6c757d',
            color: 'white',
            '&:hover': {
                backgroundColor: '#545b62',
            },
        },
        inputField: {
            padding: getResponsiveStyle('8px', '7px', '6px', '5px'),
            borderRadius: '4px',
            border: '1px solid #ccc',
            width: 'calc(100% - 10px)', 
            boxSizing: 'border-box',
            fontSize: 'inherit',
        },
        selectField: {
            padding: getResponsiveStyle('8px', '7px', '6px', '5px'),
            borderRadius: '4px',
            border: '1px solid #ccc',
            width: '100%',
            boxSizing: 'border-box',
            fontSize: 'inherit',
        },
    };

    if (loadingUser || loadingUsersList) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading Admin Dashboard...</div>;
    }

    if (error) {
        return <div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>Error: {error}</div>;
    }

    return (
        <div style={styles.dashboardPage}>
            {/* Navigation Bar (Header) */}
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
                        onClick={handleLogout}
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
                        <Link to="#" style={{...styles.sidebarLink, ...styles.sidebarLinkActive}}><FaHome style={styles.sidebarIcon} />Dashboard</Link>
                        <Link to="/user-inquiry" style={{ ...styles.sidebarLink}}><FaQuestionCircle style={styles.sidebarIcon} />User Inquiries</Link>
                        <Link to="/admin-report" style={styles.sidebarLink}><FaChartBar style={styles.sidebarIcon} />Reports</Link> {/* Added Reports link */}
                        <Link to="/admin-profile" style={{ ...styles.sidebarLink}}><FaUser style={styles.sidebarIcon} />Profile</Link>
                    </aside>
                {/* Main Content Area (User Management Table) */}
                <main style={styles.content}>
                    <h2 style={styles.sectionTitle}>Admin Dashboard - User Management</h2>
                    {users.length === 0 ? (
                        <p>No users found.</p>
                    ) : (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Name</th>
                                    <th style={styles.th}>Email</th>
                                    <th style={styles.th}>User Type</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td style={styles.td}>
                                            {editingUser === user.id ? (
                                                <>
                                                    <input
                                                        type="text"
                                                        name="firstName"
                                                        value={editFormData.firstName || ''}
                                                        onChange={handleEditFormChange}
                                                        style={styles.inputField}
                                                    />
                                                    <input
                                                        type="text"
                                                        name="lastName"
                                                        value={editFormData.lastName || ''}
                                                        onChange={handleEditFormChange}
                                                        style={{ ...styles.inputField, marginLeft: '5px' }}
                                                    />
                                                </>
                                            ) : (
                                                `${user.firstName || ''} ${user.lastName || ''}`
                                            )}
                                        </td>
                                        <td style={styles.td}>
                                            {editingUser === user.id ? (
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={editFormData.email || ''}
                                                    onChange={handleEditFormChange}
                                                    style={styles.inputField}
                                                />
                                            ) : (
                                                user.email
                                            )}
                                        </td>
                                        <td style={styles.td}>
                                            {editingUser === user.id ? (
                                                <select
                                                    name="userType"
                                                    value={editFormData.userType || ''}
                                                    onChange={handleEditFormChange}
                                                    style={styles.selectField}
                                                >
                                                    <option value="patient">Patient</option>
                                                    <option value="doctor">Doctor</option>
                                                    <option value="pharmacist">Pharmacist</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            ) : (
                                                user.userType
                                            )}
                                        </td>
                                        <td style={styles.td}>
                                            {editingUser === user.id ? (
                                                <>
                                                    <button onClick={handleSaveEdit} style={{ ...styles.button, ...styles.saveButton }}>Save</button>
                                                    <button onClick={handleCancelEdit} style={{ ...styles.button, ...styles.cancelButton }}>Cancel</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleEditClick(user)} style={{ ...styles.button, ...styles.editButton }}>Edit</button>
                                                    <button onClick={() => handleDeleteUser(user.id, user.email)} style={{ ...styles.button, ...styles.deleteButton }}>Delete</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </main>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default AdminDashboard;