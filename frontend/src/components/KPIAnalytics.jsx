/**
 * KPI Analytics Component - UPGRADED with charts
 * Quantum Telecom Simulator
 */

import React, { useState, useEffect } from 'react';
import { Activity, Shield, MessageSquare, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '../utils/api';

const KPIAnalytics = ({ data }) => {
  const [kpiData, setKpiData] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (data) {
      setKpiData(data);
    } else {
      fetchKPI();
    }
    const interval = setInterval(fetchKPI, 5000);
    return () => clearInterval(interval);
  }, [data]);

  const fetchKPI = async () => {
    try {
      const response = await api.kpi.analysis();
      setKpiData(response);
    } catch (error) {
      console.error('Failed to fetch KPI:', error);
    }
  };

  if (!kpiData) {
    return (
      <div className="text-center text-gray-400 text-sm py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
        Loading KPI data...
      </div>
    );
  }

  const items = [
    {
      label: 'Security Score',
      value: `${kpiData.security_score || 0}%`,
      icon: Shield,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      trend: kpiData.security_score >= 80 ? 'up' : 'down',
    },
    {
      label: 'Messages Sent',
      value: kpiData.total_secure_messages || 0,
      icon: MessageSquare,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      trend: kpiData.total_secure_messages > 0 ? 'up' : 'neutral',
    },
    {
      label: 'Attacks Detected',
      value: kpiData.total_attacks_detected || 0,
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      trend: kpiData.total_attacks_detected > 0 ? 'down' : 'up',
    },
    {
      label: 'Network Availability',
      value: `${(kpiData.network_availability || 99.9).toFixed(1)}%`,
      icon: Activity,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      trend: (kpiData.network_availability || 99.9) >= 99 ? 'up' : 'down',
    },
  ];

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-red-500" />;
    return null;
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {items.map((item, index) => (
          <div key={index} className={`${item.bg} rounded-lg p-2 transition-all duration-300 hover:scale-[1.02]`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <item.icon className={`w-3 h-3 ${item.color}`} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
              </div>
              {getTrendIcon(item.trend)}
            </div>
            <p className="text-sm font-bold text-gray-800 dark:text-white mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400">Key Strength</span>
          <span className="font-medium">{kpiData.quantum_key_strength || 0} bits</span>
        </div>
        <div className="mt-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((kpiData.quantum_key_strength || 0) / 256 * 100, 100)}%` }}
          />
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400">Error Rate</span>
          <span className={`font-medium ${(kpiData.error_rate || 0) < 0.1 ? 'text-green-500' : 'text-red-500'}`}>
            {((kpiData.error_rate || 0) * 100).toFixed(1)}%
          </span>
        </div>
        <div className="mt-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              (kpiData.error_rate || 0) < 0.1 ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min((kpiData.error_rate || 0) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Key Compromised Status */}
      {kpiData.key_compromised && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 animate-pulse">
          <p className="text-xs text-red-500 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            ⚠️ Key is Compromised! Generate new key.
          </p>
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
      >
        {isExpanded ? 'Show Less' : 'Show More Details'}
      </button>

      {isExpanded && (
        <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-2 space-y-1 text-xs animate-slide-up">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Attack Detection Rate</span>
            <span className="font-medium">{kpiData.attack_detection_rate || 0}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Message Encryption Rate</span>
            <span className="font-medium">{kpiData.message_encryption_rate || 0}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Database Sessions</span>
            <span className="font-medium">{kpiData.database_stats?.total_sessions || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Avg Error Rate (DB)</span>
            <span className="font-medium">{((kpiData.database_stats?.avg_error_rate || 0) * 100).toFixed(1)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default KPIAnalytics;