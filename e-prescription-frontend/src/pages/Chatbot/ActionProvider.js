import i18n from './i18n'; // Ensure this path is correct for your setup

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

  // --- UPDATED: Helper for Text-to-Speech (TTS) using backend API ---
  speakMessage = async (messageText) => {
    const backendUrl = 'http://127.0.0.1:5000/synthesize_speech';
    const currentLanguage = this.state.language || 'en'; // Use current language from state

    console.log("Speaking text (from frontend):", messageText); // Debugging console.log
    console.log("Requested language for speech (from frontend):", currentLanguage); // Debugging console.log

    if (!messageText) {
      console.warn("No text provided to speakMessage.");
      return;
    }

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: messageText,
          lang: currentLanguage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Backend TTS error: ${errorData.error || response.statusText}`);
      }

      // Get the audio blob from the response
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play an audio element
      const audio = new Audio(audioUrl);
      audio.play();

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl); // Clean up the object URL after playing
      };

    } catch (error) {
      console.error('Error in speakMessage (Google Cloud TTS):', error);
      // Fallback to browser's built-in speech synthesis if backend fails
      if ('speechSynthesis' in window) {
        console.log("Falling back to browser's built-in speech synthesis.");
        const utterance = new SpeechSynthesisUtterance(messageText);
        utterance.lang = currentLanguage;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      } else {
        console.warn("Speech Synthesis not supported in this browser and backend TTS failed.");
      }
    }
  };


  // --- Handlers for Language Selection ---
  handleLanguageSelected = (lang) => {
    this.setChatbotLanguage(lang);
    const message = this.createChatBotMessage(i18n.t('welcomeMessage'), {
      widget: 'optionChooser', // Re-display options after language selection
    });
    this.addMessageToState(message);
    this.speakMessage(i18n.t('welcomeMessage')); // Speak welcome message
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

  // --- Health Tips Handler ---
  async handleHealthTipsStart(lang) {
    const backendUrl = 'http://127.0.0.1:5000/get_health_tip';
    this.addMessageToState(this.createChatBotMessage(i18n.t('loadingMessage')));
    this.setChatbotMode('health_tips');

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: lang,
        }),
      });

      const data = await response.json();
      console.log('Health tip response:', data);

      if (!response.ok) {
        const errorMessage = data.message || i18n.t('genericError');
        throw new Error(errorMessage);
      }

      this.addMessageToState(this.createChatBotMessage(data.message));
      this.addMessageToState(this.createChatBotMessage(data.disclaimer));

      const fullHealthTipText = data.message + " " + data.disclaimer;
      this.speakMessage(fullHealthTipText); // Call the updated speakMessage

    } catch (error) {
      console.error('Error in handleHealthTipsStart:', error);
      this.addMessageToState(
        this.createChatBotMessage(i18n.t('noHealthTipsFound'))
      );
      this.speakMessage(i18n.t('noHealthTipsFound')); // Speak error message
    } finally {
      this.setChatbotMode('initial_choice');
      this.addMessageToState(this.createChatBotMessage(i18n.t('goBack')));
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

      const fullMedicineDetailsText = data.message + " " + data.disclaimer;
      this.speakMessage(fullMedicineDetailsText); // Call the updated speakMessage

    } catch (error) {
      console.error('Error in processMedicineName:', error);
      this.addMessageToState(
        this.createChatBotMessage(i18n.t('noMedicineFound', { medicineName: medicineName }))
      );
      this.addMessageToState(this.createChatBotMessage(i18n.t('goBack')));
      this.speakMessage(i18n.t('noMedicineFound', { medicineName: medicineName })); // Speak error message
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
      
      const fullDiagnosisText = data.message + " " + data.disclaimer;
      this.speakMessage(fullDiagnosisText); // Call the updated speakMessage

    } catch (error) {
      console.error('Error in processSymptoms:', error);
      this.addMessageToState(
        this.createChatBotMessage(i18n.t('noDiseaseFound'))
      );
      this.addMessageToState(this.createChatBotMessage(i18n.t('goBack')));
      this.speakMessage(i18n.t('noDiseaseFound')); // Speak error message
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
    this.speakMessage(i18n.t('welcomeMessage')); // Speak welcome message on restart
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

    const fullMessage = i18n.t(messageKey) + " " + detailedMessage;
    this.addMessageToState(this.createChatBotMessage(fullMessage));
    this.speakMessage(fullMessage); // Speak unknown input messages
  };
}

export default ActionProvider;