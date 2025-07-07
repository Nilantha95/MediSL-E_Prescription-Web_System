class ActionProvider {
  constructor(createChatBotMessage, setStateFunc, createClientMessage) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.createClientMessage = createClientMessage; // This is useful if you want to explicitly add client messages
  }

  // This is the function that will send the symptoms to your Flask backend
  async sendSymptomsToBackend(symptomsParagraph) {
    const backendUrl = 'http://127.0.0.1:5000/chat'; // IMPORTANT: Make sure this matches your Flask backend URL

    // First, show a "thinking" message to the user
    this.addMessageToState(this.createChatBotMessage("Analyzing your symptoms, please wait..."));

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms: symptomsParagraph })
      });

      if (!response.ok) {
        // Try to parse error message from backend, if available
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP error! Status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Chatbot response:', data);

      // Display the main message from the backend
      this.addMessageToState(this.createChatBotMessage(data.message));

      // Always display the disclaimer
      this.addMessageToState(this.createChatBotMessage(data.disclaimer));

    } catch (error) {
      console.error('Error communicating with chatbot backend:', error);
      this.addMessageToState(
        this.createChatBotMessage("Sorry, I'm having trouble connecting right now. Please try again later.")
      );
    }
  }

  // This method will be called by MessageParser when a user types symptoms
  handleUserSymptoms = (message) => {
    // You can optionally add a client message explicitly if the chatbot kit doesn't do it by default
    // this.addMessageToState(this.createClientMessage(message)); 

    this.sendSymptomsToBackend(message);
  };

  // Helper function to update the chatbot state with a new message
  addMessageToState = (message) => {
    this.setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, message],
    }));
  };
}

export default ActionProvider;
