/**
 * WebSocket hook for real-time communication
 * Quantum Telecom Simulator - Phase 5
 */

import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = 'ws://localhost:8000/ws';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    // Don't try to connect if already connected or connecting
    if (wsRef.current?.readyState === WebSocket.OPEN || 
        wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    // Limit reconnect attempts to prevent infinite loops
    if (reconnectAttempts.current > 10) {
      console.log('⚠️ Max reconnect attempts reached. Giving up WebSocket.');
      return;
    }

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        // Send initial ping
        ws.send(JSON.stringify({ action: 'ping' }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WebSocket message:', data);
          setLastMessage(data);
          setMessages(prev => [...prev.slice(-50), data]);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      ws.onclose = () => {
        console.log('❌ WebSocket disconnected');
        setIsConnected(false);
        reconnectAttempts.current += 1;
        // Try to reconnect after 5 seconds
        if (reconnectAttempts.current <= 10) {
          reconnectTimeoutRef.current = setTimeout(connect, 5000);
        }
      };

      ws.onerror = (error) => {
        console.warn('⚠️ WebSocket error:', error);
        // Let the close handler handle reconnection
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      reconnectAttempts.current += 1;
      if (reconnectAttempts.current <= 10) {
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    reconnectAttempts.current = 0;
  }, []);

  const sendMessage = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    console.warn('WebSocket not connected');
    return false;
  }, []);

  const sendAction = useCallback((action, payload = {}) => {
    return sendMessage({ action, ...payload });
  }, [sendMessage]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    messages,
    sendMessage,
    sendAction,
    connect,
    disconnect,
  };
}

export default useWebSocket;