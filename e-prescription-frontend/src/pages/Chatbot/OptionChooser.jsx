import React from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation hook
import './OptionChooser.css'; // Ensure this CSS file exists for styling

const OptionChooser = (props) => {
  const { actionProvider } = props;
  const { t, i18n } = useTranslation(); // Initialize useTranslation

  // Handler for language selection
  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang); // Change the i18n language
    // You might want to send a message to the chatbot to confirm the language change
    actionProvider.handleLanguageSelected(lang); 
  };

  return (
    <div className="option-chooser-container">
      {/* Language Selection Buttons */}
      <div className="language-selector">
        <button
          className={`lang-button ${i18n.language === 'en' ? 'active' : ''}`}
          onClick={() => handleLanguageChange('en')}
        >
          English
        </button>
        <button
          className={`lang-button ${i18n.language === 'si' ? 'active' : ''}`}
          onClick={() => handleLanguageChange('si')}
        >
          සිංහල (Sinhala)
        </button>
        <button
          className={`lang-button ${i18n.language === 'ta' ? 'active' : ''}`}
          onClick={() => handleLanguageChange('ta')}
        >
          தமிழ் (Tamil)
        </button>
      </div>

      {/* Main Options for Chatbot */}
      <p className="initial-prompt">{t('initialChoicePrompt')}</p> {/* Translated prompt */}
      <button
        className="option-button"
        onClick={() => actionProvider.handleMedicineDetailsStart(i18n.language)} // Pass current language
      >
        {t('getMedicineDetails')} {/* Translated button text */}
      </button>
      <button
        className="option-button"
        onClick={() => actionProvider.handleSymptomsDiagnosisStart(i18n.language)} // Pass current language
      >
        {t('diagnoseDisease')} {/* Translated button text */}
      </button>
    </div>
  );
};

export default OptionChooser;