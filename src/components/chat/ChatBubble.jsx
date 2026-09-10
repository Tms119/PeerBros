import React from 'react';

/**
 * Individual chat message bubble.
 * Bot messages: left-aligned, dark panel.
 * User messages: right-aligned, accent-tinted.
 */
const ChatBubble = ({ role, content }) => {
  const isBot = role === 'assistant';

  return (
    <div
      className={`chat-bubble ${isBot ? 'chat-bubble-bot' : 'chat-bubble-user'}`}
      id={`chat-msg-${Date.now()}`}
    >
      {isBot && (
        <span className="chat-bubble-label">Alex</span>
      )}
      <p className="chat-bubble-text">{content}</p>
    </div>
  );
};

export default ChatBubble;
