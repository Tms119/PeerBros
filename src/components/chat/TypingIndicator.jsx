import React from 'react';

/**
 * Animated three-dot typing indicator — shows while the bot
 * is "thinking" (during the artificial delay before response).
 */
const TypingIndicator = () => {
  return (
    <div className="chat-bubble chat-bubble-bot" id="chat-typing-indicator">
      <div className="typing-dots">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
};

export default TypingIndicator;
