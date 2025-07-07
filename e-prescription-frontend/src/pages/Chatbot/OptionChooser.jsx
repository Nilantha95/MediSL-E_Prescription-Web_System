import React from 'react';
import './OptionChooser.css'; // Import the CSS for styling

const OptionChooser = (props) => {
  const { actionProvider } = props;

  return (
    <div className="option-chooser-container">
      <button
        className="option-button"
        onClick={() => actionProvider.handleMedicineDetailsStart()}
      >
        Get Medicine Details
      </button>
      <button
        className="option-button"
        onClick={() => actionProvider.handleSymptomsDiagnosisStart()}
      >
        Diagnose Disease by Symptoms
      </button>
    </div>
  );
};

export default OptionChooser;