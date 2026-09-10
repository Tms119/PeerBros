import { useState, useCallback, useRef, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { OPENING_MESSAGE, OPENING_QUICK_REPLIES } from './chatConstants';

/**
 * Generate a simple UUID v4 for conversation IDs.
 */
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Custom hook for managing chat state, Convex integration,
 * typing delays, and quick replies.
 */
export function useChatState() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: OPENING_MESSAGE },
  ]);
  const [quickReplies, setQuickReplies] = useState(OPENING_QUICK_REPLIES);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [conversationId] = useState(() => generateId());
  const messagesEndRef = useRef(null);

  const sendMessageAction = useAction(api.chat.sendMessage);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isFallbackMode]);

  /**
   * Send a message and handle the bot response with typing delay.
   */
  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isSending || isFallbackMode) return;

    const userMessage = { role: 'user', content: text.trim() };
    const currentMessages = [...messages, userMessage];

    // Add user message immediately
    setMessages(currentMessages);
    setQuickReplies([]);
    setIsSending(true);

    // Show typing indicator after a brief pause
    const typingDelay = 300 + Math.random() * 400;
    setTimeout(() => setIsTyping(true), typingDelay);

    try {
      // Build history (exclude the opening bot message from API history
      // since it's part of the system prompt behavior)
      const history = currentMessages.slice(1, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const result = await sendMessageAction({
        conversation_id: conversationId,
        message: text.trim(),
        history,
      });

      // Simulate typing delay (600ms - 1.5s)
      const responseDelay = 600 + Math.random() * 900;
      await new Promise((resolve) => setTimeout(resolve, responseDelay));

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: result.reply },
      ]);

      if (result.rate_limited || result.error) {
        setIsFallbackMode(true);
      }

      // Set quick replies if provided
      if (result.quick_replies && result.quick_replies.length > 0) {
        setQuickReplies(result.quick_replies);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Hmm, something glitched on my end. Please leave your details below and we'll reach out!",
        },
      ]);
      setIsFallbackMode(true);
    } finally {
      setIsSending(false);
    }
  }, [messages, isSending, isFallbackMode, conversationId, sendMessageAction]);

  /**
   * Handle quick reply selection.
   */
  const handleQuickReply = useCallback((text) => {
    sendMessage(text);
  }, [sendMessage]);

  /**
   * Reset the conversation.
   */
  const resetChat = useCallback(() => {
    setMessages([{ role: 'assistant', content: OPENING_MESSAGE }]);
    setQuickReplies(OPENING_QUICK_REPLIES);
    setIsTyping(false);
    setIsSending(false);
    setIsFallbackMode(false);
  }, []);

  return {
    messages,
    quickReplies,
    isTyping,
    isSending,
    isFallbackMode,
    sendMessage,
    handleQuickReply,
    resetChat,
    messagesEndRef,
    conversationId,
  };
}
