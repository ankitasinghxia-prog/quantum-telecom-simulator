/**
 * Anomaly Detection Component
 * Quantum Telecom Simulator
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Activity, CheckCircle, Radar, Zap } from 'lucide-react';

const AnomalyDetection = ({ networkStatus, messages }) => {
  const [anomalies, setAnomalies] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [totalAnomalies, setTotalAnomalies] = useState(0);

  useEffect(() => {
    // Scan for anomalies every 8 seconds
    const interval = setInterval(() => {
      scanForAnomalies();
    }, 8000);
    return () => clearInterval(interval);
  }, [networkStatus, messages]);

  const scanForAnomalies = () => {
    setIsScanning(true);
    const newAnomalies = [];

    // Check for anomalies based on network status
    if (networkStatus) {
      // Anomaly 1: High error rate
      const errorRate = networkStatus?.quantum_channel?.error_rate || 0;
      if (errorRate > 0.15) {
        newAnomalies.push({
          type: 'High Error Rate',
          severity: 'Critical',
          description: `Error rate detected at ${(errorRate * 100).toFixed(1)}%`,
          timestamp: new Date().toISOString()
        });
      }

      // Anomaly 2: Key compromised
      if (networkStatus?.quantum_channel?.compromised) {
        newAnomalies.push({
          type: 'Key Compromised',
          severity: 'Critical',
          description: 'Quantum key has been compromised',
          timestamp: new Date().toISOString()
        });
      }

      // Anomaly 3: No key for long time
      const hasKey = networkStatus?.nodes?.alice?.has_key;
      if (!hasKey && messages && messages.length > 5) {
        newAnomalies.push({
          type: 'Missing Key',
          severity: 'High',
          description: 'No quantum key available despite active messages',
          timestamp: new Date().toISOString()
        });
      }

      // Anomaly 4: Sudden message spike
      const msgCount = networkStatus?.total_messages || 0;
      if (msgCount > 20) {
        newAnomalies.push({
          type: 'Traffic Spike',
          severity: 'Medium',
          description: `Unusual message activity: ${msgCount} messages`,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Add random anomalies for demo (only if no real anomalies)
    if (newAnomalies.length === 0 && Math.random() > 0.7) {
      const types = [
        { type: 'Unusual Pattern', severity: 'Low', description: 'Minor deviation in quantum channel' },
        { type: 'Signal Noise', severity: 'Low', description: 'Increased noise detected' },
        { type: 'Timing Anomaly', severity: 'Medium', description: 'Unexpected timing variation' },
      ];
      const random = types[Math.floor(Math.random() * types.length)];
      newAnomalies.push({
        ...random,
        timestamp: new Date().toISOString()
      });
    }

    if (newAnomalies.length > 0) {
      setAnomalies(prev => [...newAnomalies, ...prev].slice(0, 10));
      setTotalAnomalies(prev => prev + newAnomalies.length);
    }

    setIsScanning(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'Low': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'Critical':
      case 'High': return <AlertTriangle className="w-4 h-4" />;
      case 'Medium': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Radar className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Anomaly Detection
          </span>
          {isScanning && (
            <span className="text-xs text-blue-500 animate-pulse">Scanning...</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {totalAnomalies} detected
          </span>
          <span className={`text-xs ${totalAnomalies > 0 ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
            {totalAnomalies > 0 ? '⚠️' : '✅'}
          </span>
        </div>
      </div>

      {anomalies.length === 0 ? (
        <div className="text-center text-xs text-gray-400 py-4">
          <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
          No anomalies detected
        </div>
      ) : (
        <div className="space-y-1.5 max-h-32 overflow-y-auto scrollbar-thin">
          {anomalies.slice(0, 4).map((anomaly, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 p-1.5 rounded-lg border text-xs ${getSeverityColor(anomaly.severity)}`}
            >
              {getSeverityIcon(anomaly.severity)}
              <span className="flex-1 font-medium">{anomaly.type}</span>
              <span className="text-gray-400">{anomaly.severity}</span>
              <span className="text-gray-400 text-[10px]">
                {new Date(anomaly.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
          {anomalies.length > 4 && (
            <div className="text-center text-[10px] text-gray-400">
              +{anomalies.length - 4} more
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnomalyDetection;