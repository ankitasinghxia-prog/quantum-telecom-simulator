/**
 * Key Rotation Counter Component
 * Quantum Telecom Simulator
 */

import React, { useState, useEffect } from 'react';
import { RotateCw, AlertCircle, CheckCircle } from 'lucide-react';

const KeyRotationCounter = ({ messagesSent, maxMessages = 10, onRotate }) => {
  const [remaining, setRemaining] = useState(maxMessages);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const newRemaining = Math.max(0, maxMessages - (messagesSent % (maxMessages + 1)));
    setRemaining(newRemaining);
    setIsWarning(newRemaining <= 3);
  }, [messagesSent, maxMessages]);

  const progress = ((maxMessages - remaining) / maxMessages) * 100;

  return (
    <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RotateCw className={`w-4 h-4 ${isWarning ? 'text-yellow-500 animate-pulse' : 'text-gray-400'}`} />
          <span className="text-xs text-gray-600 dark:text-gray-300">
            Key Rotation
          </span>
        </div>
        <span className={`text-xs font-medium ${isWarning ? 'text-yellow-500' : 'text-gray-500'}`}>
          {remaining} messages left
        </span>
      </div>
      <div className="mt-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isWarning ? 'bg-yellow-500' : 'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {isWarning && (
        <p className="text-xs text-yellow-500 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Key rotation recommended
        </p>
      )}
    </div>
  );
};

export default KeyRotationCounter;