import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  X,
  Send,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Minimize2,
} from "lucide-react";
import AIChatMessage from "./AIChatMessage";
import AIChatInput from "./AIChatInput";
import AIChatSuggestions from "./AIChatSuggestions";
import AIChatTypingIndicator from "./AIChatTypingIndicator";
import "./AISupportChat.css";

const AISupportChat = ({ isOpen, onClose, userContext }) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  // Load chat history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem("ai_chat_history");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Error loading chat history:", e);
      }
    } else {
      // Welcome message
      setMessages([
        {
          id: Date.now(),
          role: "assistant",
          content:
            "👋 Hi! I'm ReceiptoVerse AI Assistant. I'm here to help you with anything about the platform. How can I assist you today?",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("ai_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Call AI API
      const token = localStorage.getItem("receiptoverse_token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

      console.log("🤖 Sending message to AI:", {
        url: `${API_URL}/api/ai-support/chat`,
        hasToken: !!token,
        message: messageText.substring(0, 50) + "...",
      });

      const response = await fetch(`${API_URL}/api/ai-support/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: messageText,
          context: userContext,
        }),
      });

      console.log("🤖 Response status:", response.status);
      const data = await response.json();
      console.log("🤖 Response data:", data);

      if (data.success) {
        // Add AI response
        const aiMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: data.reply,
          timestamp: data.timestamp,
          model: data.model,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("AI chat error:", error);

      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: error.message.includes("rate limit")
          ? "I'm receiving too many questions right now. Please try again in a minute! 😊"
          : "I encountered an error. Please try again or contact support if the problem persists.",
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleFeedback = async (messageId, helpful) => {
    try {
      const token = localStorage.getItem("receiptoverse_token");
      await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }/api/ai-support/feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ helpful, messageId }),
        }
      );

      // Update message to show feedback was sent
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, feedbackSent: true, helpful } : msg
        )
      );
    } catch (error) {
      console.error("Feedback error:", error);
    }
  };

  const handleClearChat = () => {
    if (confirm("Clear all chat history?")) {
      setMessages([
        {
          id: Date.now(),
          role: "assistant",
          content: "Chat cleared! How can I help you?",
          timestamp: new Date().toISOString(),
        },
      ]);
      localStorage.removeItem("ai_chat_history");
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`ai-chat-container ${isMinimized ? "minimized" : ""}`}>
      {/* Header */}
      <div className="ai-chat-header">
        <div className="ai-chat-header-left">
          <Sparkles className="ai-icon" size={20} />
          <div>
            <h3>AI Assistant</h3>
            <span className="ai-status">● Online</span>
          </div>
        </div>
        <div className="ai-chat-header-actions">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="ai-header-btn"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            <Minimize2 size={18} />
          </button>
          <button onClick={onClose} className="ai-header-btn" title="Close">
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="ai-chat-messages">
            {messages.map((message) => (
              <AIChatMessage
                key={message.id}
                message={message}
                onFeedback={handleFeedback}
              />
            ))}
            {isTyping && <AIChatTypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions (show only if no user messages yet) */}
          {messages.filter((m) => m.role === "user").length === 0 && (
            <AIChatSuggestions
              onSuggestionClick={handleSuggestionClick}
              userContext={userContext}
            />
          )}

          {/* Input */}
          <AIChatInput
            onSend={handleSendMessage}
            onClear={handleClearChat}
            disabled={isTyping}
          />
        </>
      )}
    </div>
  );
};

export default AISupportChat;
