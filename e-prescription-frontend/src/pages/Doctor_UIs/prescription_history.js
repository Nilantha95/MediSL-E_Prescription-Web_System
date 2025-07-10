import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
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
import Avatar from '@mui/material/Avatar'; // For the patient avatar
import logo from '../Main_Interface_UI/images/Logo01.png';
import pic from '../Main_Interface_UI/images/Doctor.png';
import { FaPhoneAlt } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterest, FaWhatsapp } from 'react-icons/fa';

// Sample Data (Updated to include more diverse statuses for demonstration)
const initialPrescriptions = [
  {
    date: '2025-04-27',
    patient: { name: 'John Doe', avatar: '/path/to/john-doe-avatar.png' }, // Replace with actual avatar path or generate
    prescriptionId: '#RX25789',
    medication: 'Amoxicillin 500mg',
    status: 'Active',
    pharmacy: 'LifeCare Pharmacy',
  },
  {
    date: '2025-04-28',
    patient: { name: 'Emily Brown', avatar: '/path/to/emily-brown-avatar.png' }, // Replace with actual avatar path or generate
    prescriptionId: '#RX25788',
    medication: 'Lisinopril 10mg',
    status: 'Completed',
    pharmacy: 'MedPlus',
  },
  {
    date: '2025-05-01',
    patient: { name: 'Michael Johnson', avatar: '/path/to/michael-avatar.png' },
    prescriptionId: '#RX25790',
    medication: 'Metformin 850mg',
    status: 'Active',
    pharmacy: 'City Drug Store',
  },
  {
    date: '2025-05-02',
    patient: { name: 'Sarah Davis', avatar: '/path/to/sarah-avatar.png' },
    prescriptionId: '#RX25791',
    medication: 'Ventolin Inhaler',
    status: 'Pending',
    pharmacy: 'QuickMed Pharmacy',
  },
  {
    date: '2025-05-05',
    patient: { name: 'David Lee', avatar: '/path/to/david-avatar.png' },
    prescriptionId: '#RX25792',
    medication: 'Atorvastatin 20mg',
    status: 'Active',
    pharmacy: 'LifeCare Pharmacy',
  },
  {
    date: '2025-05-06',
    patient: { name: 'Jessica White', avatar: '/path/to/jessica-avatar.png' },
    prescriptionId: '#RX25793',
    medication: 'Gabapentin 300mg',
    status: 'Completed',
    pharmacy: 'MedPlus',
  },
];

const PrescriptionHistory = () => {
  // State for Prescription History Table (the second table)
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateFilter, setDateFilter] = useState('');
  const [pharmacyFilter, setPharmacyFilter] = useState('All Pharmacies');
  const [historyPage, setHistoryPage] = useState(1);
  const [historyRowsPerPage] = useState(10);

  // State for Active Prescriptions Table (the first table)
  const [activeSearchTerm, setActiveSearchTerm] = useState(''); // New state
  const [activeDateFilter, setActiveDateFilter] = useState(''); // New state
  const [activePage, setActivePage] = useState(1);
  const [activeRowsPerPage] = useState(5);

  // Data for Active Prescriptions table (filtered directly by status AND new filters)
  const filteredActivePrescriptions = initialPrescriptions.filter(
    (prescription) => {
      const matchesActiveStatus = prescription.status === 'Active';
      const matchesActiveSearchTerm =
        prescription.patient.name.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
        prescription.prescriptionId.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
        prescription.medication.toLowerCase().includes(activeSearchTerm.toLowerCase()); // You might want to remove medication if not relevant for active search
      const matchesActiveDate = !activeDateFilter || prescription.date === activeDateFilter;

      return matchesActiveStatus && matchesActiveSearchTerm && matchesActiveDate;
    }
  );

  // Pagination logic for Active Prescriptions Table
  const activeStartIndex = (activePage - 1) * activeRowsPerPage;
  const activeEndIndex = activeStartIndex + activeRowsPerPage;
  const paginatedActivePrescriptions = filteredActivePrescriptions.slice(activeStartIndex, activeEndIndex);
  const totalActivePages = Math.ceil(filteredActivePrescriptions.length / activeRowsPerPage);

  const handleActivePageChange = (event, value) => {
    setActivePage(value);
  };

  // Filtering logic for Prescription History Table
  const filteredHistoryPrescriptions = initialPrescriptions.filter((prescription) => {
    const matchesSearchTerm =
      prescription.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.prescriptionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.medication.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All Status' || prescription.status === statusFilter;

    const matchesDate = !dateFilter || prescription.date === dateFilter;

    const matchesPharmacy =
      pharmacyFilter === 'All Pharmacies' || prescription.pharmacy === pharmacyFilter;

    return matchesSearchTerm && matchesStatus && matchesDate && matchesPharmacy;
  });

  // Pagination logic for Prescription History Table
  const historyStartIndex = (historyPage - 1) * historyRowsPerPage;
  const historyEndIndex = historyStartIndex + historyRowsPerPage;
  const paginatedHistoryPrescriptions = filteredHistoryPrescriptions.slice(historyStartIndex, historyEndIndex);
  const totalHistoryPages = Math.ceil(filteredHistoryPrescriptions.length / historyRowsPerPage);

  const handleHistoryPageChange = (event, value) => {
    setHistoryPage(value);
  };

  const navBarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 50px',
    backgroundColor: '#d7f3d2',
  };

  const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
  };

  const logoStyle = {
    height: '50px',
    marginRight: '10px',
  };

  const titleContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
  };

  const titleStyle = {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
  };

  const subtitleStyle = {
    margin: 0,
    fontSize: '12px',
    color: '#777',
  };

  const contactInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    marginRight: '20px',
    color: '#007bff',
  };

  const homeButtonDivStyle = {
    padding: '10px 20px',
    border: '1px solid #ddd',
    borderRadius: '20px',
    backgroundColor: 'lightblue',
    color: '#007bff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  };

  const sidebarStyle = {
    width: '200px',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '5px',
    marginRight: '20px',
  };

  const sidebarLinkStyle = {
    display: 'block',
    padding: '10px 0',
    color: '#333',
    textDecoration: 'none',
    borderBottom: '1px solid #eee',
  };

  const sidebarLinkActiveStyle = {
    color: '#007bff',
    fontWeight: 'bold',
  };

  const dashboardContainerStyle = {
    display: 'flex',
    padding: '20px',
    fontFamily: 'sans-serif',
    flexGrow: 1, // Allow this to grow and take available space
  };

  const doctorAvatarStyle = {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#00cba9',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5em',
    fontWeight: 'bold',
    marginBottom: '5px',
  };

  const doctorNameStyle = {
    fontSize: '1em',
    color: '#555',
    margin: 0,
  };

  const doctorInfoStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '15px 0',
    borderTop: '1px solid #eee',
    backgroundColor: '#d7f3d2',
    padding: '10px',
    borderRadius: '5px',
    margin: '10px 0',
  };

  const footerStyle = {
    backgroundColor: '#d7f3d2',
    padding: '20px',
    marginTop: 'auto', // Pushes the footer to the bottom
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    paddingBottom: '20px',
  };

  const sectionStyle = {
    display: 'flex',
    flexDirection: 'column',
  };

  const headingStyle = {
    fontSize: '1.2em',
    marginBottom: '10px',
    color: '#333',
  };

  const listStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  };

  const listItemStyle = {
    marginBottom: '10px',
    color: '#555',
  };

  const followUsStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const socialIconStyle = {
    display: 'flex',
  };

  const iconLinkStyle = {
    marginRight: '10px',
    textDecoration: 'none',
    color: '#333',
  };

  const bottomBarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '10px',
    borderTop: '1px solid #ccc',
  };

  const copyrightStyle = {
    fontSize: '0.8em',
    color: '#777',
  };

  const linksStyle = {
    display: 'flex',
  };

  const bottomLinkStyle = {
    color: '#555',
    textDecoration: 'none',
    fontSize: '0.8em',
    marginRight: '10px',
  };

  const separatorStyle = {
    color: '#ccc',
    marginRight: '10px',
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
          <Link to="/dashboard" style={{ ...sidebarLinkStyle, ...sidebarLinkActiveStyle }}>Dashboard</Link>
          <Link to="/newprescription" style={sidebarLinkStyle}>Add New Prescription</Link>
          <Link to="/prescriptionhistory" style={sidebarLinkStyle}>Prescriptions</Link>
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
            border: '1px solid #e0e0e0', // Add a light gray border
            borderRadius: '8px', // Add rounded corners
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)', // Optional: subtle shadow
            bgcolor: '#f6f9fc', // Ensure background is white inside the box
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

          {/* --- Active Prescriptions Table (Now at the top) --- */}
          <Box sx={{ mb: 5 }}> {/* Added margin-bottom for spacing */}
            <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
              Active Prescriptions
            </Typography>

            {/* Filters for Active Prescriptions */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <TextField
                label="Search patient name..."
                variant="outlined"
                size="small"
                value={activeSearchTerm}
                onChange={(e) => setActiveSearchTerm(e.target.value)}
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
                label="mm/dd/yyyy"
                variant="outlined"
                size="small"
                value={activeDateFilter}
                onChange={(e) => setActiveDateFilter(e.target.value)}
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
              {/* No status or pharmacy filter for active, as it's already filtered to "Active" */}
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>Issued Date</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>Prescription ID</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedActivePrescriptions.length > 0 ? (
                    paginatedActivePrescriptions.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar src={row.patient.avatar} alt={row.patient.name} />
                          {row.patient.name}
                        </TableCell>
                        <TableCell>{row.prescriptionId}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.status}
                            size="small"
                            color="success" // Always green for active
                            sx={{
                              bgcolor: '#e8f5e9',
                              color: '#2e7d32',
                              fontWeight: 'bold',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
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
                      <TableCell colSpan={5} align="center">
                        No active prescriptions found matching your criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination for Active Prescriptions table */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Showing {activeStartIndex + 1}-
                {Math.min(activeEndIndex, filteredActivePrescriptions.length)} of{' '}
                {filteredActivePrescriptions.length} results
              </Typography>
              <Pagination
                count={totalActivePages}
                page={activePage}
                onChange={handleActivePageChange}
                color="primary"
                showFirstButton
                showLastButton
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    '&.Mui-selected': {
                      bgcolor: 'black',
                      color: 'white',
                      border: '1px solid black',
                      '&:hover': {
                        bgcolor: '#333',
                      },
                    },
                  },
                }}
              />
            </Box>
          </Box>
          {/* --- End Active Prescriptions Table --- */}

          {/* --- Prescription History Table (Now below Active Prescriptions) --- */}
          <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
            Prescription History
          </Typography>

          {/* Filters for Prescription History */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              label="Search patient name..."
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
              select
              label="All Status"
              variant="outlined"
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="All Status">All Status</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </TextField>
            <TextField
              type="date"
              label="mm/dd/yyyy"
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
            <TextField
              select
              label="All Pharmacies"
              variant="outlined"
              size="small"
              value={pharmacyFilter}
              onChange={(e) => setPharmacyFilter(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="All Pharmacies">All Pharmacies</MenuItem>
              <MenuItem value="LifeCare Pharmacy">LifeCare Pharmacy</MenuItem>
              <MenuItem value="MedPlus">MedPlus</MenuItem>
            </TextField>
          </Box>

          {/* Main Prescription History Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Date</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Prescription ID</TableCell>
                  <TableCell>Medication</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Pharmacy</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedHistoryPrescriptions.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar src={row.patient.avatar} alt={row.patient.name} />
                      {row.patient.name}
                    </TableCell>
                    <TableCell>{row.prescriptionId}</TableCell>
                    <TableCell>{row.medication}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        color={row.status === 'Active' ? 'success' : 'default'}
                        sx={{
                          bgcolor: row.status === 'Active' ? '#e8f5e9' : '#f0f0f0',
                          color: row.status === 'Active' ? '#2e7d32' : '#333',
                          fontWeight: 'bold',
                        }}
                      />
                    </TableCell>
                    <TableCell>{row.pharmacy}</TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination for Prescription History table */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {historyStartIndex + 1}-
              {Math.min(historyEndIndex, filteredHistoryPrescriptions.length)} of{' '}
              {filteredHistoryPrescriptions.length} results
            </Typography>
            <Pagination
              count={totalHistoryPages}
              page={historyPage}
              onChange={handleHistoryPageChange}
              color="primary"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  '&.Mui-selected': {
                    bgcolor: 'black',
                    color: 'white',
                    border: '1px solid black',
                    '&:hover': {
                      bgcolor: '#333',
                    },
                  },
                },
              }}
            />
          </Box>
          {/* --- End Prescription History Table --- */}
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