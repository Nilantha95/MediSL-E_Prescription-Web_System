import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    InputAdornment,
    IconButton,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Pagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Avatar from '@mui/material/Avatar';
import logo from '../Main_Interface_UI/images/Logo01.png';
import pic from '../Main_Interface_UI/images/Doctor.png';
import { FaPhoneAlt } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../Main_Interface_UI/Footer';

// Imports from DoctorDashboard.js for the sidebar
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { FaUserMd, FaPrescriptionBottleAlt, FaHistory, FaHome } from 'react-icons/fa';

// Firebase Imports
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path to your firebaseConfig file

const PrescriptionHistory = () => {
    const auth = getAuth(); // Get the auth instance

    // State to manage the doctor's profile information (from DoctorDashboard.js)
    const [doctorData, setDoctorData] = useState({
        firstName: 'Loading...',
        lastName: '',
        email: '',
        userType: '',
        photoURL: null,
    });
    const [doctorProfileLoading, setDoctorProfileLoading] = useState(true); // Renamed to avoid conflict

    // State to hold all prescriptions fetched from Firebase
    const [prescriptions, setPrescriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // State for the single Active Prescriptions table
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10);

    const navigate = useNavigate();

    // Fetch doctor data from Firebase when the component mounts (from DoctorDashboard.js)
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
                            photoURL: data.photoURL || pic,
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
            setDoctorProfileLoading(false);
        });
        return () => unsubscribe();
    }, [auth]);

    // Function to get initials from a name (from DoctorDashboard.js)
    const getInitials = (firstName, lastName) => {
        const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
        const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
        return `${firstInitial}${lastInitial}`;
    };

    // Fetch prescription data from Firebase when the component mounts
    useEffect(() => {
        const fetchPrescriptions = async () => {
            setIsLoading(true);
            try {
                const q = query(collection(db, 'prescriptions'), orderBy('prescriptionDate', 'desc'));
                const querySnapshot = await getDocs(q);

                const prescriptionsList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    issuedDate: doc.data().prescriptionDate ? doc.data().prescriptionDate.toDate().toLocaleDateString('en-CA') : 'N/A',
                }));

                setPrescriptions(prescriptionsList);
            } catch (error) {
                console.error("Error fetching prescriptions:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPrescriptions();
    }, []);

    // Filters for Active Prescriptions Table
    const filteredPrescriptions = prescriptions.filter(
        (prescription) => {
            const matchesSearchTerm =
                prescription.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prescription.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prescription.medications?.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesDate = !dateFilter || prescription.issuedDate === dateFilter;

            return matchesSearchTerm && matchesDate;
        }
    );

    // Pagination for the table
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedPrescriptions = filteredPrescriptions.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredPrescriptions.length / rowsPerPage);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    // Navigation to the detailed prescription view
    const handleViewDetails = (prescriptionId) => {
        navigate(`/prescription/${prescriptionId}`);
    };

    // Consolidated Styles from DoctorDashboard.js
    const styles = {
        navBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', backgroundColor: '#d7f3d2' },
        logoContainer: { display: 'flex', alignItems: 'center' },
        logo: { height: '50px', marginRight: '10px' },
        titleContainer: { display: 'flex', flexDirection: 'column' },
        title: { margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#333' },
        subtitle: { margin: 0, fontSize: '12px', color: '#777' },
        contactInfo: { display: 'flex', alignItems: 'center', marginRight: '20px', color: '#007bff' },
        homeButtonDiv: { padding: '10px 20px', border: '1px solid #ddd', borderRadius: '20px', backgroundColor: 'lightblue', color: '#007bff', cursor: 'pointer', display: 'flex', alignItems: 'center' },

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
        footer: { backgroundColor: '#d7f3d2', padding: '20px', marginTop: 'auto' },
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


    const getStatusChipColor = (status) => {
        switch (status) {
            case 'Active':
                return { bgcolor: '#e8f5e9', color: '#2e7d32' };
            case 'Completed':
                return { bgcolor: '#e3f2fd', color: '#1565c0' };
            case 'Pending':
                return { bgcolor: '#fffde7', color: '#f57f17' };
            default:
                return { bgcolor: '#f0f0f0', color: '#333' };
        }
    };

    if (doctorProfileLoading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading doctor profile...</div>;
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
                {/* Sidebar - Updated with new design from DoctorDashboard.js */}
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
                    <Link to="/newprescription" style={styles.sidebarLink}><FaPrescriptionBottleAlt style={styles.sidebarIcon} />Create New Prescription</Link>
                    <Link to="/prescriptionhistory" style={{ ...styles.sidebarLink, ...styles.sidebarLinkActive }}><FaHistory style={styles.sidebarIcon} />Prescriptions</Link>
                    <Link to="/docprofile" style={styles.sidebarLink}><FaUserMd style={styles.sidebarIcon} />Profile</Link>
                </aside>

                {/* Main Content Area */}
                <Box
                    sx={{
                        p: 3,
                        flexGrow: 1,
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        bgcolor: '#f6f9fc',
                    }}
                >
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" component="h1">
                            Prescription Overview
                        </Typography>
                        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: 'black', '&:hover': { bgcolor: '#333' } }}>
                            New Prescription
                        </Button>
                    </Box>

                    {/* --- Active Prescriptions Table --- */}
                    <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                        Active Prescriptions
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                        <TextField
                            label="Search patient/ID"
                            variant="outlined"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ minWidth: 200 }}
                        />
                        <TextField
                            type="date"
                            label="Date"
                            variant="outlined"
                            size="small"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <CalendarTodayIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ minWidth: 180 }}
                        />
                    </Box>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Patient</TableCell>
                                    <TableCell>Prescription ID</TableCell>
                                    <TableCell>Medication</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedPrescriptions.length > 0 ? (
                                    paginatedPrescriptions.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>{row.issuedDate}</TableCell>
                                            <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar src={row.patientAvatar} alt={row.patientName || 'N/A'} />
                                                {row.patientName || 'N/A'}
                                            </TableCell>
                                            <TableCell>{row.id}</TableCell>
                                            <TableCell>
                                                {row.medications?.[0]?.name || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.status}
                                                    size="small"
                                                    sx={{
                                                        ...getStatusChipColor(row.status),
                                                        fontWeight: 'bold',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Link to={`/prescription/${row.id}`}>
                                                    <IconButton size="small">
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Link>
                                                <IconButton size="small">
                                                    <MoreVertIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            No active prescriptions found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Showing {startIndex + 1}-
                            {Math.min(endIndex, filteredPrescriptions.length)} of{' '}
                            {filteredPrescriptions.length} results
                        </Typography>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            showFirstButton
                            showLastButton
                            sx={{
                                '& .MuiPaginationItem-root': { borderRadius: '4px', border: '1px solid #ddd' },
                                '& .MuiPaginationItem-root.Mui-selected': { bgcolor: 'black', color: 'white', border: '1px solid black', '&:hover': { bgcolor: '#333' } },
                            }}
                        />
                    </Box>
                </Box>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default PrescriptionHistory;