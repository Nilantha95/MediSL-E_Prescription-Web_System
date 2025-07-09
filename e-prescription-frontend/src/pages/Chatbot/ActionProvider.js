import i18n from '../Chatbot/i18n';

class ActionProvider {
  // Constructor now correctly receives the 'state' object
  constructor(createChatBotMessage, setStateFunc, createClientMessage, state) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.createClientMessage = createClientMessage;
    this.state = state; // Store the state received from the Chatbot component
  }

  // Helper function to update the chatbot state with a new message
  addMessageToState = (message) => {
    this.setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, message],
    }));
  };

  // Helper to update the chatbot's internal mode
  setChatbotMode = (mode) => {
    this.setState((prevState) => ({
      ...prevState,
      chatbotMode: mode,
    }));
  };

  // Helper to update the chatbot's language state
  setChatbotLanguage = (lang) => {
    this.setState((prevState) => ({
      ...prevState,
      language: lang,
    }));
  };

  // --- Handlers for Language Selection ---
  handleLanguageSelected = (lang) => {
    this.setChatbotLanguage(lang);
    const message = this.createChatBotMessage(i18n.t('welcomeMessage'), {
      widget: 'optionChooser', // Re-display options after language selection
    });
    this.addMessageToState(message);
  };

  // --- Initial Choice Handlers ---
  handleMedicineDetailsStart = (lang) => {
    const message = this.createChatBotMessage(i18n.t('medicineDetailsMode'));
    this.addMessageToState(message);
    this.setChatbotMode('medicine_details');
    this.setChatbotLanguage(lang);
  };

  handleSymptomsDiagnosisStart = (lang) => {
    const message = this.createChatBotMessage(i18n.t('symptomsDiagnosisMode'));
    this.addMessageToState(message);
    this.setChatbotMode('symptoms_diagnosis');
    this.setChatbotLanguage(lang);
  };

  // --- NEW: Health Tips Handler ---
  async handleHealthTipsStart(lang) { // Receive language
    const backendUrl = 'http://127.0.0.1:5000/get_health_tip'; // New backend endpoint
    this.addMessageToState(this.createChatBotMessage(i18n.t('loadingMessage'))); // Translated loading message
    this.setChatbotMode('health_tips'); // Set mode temporarily, though no input is expected

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: lang, // Pass current language to backend
        }),
      });

      const data = await response.json();
      console.log('Health tip response:', data);

      if (!response.ok) {
        const errorMessage = data.message || i18n.t('genericError');
        throw new Error(errorMessage);
      }

      this.addMessageToState(this.createChatBotMessage(data.message)); // Display the tip
      this.addMessageToState(this.createChatBotMessage(data.disclaimer)); // Display disclaimer

    } catch (error) {
      console.error('Error in handleHealthTipsStart:', error);
      this.addMessageToState(
        this.createChatBotMessage(i18n.t('noHealthTipsFound')) // Translated error message
      );
    } finally {
      // Always revert to initial choice mode after providing the tip
      this.setChatbotMode('initial_choice');
      this.addMessageToState(this.createChatBotMessage(i18n.t('goBack'))); // Offer to restart
    }
  };


  // --- Backend API Call for Medicine Details ---
  async processMedicineName(medicineName) {
    const backendUrl = 'http://127.0.0.1:5000/get_medicine_details';
    const currentLanguage = this.state.language || 'en';

    this.addMessageToState(this.createChatBotMessage(i18n.t('loadingMessage')));

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          medicineName: medicineName,
          language: currentLanguage,
        }),
      });

      const data = await response.json();
      console.log('Medicine details response:', data);

      if (!response.ok) {
        const errorMessage = data.message || i18n.t('genericError');
        throw new Error(errorMessage);
      }

      this.addMessageToState(this.createChatBotMessage(data.message));
      this.addMessageToState(this.createChatBotMessage(data.disclaimer));

    } catch (error) {
      console.error('Error in processMedicineName:', error);
      this.addMessageToState(
        this.createChatBotMessage(i18n.t('noMedicineFound', { medicineName: medicineName }))
      );
      this.addMessageToState(this.createChatBotMessage(i18n.t('goBack')));
    }
  }

  // --- Backend API Call for Symptoms Diagnosis ---
  async processSymptoms(symptomsParagraph) {
    const backendUrl = 'http://127.0.0.1:5000/chat';
    const currentLanguage = this.state.language || 'en';

    this.addMessageToState(this.createChatBotMessage(i18n.t('loadingMessage')));

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms: symptomsParagraph,
          language: currentLanguage,
        }),
      });

      const data = await response.json();
      console.log('Symptoms diagnosis response:', data);

      if (!response.ok) {
        const errorMessage = data.message || i18n.t('genericError');
        throw new Error(errorMessage);
      }

      this.addMessageToState(this.createChatBotMessage(data.message));
      this.addMessageToState(this.createChatBotMessage(data.disclaimer));

    } catch (error) {
      console.error('Error in processSymptoms:', error);
      this.addMessageToState(
        this.createChatBotMessage(i18n.t('noDiseaseFound'))
      );
      this.addMessageToState(this.createChatBotMessage(i18n.t('goBack')));
    }
  }

  // --- Handle Restart ---
  handleRestart = () => {
    this.setState((prevState) => ({
      ...prevState,
      messages: [
        this.createChatBotMessage(i18n.t('welcomeMessage'), {
          widget: 'optionChooser',
        }),
      ],
      chatbotMode: 'initial_choice',
    }));
  };

  // --- Handle Unknown Input ---
  handleUnknownInput = () => {
    const currentState = this.state.chatbotMode;
    let messageKey = "unknownInput";

    if (currentState === 'initial_choice') {
      messageKey = "initialChoicePrompt";
    } else if (currentState === 'medicine_details') {
      messageKey = "provideMedicineName";
    } else if (currentState === 'symptoms_diagnosis') {
      messageKey = "provideSymptoms";
    } else {
      // For 'health_tips' mode or unexpected, default to initial prompt
      messageKey = "initialChoicePrompt";
    }

    let detailedMessage = "";
    if (currentState === 'medicine_details' || currentState === 'symptoms_diagnosis') {
        detailedMessage = i18n.t('goBack');
    }

    this.addMessageToState(this.createChatBotMessage(i18n.t(messageKey) + " " + detailedMessage));
  };
}

export default ActionProvider;