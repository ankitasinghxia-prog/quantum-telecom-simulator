/**
 * Attack Alerts Component - FIXED
 * Quantum Telecom Simulator - Phase 5
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Eye, Zap } from 'lucide-react';
import { api } from '../utils/api';
import useWebSocket from '../hooks/useWebSocket';

const AttackAlerts = ({ status }) => {
  const [attacks, setAttacks] = useState([]);
  const [totalAttacks, setTotalAttacks] = useState(0);
  const [isEveActive, setIsEveActive] = useState(false);
  const [attackLogs, setAttackLogs] = useState([]);
  const [errorRate, setErrorRate] = useState(0);
  
  const { isConnected, lastMessage } = useWebSocket();

  useEffect(() => {
    fetchAttackLogs();
    const interval = setInterval(fetchAttackLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (lastMessage?.type === 'attack') {
      console.log('⚠️ Attack alert received:', lastMessage.data);
      setTotalAttacks(prev => prev + 1);
      setAttackLogs(prev => [...prev, {
        id: Date.now(),
        type: lastMessage.data.attack_type || 'unknown',
        timestamp: lastMessage.data.timestamp || new Date().toISOString(),
        detected: true
      }]);
      setIsEveActive(true);
      // Also update error rate from attack data
      if (lastMessage.data.error_rate) {
        setErrorRate(lastMessage.data.error_rate);
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    if (status) {
      const attackCount = status?.nodes?.eve?.attacks || 0;
      const eveActive = status?.nodes?.eve?.status === 'active';
      const errRate = status?.quantum_channel?.error_rate || 0;
      
      if (attackCount > 0 && attackCount !== totalAttacks) {
        setTotalAttacks(attackCount);
      }
      setIsEveActive(eveActive || false);
      setErrorRate(errRate);
    }
  }, [status]);

  const fetchAttackLogs = async () => {
    try {
      const response = await api.attack.logs(50);
      if (response?.attacks) {
        setAttackLogs(response.attacks);
        setTotalAttacks(response.attacks.length);
        // Also check if any attacks exist
        if (response.attacks.length > 0) {
          setIsEveActive(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch attack logs:', error);
    }
  };

  const hasAttacks = totalAttacks > 0;

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-5 h-5 ${hasAttacks ? 'text-red-500' : 'text-gray-400'}`} />
          <h3 className="font-semibold text-gray-800">Attack Alerts</h3>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          isEveActive || hasAttacks ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-green-100 text-green-700'
        }`}>
          {isEveActive || hasAttacks ? `⚠️ ${totalAttacks} Attack(s)` : '✅ Secure'}
        </span>
      </div>

      <div className="space-y-3">
        {(isEveActive || hasAttacks) ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-700">
                {isEveActive ? '⚠️ Eavesdropping Detected!' : `${totalAttacks} Attack(s) Detected`}
              </span>
            </div>
            <p className="text-xs text-red-600 mt-1">
              {isEveActive 
                ? `Eve is actively intercepting the quantum channel. Error rate: ${(errorRate * 100).toFixed(1)}%`
                : `${totalAttacks} attack(s) have been detected and blocked.`}
            </p>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-700">Channel Secure</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              No attacks detected on the quantum channel.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded p-2 text-center">
            <p className="text-xs text-gray-500">Total Attacks</p>
            <p className={`text-lg font-bold ${totalAttacks > 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {totalAttacks}
            </p>
          </div>
          <div className="bg-gray-50 rounded p-2 text-center">
            <p className="text-xs text-gray-500">Detection Rate</p>
            <p className={`text-lg font-bold ${totalAttacks > 0 ? 'text-green-600' : 'text-gray-600'}`}>
              {totalAttacks > 0 ? '100%' : 'N/A'}
            </p>
          </div>
        </div>

        {attackLogs.length > 0 && (
          <div className="mt-2 max-h-24 overflow-y-auto">
            {attackLogs.slice(-3).map((log, index) => (
              <div key={log.id || index} className="flex items-center gap-2 text-xs text-gray-500 py-1 border-b border-gray-100">
                <Zap className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                <span>Attack #{index + 1}: {log.type || 'Unknown'}</span>
                <span className="ml-auto text-gray-400">
                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttackAlerts;