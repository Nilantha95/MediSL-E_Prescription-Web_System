import { createChatBotMessage } from 'react-chatbot-kit';

const ChatbotConfig = {
  initialMessages: [
    createChatBotMessage("Hello! I'm your symptom checker bot. Please tell me about your symptoms.")
  ],
  botName: "MediSL Symptom Bot",
  // Other configurations like customStyles, widgets, etc.
  customStyles: {
    botMessageBox: {
      backgroundColor: "#376B7E",
    },
    chatButton: {
      backgroundColor: "#376B7E",
    },
  },
  // Optionally define widgets if you have them
  widgets: [], 
};

export default ChatbotConfig;