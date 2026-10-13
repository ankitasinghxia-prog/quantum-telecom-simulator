/**
 * Security Level Indicator Component
 * Quantum Telecom Simulator
 */

import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const SecurityLevel = ({ keyLength, isCompromised, attackCount, errorRate }) => {
  // Calculate security level
  let level = 'HIGH';
  let color = 'text-green-500';
  let bgColor = 'bg-green-500/10';
  let borderColor = 'border-green-500/30';
  let icon = <CheckCircle className="w-4 h-4" />;
  let description = 'Secure - No threats detected';

  if (isCompromised) {
    level = 'CRITICAL';
    color = 'text-red-500';
    bgColor = 'bg-red-500/20';
    borderColor = 'border-red-500/50';
    icon = <XCircle className="w-4 h-4" />;
    description = '⚠️ CRITICAL - Key compromised!';
  } else if (attackCount > 0 && errorRate > 0.1) {
    level = 'MEDIUM';
    color = 'text-yellow-500';
    bgColor = 'bg-yellow-500/10';
    borderColor = 'border-yellow-500/30';
    icon = <AlertTriangle className="w-4 h-4" />;
    description = '⚠️ Medium - Some threats detected';
  } else if (attackCount > 0) {
    level = 'LOW';
    color = 'text-orange-500';
    bgColor = 'bg-orange-500/10';
    borderColor = 'border-orange-500/30';
    icon = <AlertTriangle className="w-4 h-4" />;
    description = '⚠️ Low - Minor threats detected';
  } else if (keyLength >= 128) {
    level = 'HIGH';
    color = 'text-green-500';
    bgColor = 'bg-green-500/10';
    borderColor = 'border-green-500/30';
    icon = <CheckCircle className="w-4 h-4" />;
    description = '✅ Secure - No threats detected';
  } else if (keyLength > 0) {
    level = 'MEDIUM';
    color = 'text-yellow-500';
    bgColor = 'bg-yellow-500/10';
    borderColor = 'border-yellow-500/30';
    icon = <AlertTriangle className="w-4 h-4" />;
    description = '⚠️ Medium - Short key length';
  } else {
    level = 'INACTIVE';
    color = 'text-gray-500';
    bgColor = 'bg-gray-500/10';
    borderColor = 'border-gray-500/30';
    icon = <Shield className="w-4 h-4" />;
    description = '⚪ Inactive - No key generated';
  }

  const getLevelColor = () => {
    switch (level) {
      case 'HIGH': return 'text-green-500';
      case 'MEDIUM': return 'text-yellow-500';
      case 'LOW': return 'text-orange-500';
      case 'CRITICAL': return 'text-red-500 animate-pulse';
      default: return 'text-gray-500';
    }
  };

  const getProgressColor = () => {
    switch (level) {
      case 'HIGH': return 'bg-green-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-orange-500';
      case 'CRITICAL': return 'bg-red-500 animate-pulse';
      default: return 'bg-gray-500';
    }
  };

  const getScore = () => {
    if (isCompromised) return 20;
    if (level === 'HIGH') return 100;
    if (level === 'MEDIUM') return 65;
    if (level === 'LOW') return 40;
    return 0;
  };

  return (
    <div className={`p-3 rounded-xl border ${bgColor} ${borderColor} transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`${color}`}>{icon}</span>
          <span className={`text-sm font-semibold ${getLevelColor()}`}>
            Security: {level}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Score</span>
          <span className={`font-bold ${getLevelColor()}`}>{getScore()}%</span>
        </div>
      </div>
      
      <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
          style={{ width: `${getScore()}%` }}
        />
      </div>
      
      <div className="mt-1.5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{description}</span>
        <div className="flex items-center gap-3">
          <span>🔑 {keyLength || 0}b</span>
          <span>🛡️ {attackCount || 0}</span>
          <span>📊 {((errorRate || 0) * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

export default SecurityLevel;