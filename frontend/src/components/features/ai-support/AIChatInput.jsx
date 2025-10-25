import React, { useState, useRef } from "react";
import { Send, Trash2 } from "lucide-react";

const AIChatInput = ({ onSend, onClear, disabled }) => {
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="ai-chat-input-container" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask me anything about ReceiptoVerse..."
        className="ai-chat-input"
        maxLength={500}
        disabled={disabled}
      />
      <div className="ai-chat-input-actions">
        <button
          type="button"
          onClick={onClear}
          className="ai-input-btn ai-clear-btn"
          title="Clear chat"
        >
          <Trash2 size={18} />
        </button>
        <button
          type="submit"
          className="ai-input-btn ai-send-btn"
          disabled={!input.trim() || disabled}
          title="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
};

export default AIChatInput;
