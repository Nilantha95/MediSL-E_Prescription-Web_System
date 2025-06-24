import React, { useState } from "react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import ChatbotConfig from './ChatbotConfig';
import MessageParser from './MessageParser';
import ActionProvider from './ActionProvider';
import { FaComments } from "react-icons/fa";

const ChatBotToggle = () => {
  const [showChat, setShowChat] = useState(false);

  const toggleChat = () => {
    setShowChat((prev) => !prev);
  };

  return (
    <div>
      {/* Floating Icon */}
      <div
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          backgroundColor: "#007bff",
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
        <FaComments size={28} />
      </div>

      {/* Chatbot Panel */}
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
