/**
 * Toast Notifications Component
 * Quantum Telecom Simulator
 */

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastNotifications = ({ messages, onDismiss }) => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      const newToasts = messages.map((msg, index) => ({
        id: Date.now() + index,
        type: msg.type || 'info',
        message: msg.message,
        duration: msg.duration || 5000
      }));
      setToasts(prev => [...prev, ...newToasts]);
    }
  }, [messages]);

  useEffect(() => {
    const timers = toasts.map(toast => {
      return setTimeout(() => {
        dismissToast(toast.id);
      }, toast.duration);
    });
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [toasts]);

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    if (onDismiss) onDismiss(id);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case 'success': return 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300';
      case 'error': return 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300';
      case 'warning': return 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300';
      default: return 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-3 rounded-xl border shadow-lg animate-slide-up transition-all duration-300 ${getStyles(toast.type)}`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(toast.type)}
          </div>
          <div className="flex-1 text-sm">
            {toast.message}
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastNotifications;