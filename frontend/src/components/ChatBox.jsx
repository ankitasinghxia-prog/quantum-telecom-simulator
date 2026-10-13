/**
 * Chat Box Component - FIXED (no auto-scrolling)
 * Quantum Telecom Simulator
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Lock, Unlock, RefreshCw, AlertTriangle, User, Sparkles } from 'lucide-react';
import { api } from '../utils/api';
import useWebSocket from '../hooks/useWebSocket';
import EncryptedMessageDisplay from './EncryptedMessageDisplay';
import { simulateBobReply } from './BobReply';

const ChatBox = ({ onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [keyLength, setKeyLength] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sendError, setSendError] = useState(null);
  const [messageCount, setMessageCount] = useState(0);
  const [keyCompromised, setKeyCompromised] = useState(false);
  const [isScrambling, setIsScrambling] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const isUserScrolling = useRef(false);
  const shouldAutoScroll = useRef(true);
  
  const { isConnected, lastMessage, sendAction } = useWebSocket();

  const checkKeyStatus = useCallback(async () => {
    try {
      const status = await api.qkd.status();
      setHasKey(status.has_key || false);
      setKeyLength(status.key_length || 0);
      setKeyCompromised(status.compromised || false);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to check key status:', error);
      setIsLoading(false);
    }
  }, []);

  const fetchMessageHistory = useCallback(async () => {
    try {
      const history = await api.message.history(50);
      if (history?.messages) {
        const formattedMessages = history.messages.map((msg, index) => ({
          id: msg.id || index + 1,
          sender: msg.sender || 'Alice',
          message: msg.decrypted || msg.encrypted || msg.message || 'Encrypted message',
          timestamp: msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
          encrypted: msg.encrypted !== undefined ? msg.encrypted : true
        }));
        
        // Only update if messages actually changed (prevents unnecessary re-renders)
        setMessages(prev => {
          if (prev.length === formattedMessages.length && 
              prev.every((msg, i) => msg.id === formattedMessages[i]?.id)) {
            return prev;
          }
          return formattedMessages;
        });
        setMessageCount(formattedMessages.length);
      }
    } catch (error) {
      console.error('Failed to fetch message history:', error);
    }
  }, []);

  const fetchKPIData = useCallback(async () => {
    try {
      const kpi = await api.kpi.analysis();
      if (kpi?.total_secure_messages !== undefined) {
        setMessageCount(kpi.total_secure_messages);
      }
      if (kpi?.key_compromised !== undefined) {
        setKeyCompromised(kpi.key_compromised);
      }
    } catch (error) {
      console.error('Failed to fetch KPI data:', error);
    }
  }, []);

  useEffect(() => {
    checkKeyStatus();
    fetchMessageHistory();
    fetchKPIData();
    
    const interval = setInterval(() => {
      checkKeyStatus();
      fetchMessageHistory();
      fetchKPIData();
    }, 5000); // Reduced from 3s to 5s to reduce updates
    
    return () => clearInterval(interval);
  }, [checkKeyStatus, fetchMessageHistory, fetchKPIData]);

  useEffect(() => {
    if (lastMessage?.type === 'qkd_status') {
      const data = lastMessage.data;
      setHasKey(data.has_key || false);
      setKeyLength(data.key_length || 0);
      setKeyCompromised(data.compromised || false);
      setIsLoading(false);
    }
  }, [lastMessage]);

  useEffect(() => {
    if (lastMessage?.type === 'network_status') {
      const data = lastMessage.data;
      setHasKey(data?.nodes?.alice?.has_key || false);
      setKeyLength(data?.kpi?.quantum_key_strength || 0);
      setKeyCompromised(data?.quantum_channel?.compromised || false);
      if (data?.total_messages !== undefined) {
        setMessageCount(data.total_messages);
      }
      setIsLoading(false);
    }
  }, [lastMessage]);

  useEffect(() => {
    if (lastMessage?.type === 'attack') {
      setKeyCompromised(true);
      setSendError('⚠️ KEY COMPROMISED! Messages blocked.');
      checkKeyStatus();
      fetchKPIData();
    }
  }, [lastMessage]);

  // ============================================
  // SCROLL HANDLING - FIXED
  // ============================================

  // Only scroll to bottom when user sends a message (not on every update)
  const scrollToBottom = useCallback(() => {
    if (shouldAutoScroll.current && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Detect user scroll to disable auto-scroll temporarily
  useEffect(() => {
    const chatContainer = chatEndRef.current?.parentElement;
    if (!chatContainer) return;

    const handleScroll = () => {
      const isAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 50;
      shouldAutoScroll.current = isAtBottom;
    };

    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll only when a new message is added (not on every update)
  useEffect(() => {
    // Only scroll if messages length changed (new message added)
    if (messages.length > 0 && shouldAutoScroll.current) {
      // Small delay to let DOM update
      setTimeout(scrollToBottom, 100);
    }
  }, [messages.length, scrollToBottom]);

  const scrambleText = (text) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let scrambled = '';
    for (let i = 0; i < text.length; i++) {
      scrambled += chars[Math.floor(Math.random() * chars.length)];
    }
    return scrambled;
  };

  const sendMessage = async () => {
    setSendError(null);
    
    if (!inputMessage.trim()) {
      setSendError('Message cannot be empty');
      return;
    }
    
    if (isSending) return;

    if (keyCompromised) {
      setSendError('🚫 KEY COMPROMISED! Cannot send messages. Generate a new key.');
      return;
    }

    if (!hasKey) {
      setSendError('⚠️ No quantum key available! Generate a key first.');
      return;
    }

    try {
      setIsSending(true);
      setIsScrambling(true);
      
      const messageToSend = inputMessage;
      
      const scrambled = scrambleText(messageToSend);
      setInputMessage(scrambled);
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const response = await api.network.simulate.message(messageToSend);
      
      if (response.success) {
        const newMessage = {
          id: Date.now(),
          sender: 'Alice',
          message: messageToSend,
          timestamp: new Date().toLocaleTimeString(),
          encrypted: isEncrypted
        };
        setMessages(prev => [...prev, newMessage]);
        setMessageCount(response.message_count || messageCount + 1);
        setInputMessage('');
        setSendError(null);
        setIsScrambling(false);
        
        // Scroll to bottom after sending (user initiated)
        shouldAutoScroll.current = true;
        setTimeout(scrollToBottom, 200);
        
        if (onMessageSent) onMessageSent();
        sendAction('get_status');
        sendAction('get_qkd_status');
        
        simulateBobReply(setMessages);
        
        setTimeout(fetchKPIData, 500);
      } else {
        setSendError('❌ Failed to send message: ' + (response.message || 'Unknown error'));
        setIsScrambling(false);
        setInputMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      if (error.message && error.message.includes('KEY COMPROMISED')) {
        setKeyCompromised(true);
        setSendError('🚫 KEY COMPROMISED! Generate a new key.');
      } else {
        setSendError('❌ ' + (error.message || 'Failed to send message'));
      }
      setIsScrambling(false);
      setInputMessage('');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleEncryption = () => {
    setIsEncrypted(prev => !prev);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleRefresh = () => {
    checkKeyStatus();
    fetchMessageHistory();
    fetchKPIData();
    sendAction('get_status');
    sendAction('get_qkd_status');
  };

  const isInputDisabled = !hasKey || isLoading || keyCompromised || isScrambling;
  
  let placeholderText = "Type a secure message...";
  if (isScrambling) placeholderText = "🔀 Encrypting...";
  else if (keyCompromised) placeholderText = "🚫 KEY COMPROMISED! Generate new key...";
  else if (isLoading) placeholderText = "Checking key...";
  else if (!hasKey) placeholderText = "⚠️ Generate key first...";

  return (
    <div className="flex flex-col h-80">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-dark-border">
        <div className="flex items-center gap-2">
          {keyCompromised ? (
            <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
          ) : isScrambling ? (
            <Sparkles className="w-4 h-4 text-yellow-500 animate-spin-slow" />
          ) : (
            <Lock className={`w-4 h-4 ${isEncrypted && hasKey ? 'text-green-500' : 'text-gray-400'}`} />
          )}
          <span className={`text-sm font-medium ${
            keyCompromised ? 'text-red-500 animate-pulse' : 
            isScrambling ? 'text-yellow-500' : 
            'text-gray-700 dark:text-gray-300'
          }`}>
            {keyCompromised ? '🚫 BLOCKED' : 
             isScrambling ? '🔀 ENCRYPTING...' : 
             (isEncrypted ? '🔒 Encrypted' : '🔓 Unencrypted')}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${
            keyCompromised ? 'bg-red-500 animate-pulse' : 
            (hasKey ? 'bg-green-500 animate-pulse' : 'bg-gray-400')
          }`} />
          <span className={keyCompromised ? 'text-red-500 font-medium' : 
                         (hasKey ? 'text-green-500 font-medium' : 'text-gray-500')}>
            {keyCompromised ? '🔴 Compromised' : 
             (hasKey ? `🔑 ${keyLength} bits` : '⚠️ No Key')}
          </span>
          <button 
            onClick={handleRefresh} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
            disabled={isLoading}
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {sendError && (
        <div className={`mb-2 p-2 rounded-lg text-sm animate-slide-up ${
          sendError.includes('COMPROMISED') 
            ? 'bg-red-500/10 border border-red-500/30 text-red-500' 
            : 'bg-red-500/10 border border-red-500/20 text-red-500'
        }`}>
          {sendError}
          <button onClick={() => setSendError(null)} className="ml-2 hover:text-red-700">×</button>
        </div>
      )}

      {/* Compromised Warning Banner */}
      {keyCompromised && (
        <div className="mb-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-500 font-medium text-center animate-pulse">
          🚫 KEY COMPROMISED - MESSAGES ARE BLOCKED
        </div>
      )}

      {/* Messages - Fixed scrolling */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-3 min-h-40 max-h-52 scrollbar-thin">
        {messages.length === 0 ? (
          <div className={`text-center text-sm py-8 ${
            keyCompromised ? 'text-red-400' : 
            isScrambling ? 'text-yellow-400' : 
            'text-gray-400 dark:text-gray-500'
          }`}>
            {keyCompromised ? '🚫 Messages blocked - Key compromised!' : 
             isScrambling ? '🔀 Encrypting your message...' :
             (hasKey ? '💬 Send a secure message!' : '🔑 Generate a key first!')}
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-2 animate-slide-up ${
              msg.sender === 'Bob' ? 'flex-row-reverse' : 'flex-row'
            }`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                msg.sender === 'Alice' ? 'bg-blue-500' : 'bg-green-500'
              }`}>
                {msg.sender === 'Alice' ? 'A' : 'B'}
              </div>
              <div className={`max-w-xs p-2 rounded-lg text-sm ${
                msg.sender === 'Alice' 
                  ? 'bg-blue-500/10 dark:bg-blue-500/20 text-gray-800 dark:text-white' 
                  : 'bg-green-500/10 dark:bg-green-500/20 text-gray-800 dark:text-white'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-xs flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {msg.sender}
                  </span>
                  {msg.encrypted !== false && hasKey && !keyCompromised && (
                    <Lock className="w-3 h-3 text-green-500" />
                  )}
                </div>
                <EncryptedMessageDisplay message={msg.message} encrypted={msg.encrypted} />
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 block">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholderText}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all ${
              isInputDisabled 
                ? 'bg-gray-100 dark:bg-dark-bg border-gray-300 dark:border-dark-border text-gray-400 cursor-not-allowed' 
                : 'bg-white dark:bg-dark-card border-gray-300 dark:border-dark-border text-gray-800 dark:text-white focus:ring-blue-500 focus:border-transparent'
            }`}
            disabled={isInputDisabled}
          />
          <button
            onClick={toggleEncryption}
            className={`absolute right-2 top-1/2 -translate-y-1/2 ${
              isInputDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            disabled={isInputDisabled}
            type="button"
          >
            {isEncrypted ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>
        <button
          onClick={sendMessage}
          disabled={!inputMessage.trim() || isInputDisabled || isSending}
          className={`px-4 py-2 rounded-lg transition ${
            !inputMessage.trim() || isInputDisabled || isSending
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
          }`}
          type="button"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 flex justify-between">
        <span>{messageCount} messages sent</span>
        <span className="flex items-center gap-1">
          {keyCompromised ? (
            <span className="text-red-500">🔴 COMPROMISED</span>
          ) : hasKey ? (
            <span className="text-green-500">🔒 Secure</span>
          ) : (
            <span>🔓 No encryption</span>
          )}
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className={isConnected ? 'text-green-500' : 'text-red-400'}>
            {isConnected ? '🟢' : '🔴'}
          </span>
        </span>
      </div>
    </div>
  );
};

export default ChatBox;