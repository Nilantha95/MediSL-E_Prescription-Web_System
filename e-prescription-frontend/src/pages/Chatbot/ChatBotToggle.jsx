import React, { useState } from "react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import ChatbotConfig from './ChatbotConfig';
import MessageParser from './MessageParser';
import ActionProvider from './ActionProvider';
// Import both chat and close icons
import { FaComments, FaTimes } from "react-icons/fa"; 

const ChatBotToggle = () => {
  const [showChat, setShowChat] = useState(false);

  const toggleChat = () => {
    setShowChat((prev) => !prev);
  };

  return (
    <div>
      {/* Floating Icon at bottom right */}
      <div
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          // Conditionally set background color: red if chat is open, blue if chat is closed
          backgroundColor: showChat ? "#dc3545" : "#007bff", // Red for close, Blue for chat
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          cursor: "pointer",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
          zIndex: 1000,
        }}
        onClick={toggleChat}
      >
        {/* Conditionally render the icon: FaTimes (red cross) if chat is open, FaComments (chat icon) if chat is closed */}
        {showChat ? <FaTimes size={28} /> : <FaComments size={28} />}
      </div>

      {/* Chatbot Panel, shown when showChat is true */}
      {showChat && (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            right: "30px",
            zIndex: 1001,
          }}
        >
          <Chatbot
            config={ChatbotConfig}
            messageParser={MessageParser}
            actionProvider={ActionProvider}
          />
        </div>
      )}
    </div>
  );
};

export default ChatBotToggle;