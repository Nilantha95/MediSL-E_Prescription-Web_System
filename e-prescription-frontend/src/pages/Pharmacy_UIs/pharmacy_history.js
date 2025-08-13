import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore'; // Removed where
import { db } from '../../firebase';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import Footer from '../Main_Interface_UI/Footer';

// --- Import Icons ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faHistory, faHome } from '@fortawesome/free-solid-svg-icons';
import { FaPhoneAlt } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import logo from '../Main_Interface_UI/images/Logo01.png';
// import pic from './Images/phar01.jpg'; // REMOVED: Default pharmacist picture

// --- Main Component ---
function PharmacyHistory() {
    const navigate = useNavigate();
    const auth = getAuth();

    // --- STATE MANAGEMENT ---
    const [allPrescriptions, setAllPrescriptions] = useState([]);
    const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [pharmacistData, setPharmacistData] = useState({
        name: 'Loading...',
        photoURL: null, // UPDATED: Default photo removed
    });

    // UI State
    const [isLogoutHovered, setIsLogoutHovered] = useState(false);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const prescriptionsPerPage = 10;


    // --- EFFECTS ---

    // Handle screen resize for responsive design
    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch pharmacist profile
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    setPharmacistData({
                        name: `${userData.firstName} ${userData.lastName}`,
                        photoURL: userData.photoURL || null, // UPDATED: Fallback to pic removed
                    });
                } else {
                    setError("Pharmacist profile not found.");
                    setPharmacistData({ name: "Unknown", photoURL: null }); // UPDATED
                }
            } else {
                navigate('/signin');
            }
        });
        return () => unsubscribe();
    }, [auth, navigate]);

    // Fetch all prescriptions once pharmacist name is available
    useEffect(() => {
        if (pharmacistData.name === 'Loading...' || pharmacistData.name === 'Unknown') {
            if(pharmacistData.name === 'Unknown') setLoading(false);
            return;
        }

        const fetchHistory = async () => {
            setLoading(true);
            setError(null);
            try {
                const q = query(collection(db, 'prescriptions'));
                const querySnapshot = await getDocs(q);
                const allDocs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const history = allDocs.filter(p => {
                    if (Array.isArray(p.issueHistory)) {
                        return p.issueHistory.some(entry => entry.issuedBy === pharmacistData.name);
                    }
                    return false;
                });

                history.sort((a, b) => {
                    const dateA = a.updatedAt?.toDate() || 0;
                    const dateB = b.updatedAt?.toDate() || 0;
                    return dateB - dateA;
                });

                setAllPrescriptions(history);
                setFilteredPrescriptions(history);
            } catch (err) {
                console.error("Error fetching prescription history:", err);
                setError("Failed to load history. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [pharmacistData.name]);

    // Apply filters when search term or date changes
    useEffect(() => {
        let filtered = allPrescriptions;

        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (dateFilter) {
            filtered = filtered.filter(p => {
                const issueDate = p.issueHistory?.slice(-1)[0]?.issuedAt?.toDate().toLocaleDateString('en-CA');
                return issueDate === dateFilter;
            });
        }

        setFilteredPrescriptions(filtered);
        setCurrentPage(1); // Reset to first page on new filter
    }, [searchTerm, dateFilter, allPrescriptions]);


    // --- HANDLERS ---
    const handleLogout = async () => {
        await signOut(auth);
        navigate('/signin');
    };

    // Pagination logic
    const indexOfLastPrescription = currentPage * prescriptionsPerPage;
    const indexOfFirstPrescription = indexOfLastPrescription - prescriptionsPerPage;
    const currentPrescriptions = filteredPrescriptions.slice(indexOfFirstPrescription, indexOfLastPrescription);
    const totalPages = Math.ceil(filteredPrescriptions.length / prescriptionsPerPage);

    // ADDED: Get initials for avatar fallback
    const getInitials = (name) => {
        if (!name || name === 'Loading...') return '';
        const nameParts = name.split(' ');
        const firstInitial = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() : '';
        const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0).toUpperCase() : '';
        return `${firstInitial}${lastInitial}`;
    };


    // --- STYLES (No changes needed here) ---
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
        mainContent: { flexGrow: 1, backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
        userInfo: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee', backgroundColor: '#d7f3d2', borderRadius: '5px', marginBottom: '20px', width: '100%' },
        userAvatarContainer: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#00cba9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5em', fontWeight: 'bold', overflow: 'hidden' },
        userAvatar: { width: '100%', height: '100%', objectFit: 'cover' },
        userName: { fontSize: '1.1em', color: '#333', marginTop: '10px', fontWeight: 'bold' },
        userType: { fontSize: '0.9em', color: '#6c757d', margin: '5px 0 0 0' },
        sidebarLink: { display: 'flex', alignItems: 'center', padding: '12px 15px', color: '#333', textDecoration: 'none', width: '100%', transition: 'background-color 0.2s', fontSize: '15px', fontWeight: '500', borderRadius: '5px', marginBottom: '5px' },
        sidebarLinkActive: { color: '#007bff', backgroundColor: '#e6f2ff', fontWeight: 'bold' },
        sidebarIcon: { marginRight: '10px', fontSize: '1.2em' },
        pageHeader: { marginBottom: '20px' },
        filterContainer: { display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' },
        filterInput: { padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1em' },
        table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
        th: { padding: '12px 15px', borderBottom: '2px solid #ddd', backgroundColor: '#f8f9fa' },
        td: { padding: '12px 15px', borderBottom: '1px solid #eee' },
        statusIssued: { color: 'white', backgroundColor: '#28a745', padding: '5px 10px', borderRadius: '50px', fontSize: '0.8em', display: 'inline-block' },
        statusPartial: { color: 'white', backgroundColor: '#ffc107', padding: '5px 10px', borderRadius: '50px', fontSize: '0.8em', display: 'inline-block' },
        viewButton: { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', textDecoration: 'none' },
        noData: { textAlign: 'center', color: '#888', padding: '40px' },
        paginationContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '10px' },
        paginationButton: { padding: '8px 12px', borderRadius: '5px', border: '1px solid #ccc', cursor: 'pointer', backgroundColor: 'white' },
    };


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
                    <div style={styles.phoneContact}><FaPhoneAlt style={{ marginRight: '8px' }} /><span>+94 (011) 519-51919</span></div>
                    <div style={styles.logoutButton} onMouseEnter={() => setIsLogoutHovered(true)} onMouseLeave={() => setIsLogoutHovered(false)} onClick={handleLogout}>
                        <span>Logout</span><IoIosArrowForward style={{ marginLeft: '5px' }} />
                    </div>
                </div>
            </header>

            <div style={styles.dashboardContainer}>
                {/* Sidebar */}
                <aside style={styles.sidebar}>
                    <div style={styles.userInfo}>
                        <div style={styles.userAvatarContainer}>
                             {/* UPDATED: Logic to show fetched image or initials */}
                             {pharmacistData.photoURL ? (
                                <img src={pharmacistData.photoURL} alt="Pharmacist" style={styles.userAvatar} />
                            ) : (
                                <span>{getInitials(pharmacistData.name)}</span>
                            )}
                        </div>
                        <p style={styles.userName}>{pharmacistData.name}</p>
                        <p style={styles.userType}>Pharmacist</p>
                    </div>
                    <Link to="/pharmacy/dashboard" style={styles.sidebarLink}><FontAwesomeIcon icon={faHome} style={styles.sidebarIcon} />Dashboard</Link>
                    <Link to="/pharmacy/history" style={{ ...styles.sidebarLink, ...styles.sidebarLinkActive }}><FontAwesomeIcon icon={faHistory} style={styles.sidebarIcon} />Prescription History</Link>
                    <Link to="/pharprofile" style={styles.sidebarLink}><FontAwesomeIcon icon={faCog} style={styles.sidebarIcon} />Settings</Link>
                </aside>

                {/* Main Content */}
                <main style={styles.mainContent}>
                    <h1 style={styles.pageHeader}>Prescription History</h1>

                    <div style={styles.filterContainer}>
                        <input type="text" placeholder="Search Patient or ID..." style={styles.filterInput} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        <input type="date" style={styles.filterInput} value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
                    </div>

                    {loading && <div style={styles.noData}>Loading history...</div>}
                    {error && <div style={{ ...styles.noData, color: 'red' }}>{error}</div>}

                    {!loading && !error && (
                        <>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Date Issued</th>
                                        <th style={styles.th}>Patient Name</th>
                                        <th style={styles.th}>Prescription ID</th>
                                        <th style={styles.th}>Status</th>
                                        <th style={styles.th}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentPrescriptions.length > 0 ? currentPrescriptions.map((p) => (
                                        <tr key={p.id}>
                                            <td style={styles.td}>{p.issueHistory?.slice(-1)[0]?.issuedAt?.toDate().toLocaleDateString() || 'N/A'}</td>
                                            <td style={styles.td}>{p.patientName}</td>
                                            <td style={styles.td}>{p.id}</td>
                                            <td style={styles.td}>
                                                <span style={p.status === 'Issued' ? styles.statusIssued : styles.statusPartial}>
                                                    {p.status.replace('_', ' ')}
                                                </span>
                                            </td>

                                            <td style={styles.td}>
                                                <Link to={`/pharmacy/view/${p.id}`} style={styles.viewButton}>View</Link>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" style={styles.noData}>No prescriptions found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                            {totalPages > 1 && (
                                <div style={styles.paginationContainer}>
                                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} style={styles.paginationButton}>Prev</button>
                                    <span>Page {currentPage} of {totalPages}</span>
                                    <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} style={styles.paginationButton}>Next</button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        <Footer />
        </div>
    );
}

export default PharmacyHistory;