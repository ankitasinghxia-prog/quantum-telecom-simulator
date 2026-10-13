/**
 * Key Expiry Warning Component
 * Quantum Telecom Simulator
 */

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, RefreshCw } from 'lucide-react';

const KeyExpiryWarning = ({ keyLength, messagesSent, maxMessages = 10, onRotate }) => {
  const [remaining, setRemaining] = useState(maxMessages);
  const [isWarning, setIsWarning] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    const newRemaining = Math.max(0, maxMessages - (messagesSent % (maxMessages + 1)));
    setRemaining(newRemaining);
    setIsWarning(newRemaining <= 4);
    setIsCritical(newRemaining <= 2);
  }, [messagesSent, maxMessages]);

  if (keyLength === 0) return null;

  const progress = ((maxMessages - remaining) / maxMessages) * 100;

  return (
    <div className={`p-2 rounded-lg border transition-all duration-300 ${
      isCritical ? 'bg-red-500/10 border-red-500/30 animate-pulse' :
      isWarning ? 'bg-yellow-500/10 border-yellow-500/30' :
      'bg-gray-50 dark:bg-dark-bg border-gray-200 dark:border-dark-border'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${isCritical ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-gray-400'}`} />
          <span className={`text-xs ${isCritical ? 'text-red-500 font-medium' : isWarning ? 'text-yellow-500' : 'text-gray-500'}`}>
            Key Rotation
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${isCritical ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-gray-500'}`}>
            {remaining} messages left
          </span>
          {isWarning && (
            <button
              onClick={onRotate}
              className="p-1 text-xs text-blue-500 hover:text-blue-600 transition"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isCritical ? 'bg-red-500' :
            isWarning ? 'bg-yellow-500' :
            'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {isCritical && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1 animate-pulse">
          <AlertTriangle className="w-3 h-3" />
          ⚠️ Key expiring soon! Click refresh icon to rotate.
        </p>
      )}
    </div>
  );
};

export default KeyExpiryWarning;