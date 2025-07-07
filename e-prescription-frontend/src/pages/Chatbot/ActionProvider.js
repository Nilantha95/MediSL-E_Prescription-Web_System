class ActionProvider {
  constructor(createChatBotMessage, setStateFunc, createClientMessage) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.createClientMessage = createClientMessage;
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

  // --- Initial Choice Handlers ---
  handleMedicineDetailsStart = () => {
    const message = this.createChatBotMessage("Great! Please type the full name of the medicine you want to know about (e.g., 'Avastin 400mg Injection').");
    this.addMessageToState(message);
    this.setChatbotMode('medicine_details');
  };

  handleSymptomsDiagnosisStart = () => {
    const message = this.createChatBotMessage("Okay, please describe your symptoms. You can list multiple symptoms separated by commas or just describe them in a sentence.");
    this.addMessageToState(message);
    this.setChatbotMode('symptoms_diagnosis');
  };

  // --- Backend API Call for Medicine Details ---
  async processMedicineName(medicineName) {
    const backendUrl = 'http://127.0.0.1:5000/get_medicine_details'; // Your new backend endpoint

    this.addMessageToState(this.createChatBotMessage(`Searching for details on "${medicineName}"...`));

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ medicineName: medicineName })
      });

      const data = await response.json();
      console.log('Medicine details response:', data);

      if (!response.ok) {
        const errorMessage = data.message || `Error fetching medicine details. Status: ${response.status}`;
        throw new Error(errorMessage);
      }

      this.addMessageToState(this.createChatBotMessage(data.message));
      this.addMessageToState(this.createChatBotMessage(data.disclaimer));

    } catch (error) {
      console.error('Error in processMedicineName:', error);
      this.addMessageToState(
        this.createChatBotMessage(`Sorry, I couldn't get details for "${medicineName}". ${error.message}. Please try again or check the spelling.`)
      );
      this.addMessageToState(this.createChatBotMessage("You can type 'restart' to go back to the main menu."));
    }
  }

  // --- Backend API Call for Symptoms Diagnosis (Existing Logic) ---
  async processSymptoms(symptomsParagraph) {
    const backendUrl = 'http://127.0.0.1:5000/chat'; // Your existing backend endpoint

    this.addMessageToState(this.createChatBotMessage("Analyzing your symptoms, please wait..."));

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms: symptomsParagraph })
      });

      const data = await response.json();
      console.log('Symptoms diagnosis response:', data);

      if (!response.ok) {
        const errorMessage = data.message || `Error diagnosing symptoms. Status: ${response.status}`;
        throw new Error(errorMessage);
      }

      this.addMessageToState(this.createChatBotMessage(data.message));
      this.addMessageToState(this.createChatBotMessage(data.disclaimer));

    } catch (error) {
      console.error('Error in processSymptoms:', error);
      this.addMessageToState(
        this.createChatBotMessage("Sorry, I'm having trouble diagnosing your symptoms right now. Please try again later.")
      );
      this.addMessageToState(this.createChatBotMessage("You can type 'restart' to go back to the main menu."));
    }
  }

  // --- Handle Restart ---
  handleRestart = () => {
    this.setState((prevState) => ({
      ...prevState,
      messages: [
        this.createChatBotMessage("Hello! I'm your MediSL Chatbot. How can I help you today?", {
          widget: 'optionChooser',
        }),
      ],
      chatbotMode: 'initial_choice',
    }));
  };

  // --- Handle Unknown Input ---
  handleUnknownInput = () => {
    const currentState = this.state.chatbotMode;
    let messageText = "I didn't understand that. ";

    if (currentState === 'initial_choice') {
      messageText += "Please choose an option from the buttons above.";
    } else if (currentState === 'medicine_details') {
      messageText += "Please type the full medicine name you are looking for, or type 'restart' to go back to the main menu.";
    } else if (currentState === 'symptoms_diagnosis') {
      messageText += "Please describe your symptoms, or type 'restart' to go back to the main menu.";
    } else {
      messageText += "Please type 'restart' to begin again.";
    }

    this.addMessageToState(this.createChatBotMessage(messageText));
  };
}

export default ActionProvider;