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
  const [fallbackStep, setFallbackStep] = useState(0);
  const [fallbackData, setFallbackData] = useState({ name: '', email: '', service_type: '', notes: '' });
  const [conversationId] = useState(() => generateId());
  const messagesEndRef = useRef(null);

  const sendMessageAction = useAction(api.chat.sendMessage);
  const submitFallbackAction = useAction(api.fallback.submitFallbackLead);

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
    if (!text.trim() || isSending) return;

    const userMessage = { role: 'user', content: text.trim() };
    const currentMessages = [...messages, userMessage];

    // Add user message immediately
    setMessages(currentMessages);
    setQuickReplies([]);
    setIsSending(true);

    // If we're in the conversational fallback flow, handle it locally
    if (isFallbackMode) {
      setTimeout(() => setIsTyping(true), 400);

      const delay = 800 + Math.random() * 500;
      setTimeout(async () => {
        setIsTyping(false);
        if (fallbackStep === 1) {
          setFallbackData(prev => ({ ...prev, name: text.trim() }));
          setFallbackStep(2);
          setMessages(prev => [...prev, { role: 'assistant', content: "Got it! And what is the best email to reach you at?" }]);
        } else if (fallbackStep === 2) {
          const emailInput = text.trim();
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(emailInput)) {
            setMessages(prev => [...prev, { role: 'assistant', content: "That doesn't look like a valid email address. Could you double-check it for me?" }]);
            setIsSending(false);
            return;
          }
          setFallbackData(prev => ({ ...prev, email: emailInput }));
          setFallbackStep(3);
          setMessages(prev => [...prev, { role: 'assistant', content: "Perfect. What kind of project are you looking to build?" }]);
          setQuickReplies(["Website", "Ecommerce", "CRM", "Other"]);
        } else if (fallbackStep === 3) {
          setFallbackData(prev => ({ ...prev, service_type: text.trim().toLowerCase() }));
          setFallbackStep(4);
          setMessages(prev => [...prev, { role: 'assistant', content: "Awesome. Any quick details or notes you want to share before I pass this to the team?" }]);
        } else if (fallbackStep === 4) {
          const finalNotes = text.trim();
          setFallbackData(prev => ({ ...prev, notes: finalNotes }));
          setFallbackStep(5);
          
          try {
            await submitFallbackAction({
              conversation_id: conversationId,
              name: fallbackData.name,
              email: fallbackData.email,
              service_type: fallbackData.service_type || 'other',
              notes: finalNotes,
            });
          } catch (err) {
            console.error("Fallback submission failed:", err);
          }

          setMessages(prev => [...prev, { role: 'assistant', content: "All set! Thanks for sharing that. Our team will review your details and reach out to you shortly.", isSuccess: true }]);
        } else if (fallbackStep >= 5) {
          setMessages(prev => [...prev, { role: 'assistant', content: "Your details have already been submitted. We will be in touch soon!" }]);
        }
        setIsSending(false);
      }, delay);
      
      return; // Exit early so we don't call the Gemini API
    }

    // Show typing indicator after a brief pause
    const typingDelay = 300 + Math.random() * 400;
    setTimeout(() => setIsTyping(true), typingDelay);

    try {
      // Build history (exclude the opening bot message from API history)
      const history = currentMessages.slice(1, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const result = await sendMessageAction({
        conversation_id: conversationId,
        message: text.trim(),
        history,
      });

      // Simulate typing delay
      const responseDelay = 600 + Math.random() * 900;
      await new Promise((resolve) => setTimeout(resolve, responseDelay));

      setIsTyping(false);

      if (result.rate_limited || result.error) {
        throw new Error("API Failure or Rate Limit");
      }

      const phase = result.extracted_fields?.conversation_phase;
      const isComplete = phase === "complete";

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: result.reply, isSuccess: isComplete },
      ]);

      // Set quick replies if provided
      if (result.quick_replies && result.quick_replies.length > 0) {
        setQuickReplies(result.quick_replies);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      setIsFallbackMode(true);
      setFallbackStep(1);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Looks like our system is super busy right now! Let's just do this step by step so I can get your info to the team. First, what is your name?",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }, [messages, isSending, isFallbackMode, fallbackStep, fallbackData, conversationId, sendMessageAction, submitFallbackAction]);

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
