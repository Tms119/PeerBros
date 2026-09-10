import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, RotateCcw } from 'lucide-react';
import ChatBubble from './ChatBubble';
import QuickReplies from './QuickReplies';
import TypingIndicator from './TypingIndicator';
import { useChatState } from './useChatState';

/**
 * ChatWidget — floating bubble that expands into a full chat panel.
 * Self-contained, mounted globally in App.jsx.
 */
const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const inputRef = useRef(null);

  const {
    messages,
    quickReplies,
    isTyping,
    isSending,
    sendMessage,
    handleQuickReply,
    resetChat,
    messagesEndRef,
  } = useChatState();

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Show attention pulse after 5 seconds if user hasn't interacted
  useEffect(() => {
    if (hasInteracted) return;
    const timer = setTimeout(() => {
      const bubble = document.getElementById('chat-bubble-btn');
      if (bubble) bubble.classList.add('chat-bubble-attention');
    }, 5000);
    return () => clearTimeout(timer);
  }, [hasInteracted]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasInteracted(true);
    const bubble = document.getElementById('chat-bubble-btn');
    if (bubble) bubble.classList.remove('chat-bubble-attention');
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      {/* Chat Bubble Button */}
      {!isOpen && (
        <button
          id="chat-bubble-btn"
          className="chat-bubble-trigger"
          onClick={handleOpen}
          aria-label="Open chat"
        >
          <MessageCircle size={24} strokeWidth={2} />
          <span className="chat-bubble-ping" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="chat-panel" id="chat-panel">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">
                <span>A</span>
                <span className="chat-avatar-status" />
              </div>
              <div>
                <h3 className="chat-header-name">Alex</h3>
                <p className="chat-header-status">PeerBros · Usually replies instantly</p>
              </div>
            </div>
            <div className="chat-header-actions">
              <button
                className="chat-header-btn"
                onClick={resetChat}
                aria-label="Reset conversation"
                title="Start over"
              >
                <RotateCcw size={16} />
              </button>
              <button
                className="chat-header-btn"
                onClick={handleClose}
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="chat-messages" id="chat-messages">
            {messages.map((msg, i) => (
              <ChatBubble key={i} role={msg.role} content={msg.content} />
            ))}

            {isTyping && <TypingIndicator />}

            {!isTyping && quickReplies.length > 0 && (
              <QuickReplies
                replies={quickReplies}
                onSelect={handleQuickReply}
                disabled={isSending}
              />
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form className="chat-input-area" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              id="chat-input-field"
              autoComplete="off"
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!inputValue.trim() || isSending}
              aria-label="Send message"
              id="chat-send-btn"
            >
              <Send size={18} />
            </button>
          </form>

          {/* Footer */}
          <div className="chat-footer">
            <span>Powered by PeerBros</span>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
