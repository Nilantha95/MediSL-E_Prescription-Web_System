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
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterest, FaWhatsapp } from 'react-icons/fa';

// Firebase Imports
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path to your firebaseConfig file

const PrescriptionHistory = () => {
    // State to hold all prescriptions fetched from Firebase
    const [prescriptions, setPrescriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // State for the single Active Prescriptions table
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10);

    const navigate = useNavigate();

    // Fetch data from Firebase when the component mounts
    useEffect(() => {
        const fetchPrescriptions = async () => {
            setIsLoading(true);
            try {
                // Fetch all prescriptions and order them by date in descending order
                const q = query(collection(db, 'prescriptions'), orderBy('prescriptionDate', 'desc'));
                const querySnapshot = await getDocs(q);

                const prescriptionsList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    // Convert Firebase Timestamp to a readable date string
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
            // Check if the patient name, ID, or medication matches the search term
            const matchesSearchTerm =
                prescription.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prescription.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prescription.medications?.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()));

            // Check if the issued date matches the selected date
            const matchesDate = !dateFilter || prescription.issuedDate === dateFilter;

            // Return true if all filters pass (the status filter has been removed)
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
        navigate(`/prescription-display/${prescriptionId}`);
    };

    const navBarStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', backgroundColor: '#d7f3d2' };
    const logoContainerStyle = { display: 'flex', alignItems: 'center' };
    const logoStyle = { height: '50px', marginRight: '10px' };
    const titleContainerStyle = { display: 'flex', flexDirection: 'column' };
    const titleStyle = { margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#333' };
    const subtitleStyle = { margin: 0, fontSize: '12px', color: '#777' };
    const contactInfoStyle = { display: 'flex', alignItems: 'center', marginRight: '20px', color: '#007bff' };
    const homeButtonDivStyle = { padding: '10px 20px', border: '1px solid #ddd', borderRadius: '20px', backgroundColor: 'lightblue', color: '#007bff', cursor: 'pointer', display: 'flex', alignItems: 'center' };
    const sidebarStyle = { width: '200px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '5px', marginRight: '20px' };
    const sidebarLinkStyle = { display: 'block', padding: '10px 0', color: '#333', textDecoration: 'none', borderBottom: '1px solid #eee' };
    const sidebarLinkActiveStyle = { color: '#007bff', fontWeight: 'bold' };
    const dashboardContainerStyle = { display: 'flex', padding: '20px', fontFamily: 'sans-serif', flexGrow: 1 };
    const doctorAvatarStyle = { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#00cba9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5em', fontWeight: 'bold', marginBottom: '5px' };
    const doctorNameStyle = { fontSize: '1em', color: '#555', margin: 0 };
    const doctorInfoStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px 0', borderTop: '1px solid #eee', backgroundColor: '#d7f3d2', padding: '10px', borderRadius: '5px', margin: '10px 0' };
    const footerStyle = { backgroundColor: '#d7f3d2', padding: '20px', marginTop: 'auto' };
    const containerStyle = { display: 'flex', justifyContent: 'space-around', paddingBottom: '20px' };
    const sectionStyle = { display: 'flex', flexDirection: 'column' };
    const headingStyle = { fontSize: '1.2em', marginBottom: '10px', color: '#333' };
    const listStyle = { listStyle: 'none', padding: 0, margin: 0 };
    const listItemStyle = { marginBottom: '10px', color: '#555' };
    const followUsStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
    const socialIconStyle = { display: 'flex' };
    const iconLinkStyle = { marginRight: '10px', textDecoration: 'none', color: '#333' };
    const bottomBarStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #ccc' };
    const copyrightStyle = { fontSize: '0.8em', color: '#777' };
    const linksStyle = { display: 'flex' };
    const bottomLinkStyle = { color: '#555', textDecoration: 'none', fontSize: '0.8em', marginRight: '10px' };
    const separatorStyle = { color: '#ccc', marginRight: '10px' };

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

    return (
        <div style={{ fontFamily: 'sans-serif' }}>
            {/* Navigation Bar */}
            <header style={navBarStyle}>
                <div style={logoContainerStyle}>
                    <img src={logo} alt="E-Prescribe Logo" style={logoStyle} />
                    <div style={titleContainerStyle}>
                        <h1 style={titleStyle}>MediPrescribe</h1>
                        <p style={subtitleStyle}>Your Digital Healthcare Solution</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={contactInfoStyle}>
                        <FaPhoneAlt style={{ marginRight: '5px' }} />
                        <span>+94 (011) 519-51919</span>
                    </div>
                    <Link to="/signin" style={{ textDecoration: 'none' }}>
                        <div style={homeButtonDivStyle}>
                            <span>Logout</span>
                            <IoIosArrowForward style={{ marginLeft: '5px' }} />
                        </div>
                    </Link>
                </div>
            </header>

            {/* Dashboard Content */}
            <div style={dashboardContainerStyle}>
                {/* Sidebar */}
                <aside style={sidebarStyle}>
                    <Link to="/dashboard" style={sidebarLinkStyle}>Dashboard</Link>
                    <Link to="/newprescription" style={sidebarLinkStyle}>Add New Prescription</Link>
                    <Link to="/prescriptionhistory" style={{ ...sidebarLinkStyle, ...sidebarLinkActiveStyle }}>Prescriptions</Link>
                    <Link to="/appointments" style={sidebarLinkStyle}>Appointments</Link>
                    <Link to="/settings" style={sidebarLinkStyle}>Settings</Link>
                    <div style={doctorInfoStyle}>
                        <div style={doctorAvatarStyle}>
                            <img src={pic} alt="Doctor Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        </div>
                        <p style={doctorNameStyle}>Dr. John Smith</p>
                    </div>
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
                                                <IconButton size="small" onClick={() => handleViewDetails(row.id)}>
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
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
            <footer style={footerStyle}>
                <div style={containerStyle}>
                    <div style={sectionStyle}>
                        <h3 style={headingStyle}>Shop Matcha</h3>
                        <ul style={listStyle}>
                            <li style={listItemStyle}>Starter Kits</li>
                            <li style={listItemStyle}>Lattes & Sweetened</li>
                            <li style={listItemStyle}>Just the Matcha</li>
                            <li style={listItemStyle}>Matchaware</li>
                            <li style={listItemStyle}>Shop All</li>
                        </ul>
                    </div>
                    <div style={sectionStyle}>
                        <h3 style={headingStyle}>Learn</h3>
                        <ul style={listStyle}>
                            <li style={listItemStyle}>Our Story</li>
                            <li style={listItemStyle}>Matcha Recipes</li>
                            <li style={listItemStyle}>Caffeine Content</li>
                            <li style={listItemStyle}>Health Benefits</li>
                            <li style={listItemStyle}>FAQ's</li>
                        </ul>
                    </div>
                    <div style={sectionStyle}>
                        <h3 style={headingStyle}>More from Tenzo</h3>
                        <ul style={listStyle}>
                            <li style={listItemStyle}>Sign In</li>
                            <li style={listItemStyle}>Wholesale Opportunities</li>
                            <li style={listItemStyle}>Affiliate</li>
                            <li style={listItemStyle}>Contact Us</li>
                        </ul>
                    </div>
                    <div style={followUsStyle}>
                        <h3 style={headingStyle}>Follow us</h3>
                        <div style={socialIconStyle}>
                            <a href="#" style={iconLinkStyle}><FaPinterest style={{ fontSize: '1.5em' }} /></a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><FaFacebookF style={{ fontSize: '1.5em' }} /></a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><FaInstagram style={{ fontSize: '1.5em' }} /></a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><FaTwitter style={{ fontSize: '1.5em' }} /></a>
                            <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}><FaWhatsapp style={{ fontSize: '1.5em' }} /></a>
                        </div>
                    </div>
                </div>
                <div style={bottomBarStyle}>
                    <p style={copyrightStyle}>© 2025 tenzotea.co</p>
                    <div style={linksStyle}>
                        <a href="#" style={bottomLinkStyle}>Terms of Service</a>
                        <span style={separatorStyle}>|</span>
                        <a href="#" style={bottomLinkStyle}>Privacy Policy</a>
                        <span style={separatorStyle}>|</span>
                        <a href="#" style={bottomLinkStyle}>Refund Policy</a>
                        <span style={separatorStyle}>|</span>
                        <a href="#" style={bottomLinkStyle}>Accessibility Policy</a>
                    </div>
                </div>
            </footer>
            <div style={{ backgroundColor: '#111', color: '#ddd', textAlign: 'center', padding: '10px' }}>
                <p>© 2025 MediPrescribe. All rights reserved.</p>
            </div>
        </div>
    );
};

export default PrescriptionHistory;