import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoIosArrowForward } from 'react-icons/io';
import { FaPhoneAlt, FaHome, FaQuestionCircle, FaChartBar, FaUser, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import logo from '../Main_Interface_UI/images/Logo01.png';
import pic from '../Main_Interface_UI/images/Doctor.png'; // Make sure to import the default placeholder image
import Footer from '../Main_Interface_UI/Footer';

import { db } from '../../firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

const UserInquiryPage = () => {
    const auth = getAuth();
    const navigate = useNavigate();

    const [isLogoutHovered, setIsLogoutHovered] = useState(false);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    const [inquiries, setInquiries] = useState([]);
    const [loadingInquiries, setLoadingInquiries] = useState(true);
    const [loadingUser, setLoadingUser] = useState(true);
    const [error, setError] = useState(null);

    const [viewingInquiry, setViewingInquiry] = useState(null);
    const [replySubject, setReplySubject] = useState('');
    const [replyMessage, setReplyMessage] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    // State for user data
    const [adminData, setAdminData] = useState({
        firstName: '',
        lastName: '',
        userType: '',
        photoURL: null,
    });

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch user data from Firebase Auth and Firestore on component mount
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const docRef = doc(db, 'users', currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.userType === 'admin') {
                            setAdminData({
                                firstName: data.firstName || '',
                                lastName: data.lastName || '',
                                userType: data.userType || '',
                                photoURL: currentUser.photoURL || pic,
                            });
                        } else {
                            alert("You do not have administrative privileges to view this page.");
                            navigate('/');
                        }
                    } else {
                        console.log("No such document for user profile!");
                        navigate('/signin');
                    }
                } catch (error) {
                    console.error("Error fetching admin data:", error);
                    navigate('/signin');
                }
            } else {
                setAdminData({ firstName: '', lastName: '', userType: '', photoURL: null });
                navigate('/signin');
            }
            setLoadingUser(false);
        });

        return () => unsubscribe();
    }, [auth, navigate]);

    const fetchInquiries = async () => {
        setLoadingInquiries(true);
        setError(null);
        try {
            const q = query(collection(db, 'userInquiries'), orderBy('timestamp', 'desc'));
            const querySnapshot = await getDocs(q);
            const inquiriesList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp ? doc.data().timestamp.toDate().toLocaleString() : 'N/A'
            }));
            setInquiries(inquiriesList);
        } catch (err) {
            console.error('Error fetching inquiries:', err);
            setError('Failed to fetch inquiries. Please try again.');
        } finally {
            setLoadingInquiries(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
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

    const getInitials = (firstName, lastName) => {
        const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
        const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
        return `${firstInitial}${lastInitial}`;
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/signin'); // Redirect to sign-in page after logout
        } catch (error) {
            console.error("Error logging out:", error);
            alert("Failed to log out. Please try again.");
        }
    };

    const handleMarkAsRead = async (e, inquiryId) => {
        e.stopPropagation();
        try {
            const inquiryRef = doc(db, 'userInquiries', inquiryId);
            await updateDoc(inquiryRef, { status: 'read' });
            fetchInquiries();
            if (viewingInquiry && viewingInquiry.id === inquiryId) {
                setViewingInquiry(prev => ({ ...prev, status: 'read' }));
            }
        } catch (err) {
            console.error("Error marking as read:", err);
            alert("Failed to mark as read: " + err.message);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        setIsReplying(true);

        try {
            const functions = getFunctions();
            const sendInquiryReply = httpsCallable(functions, 'sendInquiryReply');
            await sendInquiryReply({
                to: viewingInquiry.email,
                subject: replySubject,
                message: replyMessage,
            });

            const inquiryRef = doc(db, 'userInquiries', viewingInquiry.id);
            await updateDoc(inquiryRef, { status: 'replied' });

            await fetchInquiries();
            setReplySubject('');
            setReplyMessage('');
            setViewingInquiry(null);

            alert('Reply sent and inquiry marked as replied!');
        } catch (err) {
            console.error('Failed to send reply:', err);
            alert('Failed to send reply. Please try again.');
        } finally {
            setIsReplying(false);
        }
    };

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
        inquiryCard: {
            backgroundColor: '#f9f9f9',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: getResponsiveStyle('20px', '18px', '15px', '12px'),
            marginBottom: '15px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
            cursor: 'pointer',
        },
        inquiryCardPending: {
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeeba',
        },
        inquiryHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
            paddingBottom: '10px',
            borderBottom: '1px solid #eee',
            flexWrap: 'wrap',
            gap: '5px',
        },
        inquirySender: {
            fontWeight: 'bold',
            color: '#34495e',
            fontSize: getResponsiveStyle('1.1em', '1.05em', '1em', '0.95em'),
        },
        inquiryDate: {
            fontSize: getResponsiveStyle('0.9em', '0.85em', '0.8em', '0.75em'),
            color: '#7f8c8d',
        },
        inquirySubject: {
            fontWeight: '600',
            color: '#2c3e50',
            marginBottom: '8px',
            fontSize: getResponsiveStyle('1em', '0.95em', '0.9em', '0.85em'),
        },
        inquiryMessage: {
            color: '#555',
            lineHeight: '1.6',
            marginBottom: '15px',
            fontSize: getResponsiveStyle('0.95em', '0.9em', '0.85em', '0.8em'),
        },
        statusBadge: {
            padding: '5px 10px',
            borderRadius: '15px',
            fontSize: '0.8em',
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            marginLeft: '10px',
        },
        statusPending: {
            backgroundColor: '#ffc107',
            color: '#fff',
        },
        statusRead: {
            backgroundColor: '#007bff',
            color: '#fff',
        },
        statusReplied: {
            backgroundColor: '#28a745',
            color: '#fff',
        },
        actionButton: {
            padding: getResponsiveStyle('8px 15px', '7px 12px', '6px 10px', '5px 8px'),
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: getResponsiveStyle('0.9em', '0.85em', '0.8em', '0.75em'),
            fontWeight: 'bold',
            transition: 'background-color 0.3s ease',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            marginTop: '10px',
            marginRight: '10px',
            '&:hover': {
                backgroundColor: '#0056b3',
            },
            '&:disabled': {
                backgroundColor: '#cccccc',
                cursor: 'not-allowed',
            }
        },
        viewDetailsContainer: {
            marginTop: '20px',
            padding: getResponsiveStyle('20px', '15px', '12px', '10px'),
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f0f2f5',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
        },
        viewDetailsTitle: {
            fontSize: getResponsiveStyle('1.3em', '1.2em', '1.1em', '1em'),
            marginBottom: '15px',
            color: '#34495e',
        },
        detailItem: {
            marginBottom: '10px',
        },
        detailLabel: {
            fontWeight: 'bold',
            marginRight: '5px',
        },
        replyFormContainer: {
            marginTop: '20px',
            padding: getResponsiveStyle('20px', '15px', '12px', '10px'),
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
        },
        replyInput: {
            width: '100%',
            padding: '8px',
            marginTop: '5px',
            marginBottom: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxSizing: 'border-box',
        },
        replyTextarea: {
            width: '100%',
            padding: '8px',
            marginTop: '5px',
            marginBottom: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxSizing: 'border-box',
        },
    };
    
    if (loadingUser || loadingInquiries) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
    }

    if (error) {
        return <div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>Error: {error}</div>;
    }

    return (
        <div style={styles.dashboardPage}>
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

            <div style={styles.dashboardContainer}>
                {/* Replaced Sidebar from admin_profile.js */}
                <aside style={styles.sidebar}>
                    <div style={styles.adminInfo}>
                        <div style={styles.adminAvatar}>
                            {adminData.photoURL ? (
                                <img src={adminData.photoURL} alt="Admin Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <span>{getInitials(adminData.firstName, adminData.lastName)}</span>
                            )}
                        </div>
                        <p style={styles.adminName}>{`${adminData.firstName} ${adminData.lastName}`}</p>
                        <p style={styles.adminType}>{adminData.userType}</p>
                    </div>
                    <div style={styles.sidebarItemsContainer}>
                        <Link to="/admin/dashboard" style={styles.sidebarLink}><FaHome style={styles.sidebarIcon} />Dashboard</Link>
                        <Link to="#" style={{ ...styles.sidebarLink, ...styles.sidebarLinkActive }}><FaQuestionCircle style={styles.sidebarIcon} />User Inquiries</Link>
                        <Link to="/admin-report" style={styles.sidebarLink}><FaChartBar style={styles.sidebarIcon} />Reports</Link>
                        <Link to="/admin/profile" style={styles.sidebarLink}><FaUser style={styles.sidebarIcon} />Profile</Link>
                    </div>
                </aside>
                {/* End of Replaced Sidebar */}

                <main style={styles.content}>
                    <h2 style={styles.sectionTitle}>User Inquiries</h2>
                    {inquiries.length === 0 ? (
                        <p>No inquiries found.</p>
                    ) : (
                        <div>
                            {inquiries.map((inquiry) => (
                                <div
                                    key={inquiry.id}
                                    style={{
                                        ...styles.inquiryCard,
                                        ...(inquiry.status === 'pending' ? styles.inquiryCardPending : {}),
                                    }}
                                    onClick={() => setViewingInquiry(inquiry)}
                                >
                                    <div style={styles.inquiryHeader}>
                                        <span style={styles.inquirySender}>
                                            {inquiry.name}
                                            {inquiry.status === 'pending' && <span style={{ ...styles.statusBadge, ...styles.statusPending }}>Pending</span>}
                                            {inquiry.status === 'read' && <span style={{ ...styles.statusBadge, ...styles.statusRead }}>Read</span>}
                                            {inquiry.status === 'replied' && <span style={{ ...styles.statusBadge, ...styles.statusReplied }}>Replied <FaCheckCircle /></span>}
                                        </span>
                                        <span style={styles.inquiryDate}>{inquiry.timestamp}</span>
                                    </div>
                                    <p style={styles.inquirySubject}>Subject: {inquiry.subject || 'N/A'}</p>
                                    
                                    {viewingInquiry && viewingInquiry.id === inquiry.id && (
                                        <div style={styles.viewDetailsContainer}>
                                            <h3 style={styles.viewDetailsTitle}>Inquiry Details</h3>
                                            <p style={styles.detailItem}>
                                                <span style={styles.detailLabel}>From:</span> {inquiry.email}
                                            </p>
                                            <p style={styles.detailItem}>
                                                <span style={styles.detailLabel}>Message:</span>
                                            </p>
                                            <p style={styles.inquiryMessage}>{inquiry.message}</p>
                                            <div style={{ marginTop: '10px' }}>
                                                <button
                                                    style={{ ...styles.actionButton, backgroundColor: '#6c757d' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setViewingInquiry(null);
                                                    }}
                                                >
                                                    Close <FaTimesCircle />
                                                </button>
                                                {inquiry.status === 'pending' && (
                                                    <button
                                                        style={{ ...styles.actionButton, backgroundColor: '#17a2b8' }}
                                                        onClick={(e) => handleMarkAsRead(e, inquiry.id)}
                                                    >
                                                        Mark as Read <FaCheckCircle />
                                                    </button>
                                                )}
                                            </div>
                                            {inquiry.status !== 'replied' && (
                                                <div style={styles.replyFormContainer}>
                                                    <h3 style={styles.viewDetailsTitle}>Send a Reply</h3>
                                                    <form onSubmit={handleSendReply}>
                                                        <div style={styles.detailItem}>
                                                            <span style={styles.detailLabel}>To:</span>
                                                            <input type="email" value={inquiry.email} readOnly style={styles.replyInput} />
                                                        </div>
                                                        <div style={styles.detailItem}>
                                                            <span style={styles.detailLabel}>Subject:</span>
                                                            <input type="text" value={replySubject} onChange={(e) => setReplySubject(e.target.value)} style={styles.replyInput} required />
                                                        </div>
                                                        <div style={styles.detailItem}>
                                                            <span style={styles.detailLabel}>Message:</span>
                                                            <textarea value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} style={styles.replyTextarea} rows="5" required />
                                                        </div>
                                                        <button type="submit" style={styles.actionButton} disabled={isReplying}>
                                                            {isReplying ? 'Sending...' : 'Send Reply'}
                                                        </button>
                                                    </form>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default UserInquiryPage;