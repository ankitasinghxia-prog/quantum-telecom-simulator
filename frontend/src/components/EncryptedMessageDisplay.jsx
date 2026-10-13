/**
 * Encrypted Message Display - Shows encrypted vs decrypted
 * Quantum Telecom Simulator
 */

import React, { useState } from 'react';
import { Lock, Unlock, Eye, EyeOff } from 'lucide-react';

const EncryptedMessageDisplay = ({ message, encrypted }) => {
  const [showEncrypted, setShowEncrypted] = useState(false);

  // Generate fake encrypted text
  const generateEncrypted = (text) => {
    const chars = '0123456789ABCDEF';
    let result = '0x';
    for (let i = 0; i < Math.min(text.length * 2, 32); i++) {
      result += chars[Math.floor(Math.random() * 16)];
    }
    return result + '...';
  };

  const encryptedText = generateEncrypted(message);

  return (
    <div className="bg-gray-800 dark:bg-gray-900 rounded-lg p-3 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {showEncrypted ? (
            <Lock className="w-4 h-4 text-yellow-400" />
          ) : (
            <Lock className="w-4 h-4 text-green-400" />
          )}
          <span className="text-xs text-gray-400">
            {showEncrypted ? '🔒 Encrypted' : '🔓 Decrypted'}
          </span>
        </div>
        <button
          onClick={() => setShowEncrypted(!showEncrypted)}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition"
        >
          {showEncrypted ? (
            <>
              <EyeOff className="w-3 h-3" />
              Show Decrypted
            </>
          ) : (
            <>
              <Eye className="w-3 h-3" />
              Show Encrypted
            </>
          )}
        </button>
      </div>
      <div className={`font-mono text-sm break-all transition-all duration-300 ${
        showEncrypted ? 'text-yellow-400' : 'text-green-400'
      }`}>
        {showEncrypted ? encryptedText : message}
      </div>
      <div className="mt-1 text-xs text-gray-500">
        {showEncrypted ? '🔑 Quantum Encrypted' : '📄 Original Message'}
      </div>
    </div>
  );
};

export default EncryptedMessageDisplay;