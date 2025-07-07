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
      return; // Stop further processing
    }

    // Get the current chatbot mode from the state
    const currentMode = this.state.chatbotMode;
    console.log("Current chatbot mode:", currentMode);

    switch (currentMode) {
      case 'initial_choice':
        // If in initial choice mode, and user types something instead of clicking,
        // it's an unknown input for this stage.
        this.actionProvider.handleUnknownInput();
        break;

      case 'medicine_details':
        // If in medicine details mode, send the user's message as a medicine name
        this.actionProvider.processMedicineName(message);
        break;

      case 'symptoms_diagnosis':
        // If in symptoms diagnosis mode, send the user's message as symptoms
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