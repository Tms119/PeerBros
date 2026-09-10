import React from 'react';
import { motion } from 'framer-motion';
import SuccessTick from './SuccessTick';

/**
 * Individual chat message bubble.
 * Bot messages: left-aligned, dark panel.
 * User messages: right-aligned, accent-tinted.
 */
const ChatBubble = ({ role, content, isSuccess }) => {
  const isBot = role === 'assistant';

  return (
    <div
      className={`chat-bubble ${isBot ? 'chat-bubble-bot' : 'chat-bubble-user'}`}
    >
      {isBot && (
        <span className="chat-bubble-label">Alex</span>
      )}
      <p className="chat-bubble-text">{content}</p>
      {isSuccess && <SuccessTick />}
    </div>
  );
};

export default ChatBubble;
