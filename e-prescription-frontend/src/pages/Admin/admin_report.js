// Used AI support for code enhancement

import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'; 
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable'; 
import logo from '../Main_Interface_UI/images/Logo01.png';
import { FaPhoneAlt } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import {FaHome, FaChartBar, FaFilePdf, FaNotesMedical, FaUser, FaQuestionCircle } from 'react-icons/fa'; 
import pic from '../Main_Interface_UI/images/Doctor.png'; 
import Footer from '../Main_Interface_UI/Footer';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

const AdminReportDashboard = () => {
    const auth = getAuth();
    const navigate = useNavigate();

    const [adminData, setAdminData] = useState({
        firstName: 'Loading...',
        lastName: '',
        email: '',
        userType: '',
        photoURL: null, 
    });
    const [loadingAdminData, setLoadingAdminData] = useState(true); 

    const [userTypeData, setUserTypeData] = useState([]);
    const [allUsersData, setAllUsersData] = useState([]); 
    const [prescriptionVolumeData, setPrescriptionVolumeData] = useState([]);
    const [detailedPrescriptions, setDetailedPrescriptions] = useState([]); 
    
    const [loadingReports, setLoadingReports] = useState(true);
    const [reportError, setReportError] = useState(null);

    
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

    // Fetch current admin user data and verify role
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
                        } else {
                            setReportError("You don't have administrative privileges to access this page.");
                            navigate('/'); 
                        }
                    } else {
                        console.log("No user document found for the logged-in UID.");
                        setReportError("User profile not found. Please log in again.");
                        navigate('/signin'); 
                    }
                } catch (err) {
                    console.error("Error fetching admin data:", err);
                    setReportError("Failed to verify admin status: " + err.message);
                    navigate('/signin'); 
                }
            } else {
                setReportError("You must be logged in to view this page.");
                navigate('/signin'); 
            }
            setLoadingAdminData(false); 
        });

        return () => unsubscribe();
    }, [auth, navigate]);

    
    const fetchUserTypeCounts = async () => {
        try {
            const usersCollection = collection(db, 'users');
            const querySnapshot = await getDocs(usersCollection);
            const counts = { patient: 0, doctor: 0, pharmacist: 0, admin: 0 };
            const allUsers = []; 

            querySnapshot.forEach(doc => {
                const data = doc.data();
                allUsers.push({ id: doc.id, ...data }); 

                if (counts.hasOwnProperty(data.userType)) {
                    counts[data.userType]++;
                }
            });
            setUserTypeData(Object.keys(counts).map(type => ({
                name: type.charAt(0).toUpperCase() + type.slice(1),
                value: counts[type]
            })));
            setAllUsersData(allUsers); 
        } catch (err) {
            console.error("Error fetching user type counts:", err);
            setReportError("Failed to load user statistics.");
        }
    };

    
    const fetchMonthlyPrescriptionVolume = async () => {
        try {
            const prescriptionsCollection = collection(db, 'prescriptions');
            const querySnapshot = await getDocs(prescriptionsCollection);

            console.log("Prescriptions Query Snapshot for Volume:", querySnapshot.docs.length, "documents found."); 
            if (querySnapshot.docs.length === 0) {
                console.log("No prescription documents found for volume report in Firestore.");
            }

            const monthlyData = {};

            querySnapshot.forEach(doc => {
                const data = doc.data();
                if (data.prescriptionDate && data.prescriptionDate.toDate) { 
                    const date = data.prescriptionDate.toDate(); 
                    const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                    monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
                } else {
                    console.warn("Prescription document missing 'prescriptionDate' or it's not a valid timestamp for volume report:", doc.id, data); 
                }
            });

            const sortedData = Object.entries(monthlyData)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([monthYear, count]) => ({
                    month: monthYear,
                    Prescriptions: count
                }));

            console.log("Final Prescription Volume Data for Chart:", sortedData);
            setPrescriptionVolumeData(sortedData);

        } catch (err) {
            console.error("Error fetching monthly prescription volume:", err);
            setReportError("Failed to load prescription volume data. Please check console for details and verify Firestore setup.");
        }
    };

    // FUNCTION: Fetch detailed prescription data - UPDATED TO USE patientName directly
    const fetchDetailedPrescriptionReport = async () => {
        setDetailedPrescriptions([]); 
        try {
            const prescriptionsCollection = collection(db, 'prescriptions');
            const prescriptionSnapshot = await getDocs(prescriptionsCollection);

            const prescriptionsRaw = [];
            const doctorIds = new Set(); // Only collect doctor IDs now

            prescriptionSnapshot.forEach(doc => {
                const data = doc.data();
                prescriptionsRaw.push({ id: doc.id, ...data });

                if (data.doctorId) doctorIds.add(data.doctorId); 
            });

            if (prescriptionsRaw.length === 0) {
                console.log("No detailed prescription documents found.");
                return; 
            }
            const doctorDetails = {}; // Renamed from userDetails
            if (doctorIds.size > 0) {
                const doctorPromises = Array.from(doctorIds).map(async (uid) => {
                    const userDoc = await getDoc(doc(db, 'users', uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        doctorDetails[uid] = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown Doctor';
                    } else {
                        
                        doctorDetails[uid] = 'Doctor Not Found';
                    }
                });
                await Promise.all(doctorPromises);
            }

            const processedPrescriptions = prescriptionsRaw.map(p => {
                const prescriptionDate = p.prescriptionDate ? p.prescriptionDate.toDate().toLocaleDateString() : 'N/A';
                const doctorName = doctorDetails[p.doctorId] || 'Unknown Doctor'; // Use doctorDetails
                const patientName = p.patientName || 'N/A'; 
                const status = p.status || 'N/A'; 

                return {
                    id: p.id,
                    prescriptionDate,
                    doctorName,
                    patientName, 
                    status, 
                };
            });

            setDetailedPrescriptions(processedPrescriptions);
            console.log("Detailed Prescriptions State:", processedPrescriptions); 
        } catch (err) {
            console.error("Error fetching detailed prescription report:", err);
            setReportError("Failed to load detailed prescription report.");
        }
    };


    // Main useEffect for loading reports
    useEffect(() => {
        if (!loadingAdminData && !reportError) {
            const loadReports = async () => {
                setLoadingReports(true);
                await Promise.allSettled([
                    fetchUserTypeCounts(), 
                    fetchMonthlyPrescriptionVolume(),
                    fetchDetailedPrescriptionReport() 
                ]).then(results => {
                    console.log("Report loading results:", results);
                });
                setLoadingReports(false);
            };
            loadReports();
        }
    }, [loadingAdminData, reportError]);

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

    // Function to export ALL users to PDF
    const exportUsersToPdf = () => {
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text("Registered User Details Report", 14, 20);
        doc.setFontSize(10);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 28);
        doc.text(`Generated by: ${adminData.firstName} ${adminData.lastName} (${adminData.email})`, 14, 34);

        const tableColumn = ["User ID", "First Name", "Last Name", "Email", "User Type", "Registered On"];
        const tableRows = allUsersData.map(user => [
            user.id,
            user.firstName || 'N/A',
            user.lastName || 'N/A',
            user.email || 'N/A',
            user.userType || 'N/A',
            user.createdAt ? user.createdAt.toDate().toLocaleDateString() : 'N/A',
        ]);

        autoTable(doc, { 
            head: [tableColumn],
            body: tableRows,
            startY: 45, 
            styles: {
                fontSize: 8,
                cellPadding: 3,
                valign: 'middle',
                overflow: 'linebreak'
            },
            headStyles: {
                fillColor: '#b3e0ff', 
                textColor: '#2980b9',
                fontStyle: 'bold'
            },
            bodyStyles: {
                textColor: '#333'
            },
            alternateRowStyles: {
                fillColor: '#f9f9f9' 
            },
            margin: { top: 10, left: 14, right: 14, bottom: 10 },
            didDrawPage: function (data) {
                let str = "Page " + doc.internal.getNumberOfPages();
                doc.setFontSize(8);
                doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
            }
        });

        doc.save('Registered_User_Details_Report.pdf');
    };

    // NEW FUNCTION: Export Detailed Prescriptions to PDF 
    const exportDetailedPrescriptionsToPdf = () => {
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text("Detailed Prescription Report", 14, 20);
        doc.setFontSize(10);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 28);
        doc.text(`Generated by: ${adminData.firstName} ${adminData.lastName} (${adminData.email})`, 14, 34);

        const tableColumn = ["Prescription ID", "Prescription Date", "Doctor Name", "Patient Name", "Status"];
        const tableRows = detailedPrescriptions.map(p => [
            p.id,
            p.prescriptionDate,
            p.doctorName,
            p.patientName,
            p.status 
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            styles: {
                fontSize: 8,
                cellPadding: 3,
                valign: 'middle',
                overflow: 'linebreak'
            },
            headStyles: {
                fillColor: '#cce5ff', 
                textColor: '#0056b3',
                fontStyle: 'bold'
            },
            bodyStyles: {
                textColor: '#333'
            },
            alternateRowStyles: {
                fillColor: '#f9f9f9'
            },
            margin: { top: 10, left: 14, right: 14, bottom: 10 },
            didDrawPage: function (data) {
                let str = "Page " + doc.internal.getNumberOfPages();
                doc.setFontSize(8);
                doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
            }
        });

        doc.save('Detailed_Prescription_Report.pdf');
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
        chartContainer: {
            marginBottom: '40px',
            background: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        },
        chartTitle: {
            fontSize: getResponsiveStyle('1.5em', '1.4em', '1.3em', '1.2em'),
            marginBottom: '15px',
            color: '#333',
        },
        exportButton: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            marginTop: '20px', 
            marginBottom: '20px',
            transition: 'background-color 0.3s ease',
            '&:hover': {
                backgroundColor: '#0056b3',
            }
        },
        exportButtonIcon: {
            marginRight: '8px',
        },
        tableContainer: {
            marginBottom: '40px',
            background: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            overflowX: 'auto', 
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '15px',
        },
        th: {
            backgroundColor: '#f2f2f2',
            padding: '10px',
            textAlign: 'left',
            borderBottom: '1px solid #ddd',
            fontSize: '0.9em',
            fontWeight: 'bold',
        },
        td: {
            padding: '10px',
            borderBottom: '1px solid #eee',
            fontSize: '0.85em',
        },

        footer: {
            backgroundColor: '#d7f3d2',
            padding: getResponsiveStyle('20px', '15px', '15px', '10px'),
            marginTop: 'auto',
            width: '100%',
        },
        footerContainer: {
            display: 'flex',
            justifyContent: getResponsiveStyle('space-around', 'space-around', 'space-between', 'center'),
            flexWrap: 'wrap',
            paddingBottom: getResponsiveStyle('20px', '15px', '10px', '10px'),
            gap: getResponsiveStyle('0', '0', '15px', '10px'),
            textAlign: getResponsiveStyle('left', 'left', 'left', 'center'),
        },
        footerSection: {
            display: 'flex',
            flexDirection: 'column',
            flex: '1',
            minWidth: getResponsiveStyle('200px', '180px', '150px', '120px'),
            margin: getResponsiveStyle('0', '0', '0', '10px'),
            alignItems: getResponsiveStyle('flex-start', 'flex-start', 'flex-start', 'center'),
        },
        footerHeading: {
            fontSize: getResponsiveStyle('1.2em', '1.1em', '1.05em', '1em'),
            marginBottom: getResponsiveStyle('10px', '8px', '7px', '5px'),
            color: '#333',
        },
        list: {
            listStyle: 'none',
            padding: 0,
            margin: 0,
        },
        listItem: {
            marginBottom: getResponsiveStyle('10px', '8px', '7px', '5px'),
            color: '#555',
            fontSize: getResponsiveStyle('0.9em', '0.85em', '0.8em', '0.75em'),
        },
        followUs: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },
        socialIcon: {
            display: 'flex',
            marginTop: '10px',
        },
        iconLink: {
            marginRight: '10px',
            textDecoration: 'none',
            color: '#333',
            fontSize: '1.5em',
            transition: 'color 0.2s',
        },
        bottomBar: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: getResponsiveStyle('10px', '8px', '7px', '5px'),
            borderTop: '1px solid #ccc',
            flexWrap: 'wrap',
            flexDirection: getResponsiveStyle('row', 'row', 'row', 'column'),
            gap: getResponsiveStyle('0', '0', '0', '5px'),
        },
        copyright: {
            fontSize: getResponsiveStyle('0.8em', '0.75em', '0.7em', '0.65em'),
            color: '#777',
            textAlign: getResponsiveStyle('left', 'left', 'left', 'center'),
        },
        links: {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: getResponsiveStyle('flex-end', 'flex-end', 'flex-end', 'center'),
            gap: getResponsiveStyle('0', '0', '5px', '5px'),
        },
        bottomLink: {
            color: '#555',
            textDecoration: 'none',
            fontSize: getResponsiveStyle('0.8em', '0.75em', '0.7em', '0.65em'),
            marginRight: getResponsiveStyle('10px', '8px', '7px', '5px'),
        },
        separator: {
            color: '#ccc',
            marginRight: getResponsiveStyle('10px', '8px', '7px', '5px'),
        },
    };

    if (loadingAdminData || loadingReports) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading Admin Report Dashboard...</div>;
    }

    if (reportError) {
        return <div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>Error: {reportError}</div>;
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
                {/* Sidebar */}
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
                    <Link to="/admin/dashboard" style={{ ...styles.sidebarLink}}><FaHome style={styles.sidebarIcon} />Dashboard</Link>
                    <Link to="/user-inquiry" style={{ ...styles.sidebarLink}}><FaQuestionCircle style={styles.sidebarIcon} />User Inquiries</Link>
                    <Link to="#" style={{...styles.sidebarLink, ...styles.sidebarLinkActive}}><FaChartBar style={styles.sidebarIcon} />Reports</Link> {/* Added Reports link */}
                    <Link to="/admin-profile" style={{ ...styles.sidebarLink}}><FaUser style={styles.sidebarIcon} />Profile</Link>
                </aside>

                {/* Main Content Area (Reports) */}
                <main style={styles.content}>
                    <h2 style={styles.sectionTitle}>Admin Report Dashboard</h2>

                    {/* PDF Export Button for All Users */}
                    <button
                        onClick={exportUsersToPdf}
                        style={styles.exportButton}
                        disabled={allUsersData.length === 0} 
                    >
                        <FaFilePdf style={styles.exportButtonIcon} />
                        Export All Users to PDF
                    </button>

                    {/* PDF Export Button for Detailed Prescriptions */}
                    <button
                        onClick={exportDetailedPrescriptionsToPdf} 
                        style={{ ...styles.exportButton, backgroundColor: '#28a745' }} 
                        disabled={detailedPrescriptions.length === 0} 
                    >
                        <FaNotesMedical style={styles.exportButtonIcon} />
                        Export Prescription Details to PDF
                    </button>

                    {/* User Type Distribution Report */}
                    <div style={styles.chartContainer}>
                        <h3 style={styles.chartTitle}>User Type Distribution</h3>
                        {userTypeData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={userTypeData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <p>No user data available to generate this report.</p>}
                    </div>

                    {/* Monthly Prescription Volume Report */}
                    <div style={styles.chartContainer}>
                        <h3 style={styles.chartTitle}>Monthly Prescription Volume</h3>
                        {prescriptionVolumeData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={prescriptionVolumeData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Prescriptions" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <p>No prescription data available to generate this report.</p>}
                    </div>

                    {/* Detailed Prescription Report Table */}
                    <div style={styles.tableContainer}>
                        <h3 style={styles.chartTitle}>Detailed Prescription Report</h3>
                        {detailedPrescriptions.length > 0 ? (
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Prescription ID</th>
                                        <th style={styles.th}>Prescription Date</th>
                                        <th style={styles.th}>Doctor Name</th>
                                        <th style={styles.th}>Patient Name</th>
                                        <th style={styles.th}>Status</th> 
                                    </tr>
                                </thead>
                                <tbody>
                                    {detailedPrescriptions.map((prescription) => (
                                        <tr key={prescription.id}>
                                            <td style={styles.td}>{prescription.id}</td>
                                            <td style={styles.td}>{prescription.prescriptionDate}</td>
                                            <td style={styles.td}>{prescription.doctorName}</td>
                                            <td style={styles.td}>{prescription.patientName}</td> {/* Directly display patientName */}
                                            <td style={styles.td}>{prescription.status}</td> 
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No detailed prescription data available to generate this report.</p>
                        )}
                    </div>

                </main>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default AdminReportDashboard;