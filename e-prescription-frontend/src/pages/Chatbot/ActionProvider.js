import i18n from './i18n';

class ActionProvider {
  // Update the constructor to accept the 'state' as the fourth argument
  constructor(createChatBotMessage, setStateFunc, createClientMessage, state) { // <-- ADDED 'state' HERE
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.createClientMessage = createClientMessage;
    this.state = state; // <-- Store the state received from the Chatbot component
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

  // --- Backend API Call for Medicine Details ---
  async processMedicineName(medicineName) {
    const backendUrl = 'http://127.0.0.1:5000/get_medicine_details';
    // Now this.state will be defined
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
    // Now this.state will be defined
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