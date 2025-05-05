import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import MainInterface from './pages/Main_Interface_UI/Main_interface'; // Adjust path if necessary
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MainInterface />
  </React.StrictMode>
);

reportWebVitals();