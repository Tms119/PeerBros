import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, RotateCcw, Volume2, VolumeX, Mic, Phone, PhoneOff } from "lucide-react";
import ChatBubble from "./ChatBubble";
import QuickReplies from "./QuickReplies";
import TypingIndicator from "./TypingIndicator";
import { useChatState } from "./useChatState";

/**
 * ChatWidget — floating bubble that expands into a full chat panel.
 * Self-contained, mounted globally in App.jsx.
 */
const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const {
    messages,
    quickReplies,
    isTyping,
    isSending,
    isMuted,
    setIsMuted,
    isCallMode,
    setIsCallMode,
    isBotSpeaking,
    isAudioLoading,
    sendMessage,
    handleQuickReply,
    resetChat,
    playGreeting,
    messagesEndRef,
    conversationId,
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
      const bubble = document.getElementById("chat-bubble-btn");
      if (bubble) bubble.classList.add("chat-bubble-attention");
    }, 5000);
    return () => clearTimeout(timer);
  }, [hasInteracted]);

  // Auto-listen in Call Mode
  useEffect(() => {
    if (isCallMode && !isBotSpeaking && !isSending && !isAudioLoading && !isTyping && !isRecording) {
      const timer = setTimeout(() => {
        // Find the mic button and click it to ensure we use the same handler
        const micBtn = document.getElementById("call-mic-button");
        if (micBtn && !micBtn.disabled) {
          micBtn.click();
        }
      }, 800); // Wait a short breath after she stops speaking before listening
      return () => clearTimeout(timer);
    }
  }, [isCallMode, isBotSpeaking, isSending, isAudioLoading, isTyping, isRecording]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasInteracted(true);
    const bubble = document.getElementById("chat-bubble-btn");
    if (bubble) bubble.classList.remove("chat-bubble-attention");
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleMicClick = () => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please try Chrome or Safari.");
      return;
    }
    
    let langCode = 'en-US';
    const userLangChoice = messages.find(m => m.role === 'user')?.content?.toLowerCase() || '';
    if (userLangChoice.includes('español')) langCode = 'es-ES';
    else if (userLangChoice.includes('français')) langCode = 'fr-FR';
    else if (userLangChoice.includes('বাংলা') || userLangChoice.includes('bangla')) langCode = 'bn-BD';

    const recognition = new SpeechRecognition();
    recognition.lang = langCode;
    // Use continuous mode so it doesn't aggressively stop, but we will handle manual stops
    recognition.continuous = true; 
    recognition.interimResults = true;
    
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        setInputValue("");
        if (isCallMode) {
           sendMessage(finalTranscript);
           recognition.stop();
        } else {
           setInputValue(prev => prev ? prev + " " + finalTranscript : finalTranscript);
        }
      } else {
        setInputValue(interimTranscript);
      }
    };
    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e.error);
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);
    
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition:", e);
    }
  };

  const toggleCallMode = () => {
    setIsCallMode(!isCallMode);
    if (!isCallMode) {
      setIsMuted(false); // Unmute when entering call mode
      playGreeting(); // Introduce herself!
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
                <span>M</span>
                <span className="chat-avatar-status" />
              </div>
              <div>
                <h3 className="chat-header-name">Mithila</h3>
                <p className="chat-header-status">
                  PeerBros · Usually replies instantly
                </p>
              </div>
            </div>
            <div className="chat-header-actions">
              <button
                className={`chat-header-btn ${isCallMode ? 'active-call' : ''}`}
                onClick={toggleCallMode}
                aria-label="Call Mode"
                title="Call Mode"
              >
                <Phone size={16} />
              </button>
              {!isCallMode && (
                <button
                  className="chat-header-btn"
                  onClick={() => setIsMuted(!isMuted)}
                  aria-label={isMuted ? "Unmute voice" : "Mute voice"}
                  title={isMuted ? "Turn Voice On" : "Turn Voice Off"}
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
              )}
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

          {/* Call Interface Mode */}
          {isCallMode ? (
            <div className="call-mode-interface">
              <div className={`call-avatar-container ${isBotSpeaking ? 'speaking' : ''} ${isRecording ? 'listening' : ''}`}>
                <div className="call-avatar-pulse ring-1"></div>
                <div className="call-avatar-pulse ring-2"></div>
                <div className="call-avatar">
                  <span>M</span>
                </div>
              </div>

              <div className="call-status-text">
                {isBotSpeaking ? "Mithila is speaking..." 
                 : isAudioLoading ? "Mithila is getting ready to speak..." 
                 : isSending || isTyping ? "Mithila is thinking..." 
                 : isRecording ? "Listening..." 
                 : "Tap the mic to speak"}
              </div>

              {inputValue && (
                <div className="call-live-caption">
                  {inputValue}
                </div>
              )}

              <div className="call-controls">
                <button
                  id="call-mic-button"
                  className={`call-mic-btn ${isRecording ? 'recording' : ''}`}
                  onClick={handleMicClick}
                  disabled={isSending || isBotSpeaking || isAudioLoading || isTyping}
                >
                  <Mic size={24} />
                </button>

                <button
                  className="call-hangup-btn"
                  onClick={toggleCallMode}
                >
                  <PhoneOff size={24} />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages Area */}
              <div className="chat-messages" id="chat-messages" data-lenis-prevent="true">
                {messages.map((msg, i) => (
                  <ChatBubble key={i} role={msg.role} content={msg.content} isSuccess={msg.isSuccess} />
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
                  type="button"
                  className={`chat-mic-btn ${isRecording ? 'recording' : ''}`}
                  onClick={handleMicClick}
                  disabled={isSending || isRecording}
                  aria-label="Voice input"
                  title="Dictate message"
                >
                  <Mic size={18} />
                </button>
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
            </>
          )}

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
