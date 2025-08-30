// used chatgpt and gemini ai for code enhancement

import React from 'react';
import { useTranslation } from 'react-i18next';
import './OptionChooser.css';

const OptionChooser = (props) => {
  const { actionProvider } = props;
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
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
      <p className="initial-prompt">{t('initialChoicePrompt')}</p>
      <button
        className="option-button"
        onClick={() => actionProvider.handleMedicineDetailsStart(i18n.language)}
      >
        {t('getMedicineDetails')}
      </button>
      <button
        className="option-button"
        onClick={() => actionProvider.handleSymptomsDiagnosisStart(i18n.language)}
      >
        {t('diagnoseDisease')}
      </button>
      {/* NEW: Health Tips Button */}
      <button
        className="option-button"
        onClick={() => actionProvider.handleHealthTipsStart(i18n.language)}
      >
        {t('getHealthTip')}
      </button>
    </div>
  );
};

export default OptionChooser;