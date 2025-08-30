// used chatgpt and gemini ai for code enhancement

class MessageParser {
  constructor(actionProvider, state) {
    this.actionProvider = actionProvider;
    this.state = state;
  }

  parse(message) {
    console.log("User message received:", message);
    const lowerCaseMessage = message.toLowerCase().trim();

    // Check for restart command first, regardless of mode
    if (lowerCaseMessage === 'restart') {
      this.actionProvider.handleRestart();
      return; 
    }

    // Get the current chatbot mode from the state
    const currentMode = this.state.chatbotMode;
    console.log("Current chatbot mode:", currentMode);

    switch (currentMode) {
      case 'initial_choice':
        this.actionProvider.handleUnknownInput();
        break;

      case 'medicine_details':
        this.actionProvider.processMedicineName(message);
        break;

      case 'symptoms_diagnosis':
        this.actionProvider.processSymptoms(message);
        break;

      default:
        // Fallback for any unexpected mode
        this.actionProvider.handleUnknownInput();
        break;
    }
  }
}

export default MessageParser;