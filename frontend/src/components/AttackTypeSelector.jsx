/**
 * Attack Type Selector Component - FIXED
 * Quantum Telecom Simulator
 */

import React, { useState } from 'react';
import { Zap, Shield, AlertTriangle, Eye, Lock, Skull } from 'lucide-react';

const attackTypes = [
  { id: 'intercept_resend', label: 'Intercept-Resend', icon: Eye, color: 'red', description: 'Eve intercepts and resends qubits' },
  { id: 'man_in_the_middle', label: 'Man-in-the-Middle', icon: Lock, color: 'orange', description: 'Eve positions between Alice and Bob' },
  { id: 'denial_of_service', label: 'Denial of Service', icon: Skull, color: 'red', description: 'Floods the quantum channel' },
  { id: 'photon_splitting', label: 'Photon Splitting', icon: Zap, color: 'yellow', description: 'Splits photons to eavesdrop' },
  { id: 'entanglement', label: 'Entanglement Attack', icon: Shield, color: 'purple', description: 'Uses quantum entanglement' },
];

const AttackTypeSelector = ({ onAttackSelect, isDisabled }) => {
  const [selectedType, setSelectedType] = useState('intercept_resend');
  const [isHovering, setIsHovering] = useState(false);

  const handleAttack = () => {
    if (!isDisabled && onAttackSelect) {
      onAttackSelect(selectedType);
    }
  };

  const colorClasses = {
    red: 'bg-red-500 hover:bg-red-600 border-red-500/30 shadow-red-500/25',
    orange: 'bg-orange-500 hover:bg-orange-600 border-orange-500/30 shadow-orange-500/25',
    yellow: 'bg-yellow-500 hover:bg-yellow-600 border-yellow-500/30 shadow-yellow-500/25',
    purple: 'bg-purple-500 hover:bg-purple-600 border-purple-500/30 shadow-purple-500/25',
  };

  const selectedAttack = attackTypes.find(a => a.id === selectedType);
  const IconComponent = selectedAttack?.icon || Eye;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          disabled={isDisabled}
          className="flex-1 px-3 py-2 bg-gray-100 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {attackTypes.map((attack) => (
            <option key={attack.id} value={attack.id} className="flex items-center gap-2">
              {attack.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleAttack}
          disabled={isDisabled}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all duration-300 ${
            colorClasses[selectedAttack?.color || 'red']
          } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
        >
          <IconComponent className="w-4 h-4" />
          <span className="text-sm font-medium">Launch Attack</span>
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {selectedAttack?.description}
      </p>
    </div>
  );
};

export default AttackTypeSelector;