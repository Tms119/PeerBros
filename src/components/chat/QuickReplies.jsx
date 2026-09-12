import React from 'react';

/**
 * Quick-reply buttons rendered below the latest bot message.
 * Disappear after the user makes a selection (or types).
 */
const QuickReplies = ({ replies, onSelect, disabled }) => {
  if (!replies || replies.length === 0) return null;

  return (
    <div className="chat-quick-replies" id="chat-quick-replies">
      {replies.map((text, i) => (
        <button
          key={`${text}-${i}`}
          className="quick-reply-btn"
          onClick={() => onSelect(text)}
          disabled={disabled}
          id={`quick-reply-${i}`}
        >
          {text}
        </button>
      ))}
    </div>
  );
};

export default QuickReplies;
