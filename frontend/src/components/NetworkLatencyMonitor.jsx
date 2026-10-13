/**
 * Network Latency Monitor Component
 * Quantum Telecom Simulator
 */

import React, { useState, useEffect } from 'react';
import { Activity, Zap, Clock } from 'lucide-react';

const NetworkLatencyMonitor = () => {
  const [latency, setLatency] = useState(0);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('good');

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate latency between 10-100ms
      const newLatency = Math.floor(Math.random() * 90) + 10;
      setLatency(newLatency);
      setHistory(prev => [...prev.slice(-20), newLatency]);

      if (newLatency < 30) setStatus('excellent');
      else if (newLatency < 60) setStatus('good');
      else if (newLatency < 80) setStatus('fair');
      else setStatus('poor');
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'fair': return 'Fair';
      case 'poor': return 'Poor';
      default: return 'Unknown';
    }
  };

  const averageLatency = history.length > 0 
    ? Math.round(history.reduce((a, b) => a + b, 0) / history.length) 
    : 0;

  return (
    <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className={`w-4 h-4 ${getStatusColor()}`} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Quantum Channel Latency
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${getStatusColor()}`}>
            {getStatusLabel()}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {latency}ms
          </span>
        </div>
      </div>

      <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            status === 'excellent' ? 'bg-green-500' :
            status === 'good' ? 'bg-blue-500' :
            status === 'fair' ? 'bg-yellow-500' :
            'bg-red-500'
          }`}
          style={{ width: `${Math.min(100 - latency, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-1.5 text-xs text-gray-400 dark:text-gray-500">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Avg: {averageLatency}ms
        </span>
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          Peak: {Math.max(...history, 0)}ms
        </span>
      </div>
    </div>
  );
};

export default NetworkLatencyMonitor;