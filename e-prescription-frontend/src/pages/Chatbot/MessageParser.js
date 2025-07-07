class MessageParser {
  constructor(actionProvider, state) {
    this.actionProvider = actionProvider;
    this.state = state;
  }

  parse(message) {
    console.log("User message received:", message);
    const lowerCaseMessage = message.toLowerCase();

    // For a symptom checker, we'll typically send the entire user message
    // as symptoms to the backend. You can add more sophisticated parsing
    // here if you want to recognize specific commands later (e.g., "hello", "help").

    // Call the actionProvider to handle the symptoms
    this.actionProvider.handleUserSymptoms(message);
  }
}

export default MessageParser;
