import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, Copy, Check } from "lucide-react";

const AIChatMessage = ({ message, onFeedback }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`ai-message ${message.role}`}>
      <div className="ai-message-content">{message.content}</div>
      {message.role === "assistant" && !message.isError && (
        <div className="ai-message-actions">
          {!message.feedbackSent ? (
            <>
              <button
                onClick={() => onFeedback(message.id, true)}
                className="ai-action-btn"
                title="Helpful"
              >
                <ThumbsUp size={14} />
              </button>
              <button
                onClick={() => onFeedback(message.id, false)}
                className="ai-action-btn"
                title="Not helpful"
              >
                <ThumbsDown size={14} />
              </button>
            </>
          ) : (
            <span className="ai-feedback-sent">
              {message.helpful ? "👍 Thanks!" : "👎 Thanks for feedback"}
            </span>
          )}
          <button onClick={handleCopy} className="ai-action-btn" title="Copy">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      )}
      <div className="ai-message-time">
        {new Date(message.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default AIChatMessage;
