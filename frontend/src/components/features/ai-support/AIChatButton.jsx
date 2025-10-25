import React from "react";
import { MessageCircle } from "lucide-react";
import "./AIChatButton.css";

const AIChatButton = ({ onClick, unreadCount = 0 }) => {
  return (
    <button
      className="ai-chat-button"
      onClick={onClick}
      title="AI Assistant - Ask me anything!"
      aria-label="Open AI chat"
    >
      <MessageCircle size={24} />
      {unreadCount > 0 && <span className="ai-chat-badge">{unreadCount}</span>}
      <span className="ai-chat-pulse"></span>
    </button>
  );
};

export default AIChatButton;
