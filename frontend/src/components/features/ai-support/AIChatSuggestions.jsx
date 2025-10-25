import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

const AIChatSuggestions = ({ onSuggestionClick, userContext }) => {
  const [suggestions, setSuggestions] = useState([
    "What is ReceiptoVerse?",
    "How do I earn points?",
    "How do loyalty tiers work?",
    "How to connect my wallet?",
  ]);

  useEffect(() => {
    // Fetch context-aware suggestions
    const fetchSuggestions = async () => {
      try {
        const token = localStorage.getItem("receiptoverse_token");
        const params = new URLSearchParams(userContext);
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:3000"
          }/api/ai-support/suggestions?${params}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (data.success) {
          setSuggestions(data.suggestions);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };

    if (userContext) {
      fetchSuggestions();
    }
  }, [userContext]);

  return (
    <div className="ai-chat-suggestions">
      <div className="ai-suggestions-header">
        <Sparkles size={16} />
        <span>Quick questions:</span>
      </div>
      <div className="ai-suggestions-grid">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="ai-suggestion-btn"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AIChatSuggestions;
