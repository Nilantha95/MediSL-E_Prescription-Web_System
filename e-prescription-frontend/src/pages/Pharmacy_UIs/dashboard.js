import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// **MODIFIED: Added faClock for the new card's icon**
import { faQrcode, faCog, faHistory, faHome, faCheckCircle, faHourglassHalf, faBan, faClock } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { FaPhoneAlt } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import logo from '../Main_Interface_UI/images/Logo01.png';
import pic from './Images/phar01.jpg';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import Footer from '../Main_Interface_UI/Footer';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function PharmacyDashboard() {
    const navigate = useNavigate();
    const auth = getAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pharmacistData, setPharmacistData] = useState({
        name: 'Loading...',
        photoURL: pic,
    });

    // **MODIFIED: State now includes a counter for the last 24 hours**
    const [dashboardStats, setDashboardStats] = useState({
        fullyIssued: 0,
        partiallyIssued: 0,
        rejected: 0,
        handledLast24Hours: 0, // New stat
    });

    const [isLogoutHovered, setIsLogoutHovered] = useState(false);

    // Effect to get pharmacist's data
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        if (userData.userType === 'pharmacist') {
                            setPharmacistData({
                                name: `${userData.firstName} ${userData.lastName}`,
                                photoURL: userData.photoURL || pic,
                            });
                        } else {
                            setError("You are not authorized to view this page.");
                        }
                    } else {
                        setError("Pharmacist profile not found.");
                    }
                } catch (err) {
                    setError("Failed to load user profile.");
                }
            } else {
                navigate('/signin');
            }
        });
        return () => unsubscribe();
    }, [auth, navigate]);

    // **MODIFIED: This effect now calculates all four stats**
    useEffect(() => {
        if (!pharmacistData.name || pharmacistData.name === 'Loading...') {
            setLoading(false);
            return;
        }

        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const q = query(collection(db, 'prescriptions'));
                const querySnapshot = await getDocs(q);
                const allDocs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const pharmacistHistory = allDocs.filter(p =>
                    (Array.isArray(p.issueHistory) && p.issueHistory.some(entry => entry.issuedBy === pharmacistData.name)) ||
                    (p.rejectedBy === pharmacistData.name)
                );

                let fullyIssuedCount = 0;
                let partiallyIssuedCount = 0;
                let rejectedCount = 0;
                let handledLast24HoursCount = 0;
                
                // Get the date for 24 hours ago
                const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

                pharmacistHistory.forEach(p => {
                    // Count statuses for all-time totals
                    switch (p.status) {
                        case 'Issued':
                            fullyIssuedCount++;
                            break;
                        case 'partially_issued':
                            partiallyIssuedCount++;
                            break;
                        case 'Rejected':
                            rejectedCount++;
                            break;
                        default:
                            break;
                    }

                    // Find the most recent interaction date to check against the last 24 hours
                    const lastIssueDate = p.issueHistory?.slice(-1)[0]?.issuedAt?.toDate();
                    const rejectionDate = p.rejectedAt?.toDate();
                    const lastInteractionDate = lastIssueDate > rejectionDate ? lastIssueDate : rejectionDate;

                    if (lastInteractionDate && lastInteractionDate > twentyFourHoursAgo) {
                        handledLast24HoursCount++;
                    }
                });

                setDashboardStats({
                    fullyIssued: fullyIssuedCount,
                    partiallyIssued: partiallyIssuedCount,
                    rejected: rejectedCount,
                    handledLast24Hours: handledLast24HoursCount,
                });

            } catch (err) {
                console.error("Error fetching prescriptions:", err);
                setError("Failed to load statistics. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [pharmacistData.name]);

    const handleScanClick = () => navigate('/pharmacy/qr-scan');
    const handleLogout = async () => {
        await signOut(auth);
        navigate('/signin');
    };
    const getInitials = (name) => {
        if (!name || name === 'Loading...') return '';
        const nameParts = name.split(' ');
        return `${nameParts[0]?.[0] || ''}${nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] || '' : ''}`.toUpperCase();
    };

    const styles = {
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', backgroundColor: '#e0ffe0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
        headerLeft: { display: 'flex', alignItems: 'center' },
        logo: { height: '55px', marginRight: '15px' },
        siteTitle: { margin: 0, fontSize: '24px', fontWeight: '700', color: '#2c3e50' },
        tagline: { margin: 0, fontSize: '13px', color: '#7f8c8d' },
        headerRight: { display: 'flex', alignItems: 'center', gap: '20px' },
        phoneContact: { display: 'flex', alignItems: 'center', color: '#2980b9', fontWeight: '500' },
        logoutButton: { padding: '12px 25px', border: isLogoutHovered ? '1px solid #9cd6fc' : '1px solid #a8dadc', borderRadius: '30px', backgroundColor: isLogoutHovered ? '#9cd6fc' : '#b3e0ff', color: isLogoutHovered ? '#fff' : '#2980b9', cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 'bold', transition: 'all 0.3s ease' },
        dashboardContainer: { display: 'flex', padding: '20px', fontFamily: 'sans-serif', gap: '20px' },
        sidebar: { width: '250px', flexShrink: 0, backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '5px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', alignSelf: 'flex-start' },
        mainContentStyle: { flexGrow: 1, backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
        userInfo: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee', backgroundColor: '#d7f3d2', borderRadius: '5px', marginBottom: '20px', width: '100%' },
        userAvatarContainer: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#00cba9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5em', fontWeight: 'bold', overflow: 'hidden' },
        userAvatar: { width: '100%', height: '100%', objectFit: 'cover' },
        userName: { fontSize: '1.1em', color: '#333', marginTop: '10px', fontWeight: 'bold' },
        userType: { fontSize: '0.9em', color: '#6c757d', margin: '5px 0 0 0' },
        sidebarLink: { display: 'flex', alignItems: 'center', padding: '12px 15px', color: '#333', textDecoration: 'none', width: '100%', transition: 'background-color 0.2s', fontSize: '15px', fontWeight: '500', borderRadius: '5px', marginBottom: '5px' },
        sidebarLinkActive: { color: '#007bff', backgroundColor: '#e6f2ff', fontWeight: 'bold' },
        sidebarIcon: { marginRight: '10px', fontSize: '1.2em' },
        dashboardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' },
        scanButton: { backgroundColor: '#007bff', color: 'white', padding: '12px 22px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '1em', gap: '10px', boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)', transition: 'all 0.3s ease', animation: 'blinkAnimation 1.5s infinite' },
        noData: { textAlign: 'center', color: '#888', padding: '40px' },
        statsContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' },
        statCard: { backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderLeft: '5px solid', transition: 'transform 0.2s, box-shadow 0.2s' },
        statCardIcon: { fontSize: '2.5em', padding: '15px', borderRadius: '50%', color: '#fff' },
        statCardInfo: { display: 'flex', flexDirection: 'column' },
        statCardValue: { fontSize: '2em', fontWeight: 'bold', color: '#333' },
        statCardLabel: { fontSize: '0.95em', color: '#6c757d' },
        chartContainer: { position: 'relative', marginTop: '30px', padding: '25px', backgroundColor: '#f8f9fa', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', minHeight: '450px' }
    };

    useEffect(() => {
        const styleSheet = document.styleSheets[0];
        const keyframes = ` @keyframes blinkAnimation { 0% { opacity: 1; } 50% { opacity: 0.5; transform: scale(1.02); } 100% { opacity: 1; } }`;
        try {
            let ruleExists = false;
            for (let i = 0; i < styleSheet.cssRules.length; i++) {
                if (styleSheet.cssRules[i].name === 'blinkAnimation') ruleExists = true;
            }
            if (!ruleExists) styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
        } catch (e) { console.warn("Could not manage keyframe rule:", e); }
    }, []);

    const chartData = {
        labels: ['Fully Issued', 'Partially Issued', 'Rejected'],
        datasets: [{
            label: 'Prescriptions',
            data: [dashboardStats.fullyIssued, dashboardStats.partiallyIssued, dashboardStats.rejected],
            backgroundColor: (context) => {
                const { ctx, chartArea, dataIndex } = context.chart;
                if (!chartArea) return null;
                const colors = [
                    { main: '40, 167, 69',  light: '111, 214, 131' },
                    { main: '255, 193, 7',  light: '255, 223, 130' },
                    { main: '220, 53, 69', light: '235, 137, 149' }
                ];
                const color = colors[dataIndex];
                if (!color) return 'rgba(200, 200, 200, 0.5)';
                const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                gradient.addColorStop(0, `rgba(${color.main}, 0.5)`);
                gradient.addColorStop(1, `rgba(${color.light}, 0.8)`);
                return gradient;
            },
            borderColor: ['#28a745', '#ffc107', '#dc3545'],
            borderWidth: 2,
            borderRadius: 8,
            barPercentage: 0.6,
        }],
    };
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: 'All-Time Prescription Status',
                padding: { bottom: 20 },
                font: { size: 22, family: 'sans-serif', weight: 'bold' },
                color: '#2c3e50',
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 12 },
                padding: 10,
                cornerRadius: 5,
            }
        },
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' }, ticks: { padding: 10, font: { size: 12 }, color: '#6c757d' } },
            x: { grid: { display: false }, ticks: { padding: 10, font: { size: 14, weight: '500' }, color: '#495057' } }
        },
        animation: { duration: 1200, easing: 'easeOutQuint' },
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <img src={logo} alt="MediPrescribe Logo" style={styles.logo} />
                    <div>
                        <h1 style={styles.siteTitle}>MediPrescribe</h1>
                        <p style={styles.tagline}>Your Digital Healthcare Solution</p>
                    </div>
                </div>
                <div style={styles.headerRight}>
                    <div style={styles.phoneContact}><FaPhoneAlt style={{ marginRight: '8px' }} /><span>+94 (011) 519-51919</span></div>
                    <div style={styles.logoutButton} onMouseEnter={() => setIsLogoutHovered(true)} onMouseLeave={() => setIsLogoutHovered(false)} onClick={handleLogout}>
                        <span>Logout</span><IoIosArrowForward style={{ marginLeft: '5px' }} />
                    </div>
                </div>
            </header>

            <div style={styles.dashboardContainer}>
                <aside style={styles.sidebar}>
                    <div style={styles.userInfo}>
                        <div style={styles.userAvatarContainer}>
                            {pharmacistData.photoURL && pharmacistData.photoURL !== pic ? (
                                <img src={pharmacistData.photoURL} alt="Pharmacist" style={styles.userAvatar} />
                            ) : (
                                <span>{getInitials(pharmacistData.name)}</span>
                            )}
                        </div>
                        <p style={styles.userName}>{pharmacistData.name}</p>
                        <p style={styles.userType}>Pharmacist</p>
                    </div>
                    <Link to="/pharmacy/dashboard" style={{ ...styles.sidebarLink, ...styles.sidebarLinkActive }}><FontAwesomeIcon icon={faHome} style={styles.sidebarIcon} />Dashboard</Link>
                    <Link to="/pharmacy_history" style={styles.sidebarLink}><FontAwesomeIcon icon={faHistory} style={styles.sidebarIcon} />Prescription History</Link>
                    <Link to="/pharprofile" style={styles.sidebarLink}><FontAwesomeIcon icon={faCog} style={styles.sidebarIcon} />Profile</Link>
                </aside>

                <main style={styles.mainContentStyle}>
                    <div style={styles.dashboardHeader}>
                        <h1>Pharmacy Dashboard</h1>
                        <button onClick={handleScanClick} style={styles.scanButton}>
                            <FontAwesomeIcon icon={faQrcode} />&nbsp;Scan New Prescription
                        </button>
                    </div>

                    {/* **MODIFIED: Added a fourth stat card for recent activity** */}
                    <div style={styles.statsContainer}>
                        <div style={{...styles.statCard, borderLeftColor: '#007bff'}}>
                           <div style={{...styles.statCardIcon, backgroundColor: '#007bff'}}><FontAwesomeIcon icon={faClock} /></div>
                           <div style={styles.statCardInfo}>
                               <span style={styles.statCardValue}>{loading ? '...' : dashboardStats.handledLast24Hours}</span>
                               <span style={styles.statCardLabel}>Handled in Last 24h</span>
                           </div>
                        </div>
                        <div style={{...styles.statCard, borderLeftColor: '#28a745'}}>
                           <div style={{...styles.statCardIcon, backgroundColor: '#28a745'}}><FontAwesomeIcon icon={faCheckCircle} /></div>
                           <div style={styles.statCardInfo}>
                               <span style={styles.statCardValue}>{loading ? '...' : dashboardStats.fullyIssued}</span>
                               <span style={styles.statCardLabel}>Fully Issued</span>
                           </div>
                        </div>
                        <div style={{...styles.statCard, borderLeftColor: '#ffc107'}}>
                           <div style={{...styles.statCardIcon, backgroundColor: '#ffc107'}}><FontAwesomeIcon icon={faHourglassHalf} /></div>
                           <div style={styles.statCardInfo}>
                               <span style={styles.statCardValue}>{loading ? '...' : dashboardStats.partiallyIssued}</span>
                               <span style={styles.statCardLabel}>Partially Issued</span>
                           </div>
                        </div>
                        <div style={{...styles.statCard, borderLeftColor: '#dc3545'}}>
                           <div style={{...styles.statCardIcon, backgroundColor: '#dc3545'}}><FontAwesomeIcon icon={faBan} /></div>
                           <div style={styles.statCardInfo}>
                               <span style={styles.statCardValue}>{loading ? '...' : dashboardStats.rejected}</span>
                               <span style={styles.statCardLabel}>Rejected</span>
                           </div>
                        </div>
                    </div>

                    <div style={styles.chartContainer}>
                        {loading && <div style={styles.noData}>Loading Chart...</div>}
                        {error && <div style={{ ...styles.noData, color: 'red' }}>{error}</div>}
                        {!loading && !error && (
                            <Bar data={chartData} options={chartOptions} />
                        )}
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}

export default PharmacyDashboard;