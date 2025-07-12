import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import MainInterface from './pages/Main_Interface_UI/Main_interface';
import reportWebVitals from './reportWebVitals';
import RegistrationUI from './pages/Registration_UIs/registration_UI';
import SignIn from './pages/Registration_UIs/signin';
import DoctorDashboard from './pages/Doctor_UIs/dashboard';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Contact from './pages/Main_Interface_UI/contactus';
import NewPrescriptionForm from './pages/Doctor_UIs/add_prescription';
import PrescriptionHistory from './pages/Doctor_UIs/prescription_history';
import Phardashboard from './pages/Pharmacy_UIs/dashboard';
import Doctorprofile from './pages/Doctor_UIs/doc_profile';
import Featurespage from './pages/Main_Interface_UI/featurespage';
import PatientDashboard from './pages/Patient_UIs/dashboard';
// --- NEW IMPORT FOR VIEW PRESCRIPTION ---
import ViewPrescription from './pages/Doctor_UIs/View_prescription'; // Assuming this path

// --- Pharmacy --- //
import PrescriptionIssue from './pages/Pharmacy_UIs/PrescriptionIssue';
import QrScanner from './pages/Pharmacy_UIs/QrScanner';
import PrescriptionView from './pages/Pharmacy_UIs/PrescriptionView';

// --- NEW IMPORTS FOR I18NEXT ---
import './pages/Chatbot/i18n'; // Make sure this line is present to initialize i18next
import { I18nextProvider } from 'react-i18next';
import i18n from './pages/Chatbot/i18n'; // Import the i18n instance

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Wrap your entire application (BrowserRouter and Routes) with I18nextProvider */}
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainInterface />} />
          <Route path="/register" element={<RegistrationUI />} />
          <Route path="/home2" element={<MainInterface />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/newprescription" element={<NewPrescriptionForm />} />
          <Route path="/prescriptionhistory" element={<PrescriptionHistory />} />
          <Route path="/prescription/:prescriptionId" element={<ViewPrescription />} />
          <Route path="/docprofile" element={<Doctorprofile />} />
          <Route path="/pharmacy/dashboard" element={<Phardashboard />} />
          <Route path="/featurepage" element={<Featurespage />} />
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/pharmacy/issue/:prescriptionId" element={<PrescriptionIssue />} />
          <Route path="/pharmacy/qr-scan" element={<QrScanner />} />
          <Route path="/pharmacy/view/:prescriptionId" element={<PrescriptionView />} />
        </Routes>
      </BrowserRouter>
    </I18nextProvider>
  </React.StrictMode>
);

reportWebVitals();