import { createChatBotMessage } from 'react-chatbot-kit';
import OptionChooser from './OptionChooser'; // Import your widget
import i18n from './i18n'; // Import your i18n instance

const ChatbotConfig = {
  // Initial state for the chatbot.
  // Add 'language' to store the current selected language. Default to 'en'.
  initialChatbotState: {
    chatbotMode: 'initial_choice', // 'initial_choice', 'symptoms_diagnosis', 'medicine_details'
    language: i18n.language || 'en', // Get initial language from i18n or default to English
  },
  initialMessages: [
    // Use i18n.t for the initial message
    createChatBotMessage(i18n.t('welcomeMessage'), {
      widget: 'optionChooser', // Display the OptionChooser widget
    }),
  ],
  botName: i18n.t('botName'), // Translate bot name
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
      // Pass chatbotMode and language to the widget
      mapStateToProps: ['chatbotMode', 'language'], 
    },
  ],
  // Customization for message rendering (optional, but good for styling)
  customComponents: {
    // Replaces the default header
    header: () => <div style={{ backgroundColor: '#376B7E', padding: "10px", borderRadius: "5px 5px 0 0", color: 'white', fontWeight: 'bold' }}>{i18n.t('botName')}</div>,
  },
};

export default ChatbotConfig;