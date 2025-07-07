import { createChatBotMessage } from 'react-chatbot-kit';
import OptionChooser from './OptionChooser'; // Import your new widget

const ChatbotConfig = {
  // Initial state for the chatbot. 'mode' helps MessageParser and ActionProvider
  // understand the current conversational context.
  initialChatbotState: {
    chatbotMode: 'initial_choice', // 'initial_choice', 'symptoms_diagnosis', 'medicine_details'
  },
  initialMessages: [
    createChatBotMessage("Hello! I'm your MediSL Chatbot. How can I help you today?", {
      widget: 'optionChooser', // Display the OptionChooser widget
    }),
  ],
  botName: "MediSL Chatbot",
  customStyles: {
    botMessageBox: {
      backgroundColor: "#376B7E",
    },
    chatButton: {
      backgroundColor: "#376B7E",
    },
  },
  // Define custom widgets here
  widgets: [
    {
      widgetName: 'optionChooser',
      widgetFunc: (props) => <OptionChooser {...props} />,
      mapStateToProps: ['chatbotMode'], // Pass chatbotMode to the widget if needed
    },
  ],
  // Customization for message rendering (optional, but good for styling)
  customComponents: {
    // Replaces the default header
    header: () => <div style={{ backgroundColor: '#376B7E', padding: "10px", borderRadius: "5px 5px 0 0", color: 'white', fontWeight: 'bold' }}>MediSL Chatbot</div>,
  },
};

export default ChatbotConfig;