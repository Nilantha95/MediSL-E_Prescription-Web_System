/* eslint-disable no-unused-vars */
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
import PrescriptionHistory from './pages/Doctor_UIs/prescription_history';
import Phardashboard from './pages/Pharmacy_UIs/dashboard';
import Featurespage from './pages/Main_Interface_UI/featurespage';
import PatientDashboard from './pages/Patient_UIs/dashboard';


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
        <Route path="/prescriptionhistory" element={<PrescriptionHistory/>}/>
        <Route path="/pharmacy/dashboard" element={<Phardashboard/>} />
        <Route path="/featurepage" element={<Featurespage/>} />
        <Route path="/patient/dashboard" element={<PatientDashboard/>}/>
        
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();