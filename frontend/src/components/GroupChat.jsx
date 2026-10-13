/**
 * Group Quantum Chat Component
 * Quantum Telecom Simulator
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Lock, Unlock, User, MessageCircle } from 'lucide-react';
import { api } from '../utils/api';

const GroupChat = ({ currentUser, users }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Load initial messages
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const history = await api.message.history(50);
      if (history?.messages) {
        const formatted = history.messages.map((msg, i) => ({
          id: msg.id || i,
          sender: msg.sender || 'Alice',
          message: msg.decrypted || msg.encrypted || msg.message || 'Encrypted message',
          timestamp: msg.timestamp || new Date().toISOString(),
          encrypted: msg.encrypted !== undefined ? msg.encrypted : true
        }));
        setMessages(formatted);
      }
    } catch (error) {
      console.error('Failed to load group messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      const response = await api.network.simulate.message(inputMessage);
      
      if (response.success) {
        const newMessage = {
          id: Date.now(),
          sender: currentUser || 'Alice',
          message: inputMessage,
          timestamp: new Date().toISOString(),
          encrypted: isEncrypted
        };
        setMessages(prev => [...prev, newMessage]);
        setInputMessage('');
      }
    } catch (error) {
      console.error('Failed to send group message:', error);
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

  const getUserColor = (sender) => {
    const user = users?.find(u => u.name === sender);
    return user?.color || '#6B7280';
  };

  const getTimeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const onlineUsers = users?.filter(u => u.status === 'online') || [];

  return (
    <div className="flex flex-col h-80">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200 dark:border-dark-border">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Group Chat
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Users className="w-3 h-3" />
            {onlineUsers.length} online
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Lock className={`w-3 h-3 ${isEncrypted ? 'text-green-500' : 'text-gray-400'}`} />
          <span className={isEncrypted ? 'text-green-500' : 'text-gray-400'}>
            {isEncrypted ? 'Encrypted' : 'Unencrypted'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-2 min-h-40 max-h-52 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            💬 No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${
                msg.sender === currentUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0 ${
                  msg.sender === currentUser ? 'bg-blue-500' : 'bg-gray-500'
                }`}
                style={msg.sender !== currentUser ? { backgroundColor: getUserColor(msg.sender) } : {}}
              >
                {msg.sender[0]}
              </div>
              <div className={`max-w-[70%] p-2 rounded-lg text-sm ${
                msg.sender === currentUser
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-dark-bg text-gray-800 dark:text-white'
              }`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium opacity-80">{msg.sender}</span>
                  {msg.encrypted && (
                    <Lock className="w-2.5 h-2.5 opacity-60" />
                  )}
                </div>
                <p className="break-words">{msg.message}</p>
                <span className="text-[10px] opacity-60 mt-0.5 block">
                  {getTimeAgo(msg.timestamp)}
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
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm bg-white dark:bg-dark-card border-gray-300 dark:border-dark-border focus:ring-blue-500"
            disabled={isSending}
          />
          <button
            onClick={() => setIsEncrypted(!isEncrypted)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {isEncrypted ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>
        <button
          onClick={sendMessage}
          disabled={!inputMessage.trim() || isSending}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default GroupChat;