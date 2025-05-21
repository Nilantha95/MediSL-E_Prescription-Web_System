import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import MainInterface from './pages/Main_Interface_UI/Main_interface'; // Adjust path if necessary
import reportWebVitals from './reportWebVitals';
import RegistrationUI from './pages/Registration_UIs/registration_UI'; // Assuming registration_UI.js is now in a 'pages' subfolder
import SignIn from './pages/Registration_UIs/signin'; // Import your SignIn component (adjust path if needed)
import DoctorDashboard from './pages/Doctor_UIs/dashboard';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Contact from './pages/Main_Interface_UI/contactus';
import NewPrescriptionForm from './pages/Doctor_UIs/add_prescription';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainInterface />} /> {/* Your main App component */}
        <Route path="/register" element={<RegistrationUI />} /> {/* Define the route for registration */}
        <Route path="/home2" element={<MainInterface />} /> {}
        <Route path="/signin" element={<SignIn />} /> {/* This route is crucial */}
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/newprescription" element={<NewPrescriptionForm />}/>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();