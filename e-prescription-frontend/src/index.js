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
import AboutUs from './pages/Main_Interface_UI/aboutus';

// --- Pharmacy --- //
import PrescriptionIssue from './pages/Pharmacy_UIs/PrescriptionIssue';
import QrScanner from './pages/Pharmacy_UIs/QrScanner';
import PrescriptionView from './pages/Pharmacy_UIs/PrescriptionView';
import PharmacyPrescriptionHistory from './pages/Pharmacy_UIs/pharmacy_history';
import PharmacistProfilePage from './pages/Pharmacy_UIs/profilepage_pharmacy';

// --- NEW IMPORTS FOR I18NEXT ---
import './pages/Chatbot/i18n'; // Make sure this line is present to initialize i18next
import { I18nextProvider } from 'react-i18next';
import i18n from './pages/Chatbot/i18n'; // Import the i18n instance

// --- Patient Portal --- //
import PatientHealthRecords from './pages/Patient_UIs/patient_health_records'; // <<< NEW IMPORT
import PatientProfilePage from './pages/Patient_UIs/patient_profile'; // Adjust path
import MyPrescriptions from './pages/Patient_UIs/my_prescriptions';
import PatientViewPrescription from './pages/Patient_UIs/patient_viewPrescription';

// ---- Admin Portal --- //
import AdminDashboard from './pages/Admin/admin_dashboard';
import Adminreport from './pages/Admin/admin_report';
import Adminprofile from './pages/Admin/admin_profile'
import UserInquiryPage from './pages/Admin/user_Inquiry';

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
          <Route path="/pharmacy_history" element={<PharmacyPrescriptionHistory />} />
          <Route path="/pharmacy/view/:prescriptionId" element={<PrescriptionView />} />
          <Route path="/pharprofile" element={<PharmacistProfilePage />} />
          <Route path="/aboutus" element={<AboutUs/>} />
          <Route path="/patient-health-records" element={<PatientHealthRecords />} /> 
          <Route path="/patient-profile" element={<PatientProfilePage />} />
          <Route path="/patient-prescriptions" element={<MyPrescriptions />} />
          <Route path="/patient-view-prescription/:prescriptionId" element={<PatientViewPrescription />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin-report" element={<Adminreport />} />
          <Route path="/admin-profile" element={<Adminprofile />} />
          <Route path="/user-inquiry" element={<UserInquiryPage />} />
        </Routes>
      </BrowserRouter>
    </I18nextProvider>
  </React.StrictMode>
);

reportWebVitals();