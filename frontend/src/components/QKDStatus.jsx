/**
 * QKD Status Component - UPGRADED with animations
 * Quantum Telecom Simulator
 */

import React, { useState, useEffect } from 'react';
import { Key, Shield, AlertCircle, CheckCircle, RefreshCw, Zap, Lock } from 'lucide-react';
import { api } from '../utils/api';
import useWebSocket from '../hooks/useWebSocket';

const QKDStatus = ({ status, onKeyGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [keyInfo, setKeyInfo] = useState({ 
    hasKey: false, 
    keyLength: 0, 
    errorRate: 0, 
    compromised: false 
  });
  const [showQubitAnimation, setShowQubitAnimation] = useState(false);
  
  const { isConnected, lastMessage, sendAction } = useWebSocket();

  useEffect(() => {
    if (lastMessage?.type === 'qkd_status') {
      const data = lastMessage.data;
      setKeyInfo({
        hasKey: data.has_key || false,
        keyLength: data.key_length || 0,
        errorRate: data.error_rate || 0,
        compromised: data.compromised || false
      });
    }
  }, [lastMessage]);

  useEffect(() => {
    if (lastMessage?.type === 'network_status') {
      const data = lastMessage.data;
      setKeyInfo(prev => ({
        ...prev,
        hasKey: data?.nodes?.alice?.has_key || false,
        keyLength: data?.kpi?.quantum_key_strength || 0,
        errorRate: data?.quantum_channel?.error_rate || 0,
        compromised: data?.quantum_channel?.compromised || false
      }));
    }
  }, [lastMessage]);

  useEffect(() => {
    if (lastMessage?.type === 'attack') {
      setKeyInfo(prev => ({
        ...prev,
        compromised: true,
        errorRate: lastMessage.data?.error_rate || 0.15
      }));
    }
  }, [lastMessage]);

  const fetchKeyStatus = async () => {
    try {
      const response = await api.qkd.status();
      setKeyInfo({
        hasKey: response.has_key || false,
        keyLength: response.key_length || 0,
        errorRate: response.error_rate || 0,
        compromised: response.compromised || false
      });
    } catch (error) {
      console.error('Failed to fetch key status:', error);
    }
  };

  const generateKey = async () => {
    try {
      setLoading(true);
      setShowQubitAnimation(true);
      
      const response = await api.network.simulate.qkd(256, false);
      setResult(response);
      
      if (response.success) {
        setTimeout(() => setShowQubitAnimation(false), 2000);
        alert('✅ Quantum Key Generated Successfully!');
        await fetchKeyStatus();
        sendAction('get_qkd_status');
        sendAction('get_status');
        if (onKeyGenerated) onKeyGenerated();
      }
    } catch (error) {
      console.error('Failed to generate key:', error);
      setShowQubitAnimation(false);
      alert('❌ Failed to generate quantum key');
    } finally {
      setLoading(false);
    }
  };

  const generateKeyWithEve = async () => {
    try {
      setLoading(true);
      const response = await api.network.simulate.qkd(256, true);
      setResult(response);
      
      if (response.result?.detected || response.detected) {
        alert('⚠️ EAVESDROPPING DETECTED! Key is compromised!');
        setKeyInfo(prev => ({
          ...prev,
          compromised: true,
          errorRate: response.result?.error_rate || 0.15
        }));
        sendAction('qkd_status');
        sendAction('get_status');
        sendAction('attack_alert', { attack_type: 'intercept_resend' });
        await fetchKeyStatus();
        if (onKeyGenerated) onKeyGenerated();
      }
    } catch (error) {
      console.error('Failed to generate key:', error);
      alert('❌ Failed to generate quantum key');
    } finally {
      setLoading(false);
    }
  };

  const hasKey = keyInfo.hasKey || status?.nodes?.alice?.has_key || false;
  const keyLength = keyInfo.keyLength || status?.kpi?.quantum_key_strength || 0;
  const errorRate = keyInfo.errorRate || status?.quantum_channel?.error_rate || 0;
  const compromised = keyInfo.compromised || status?.quantum_channel?.compromised || false;

  return (
    <div className={`bg-white dark:bg-dark-card rounded-xl shadow-sm border p-4 transition-all duration-300 ${
      compromised ? 'border-red-500/50 shadow-red-500/10' : 'border-gray-200 dark:border-dark-border'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Key className={`w-5 h-5 ${compromised ? 'text-red-500' : 'text-blue-500'}`} />
          <h3 className={`font-semibold ${compromised ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}>
            {compromised ? '⚠️ Key Compromised' : 'Quantum Key Status'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${isConnected ? 'text-green-500' : 'text-red-400'}`}>
            {isConnected ? (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Live
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                Offline
              </span>
            )}
          </span>
          <div className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
            compromised ? 'bg-red-500/20 text-red-500 animate-pulse' : 
            (hasKey ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-yellow-500/20 text-yellow-600')
          }`}>
            {compromised ? '🔴 Compromised' : (hasKey ? `🔑 ${keyLength} bits` : '⚠️ No Key')}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {compromised ? (
            <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />
          ) : hasKey ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-500" />
          )}
          <span className={`text-sm ${compromised ? 'text-red-500 font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
            {compromised ? '⚠️ KEY COMPROMISED - Generate New Key!' : 
             (hasKey ? `✅ Key Generated (${keyLength} bits)` : '⏳ No Key Generated')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Key Strength</p>
            <p className={`text-lg font-bold ${compromised ? 'text-red-500' : 'text-blue-500'}`}>
              {keyLength || 0} bits
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Error Rate</p>
            <p className={`text-lg font-bold ${
              errorRate < 0.1 ? 'text-green-500' : 'text-red-500'
            }`}>
              {(errorRate * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Qubit Animation */}
        {showQubitAnimation && (
          <div className="flex items-center justify-center gap-1 py-2">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  Math.random() > 0.5 ? 'qubit-0' : 'qubit-1'
                }`}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.8s',
                  opacity: 1 - (i / 12) * 0.5,
                }}
              >
                <div className="w-full h-full rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-2">
          <button
            onClick={generateKey}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 text-sm font-medium"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Generate Key
          </button>
          <button
            onClick={generateKeyWithEve}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50 text-sm font-medium"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            Test Eve
          </button>
        </div>

        {result && (
          <div className={`mt-2 p-2 rounded-lg text-sm animate-slide-up ${
            result.result?.detected || result.detected
              ? 'bg-red-500/10 text-red-500 border border-red-500/20'
              : 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
          }`}>
            {result.result?.detected || result.detected
              ? '⚠️ Eve detected! Key compromised. Generate new key to send messages.'
              : '✅ Secure key generated successfully.'}
          </div>
        )}

        {compromised && (
          <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-500 font-medium animate-pulse flex items-center gap-2">
            <Lock className="w-4 h-4" />
            🚫 MESSAGES BLOCKED - Key compromised. Generate a new key.
          </div>
        )}
      </div>
    </div>
  );
};

export default QKDStatus;