import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import MainInterface from './pages/Main_Interface_UI/Main_interface'; // Adjust path if necessary
import reportWebVitals from './reportWebVitals';
import RegistrationUI from './pages/Registration_UIs/registration_UI'; // Assuming registration_UI.js is now in a 'pages' subfolder
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainInterface />} /> {/* Your main App component */}
        <Route path="/register" element={<RegistrationUI />} /> {/* Define the route for registration */}
        <Route path="/home2" element={<MainInterface />} /> {}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();