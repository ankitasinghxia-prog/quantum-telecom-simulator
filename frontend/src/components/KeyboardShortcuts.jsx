/**
 * Keyboard Shortcuts Component
 * Quantum Telecom Simulator
 */

import React, { useEffect, useState } from 'react';
import { Keyboard, X } from 'lucide-react';

const shortcuts = [
  { key: 'Ctrl+Enter', action: 'Send message' },
  { key: 'Ctrl+K', action: 'Generate quantum key' },
  { key: 'Ctrl+A', action: 'Simulate attack' },
  { key: 'Ctrl+R', action: 'Reset simulation' },
  { key: 'Ctrl+D', action: 'Run demo' },
  { key: 'Ctrl+Shift+D', action: 'Toggle dark mode' },
  { key: 'Ctrl+/', action: 'Show shortcuts' },
];

const KeyboardShortcuts = ({ onShortcut }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      // Toggle shortcuts with Ctrl+/
      if (ctrl && e.key === '/') {
        e.preventDefault();
        setIsVisible(prev => !prev);
        return;
      }

      if (!ctrl) return;

      switch (e.key.toLowerCase()) {
        case 'enter':
          e.preventDefault();
          if (onShortcut) onShortcut('send');
          break;
        case 'k':
          e.preventDefault();
          if (onShortcut) onShortcut('key');
          break;
        case 'a':
          e.preventDefault();
          if (onShortcut) onShortcut('attack');
          break;
        case 'r':
          e.preventDefault();
          if (onShortcut) onShortcut('reset');
          break;
        case 'd':
          e.preventDefault();
          if (onShortcut) onShortcut('demo');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onShortcut]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 p-2 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition z-50"
        title="Keyboard Shortcuts (Ctrl+/)"
      >
        <Keyboard className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-slide-up">
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-dark-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </h3>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {shortcuts.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <span className="text-sm text-gray-600 dark:text-gray-300">{item.action}</span>
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono text-gray-700 dark:text-gray-300">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">Ctrl+/</kbd> to toggle this window
        </p>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;