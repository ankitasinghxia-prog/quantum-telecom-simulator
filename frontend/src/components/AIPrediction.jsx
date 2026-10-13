/**
 * AI Attack Prediction Component
 * Quantum Telecom Simulator
 */

import React, { useState, useEffect } from 'react';
import { Brain, AlertTriangle, Shield, Zap, TrendingUp, TrendingDown } from 'lucide-react';

const AIPrediction = ({ attackHistory, networkStatus }) => {
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [isPredicting, setIsPredicting] = useState(false);

  useEffect(() => {
    // Simulate AI prediction every 10 seconds
    const interval = setInterval(() => {
      predictAttack();
    }, 10000);
    return () => clearInterval(interval);
  }, [attackHistory]);

  const predictAttack = () => {
    setIsPredicting(true);

    // Simulate AI processing
    setTimeout(() => {
      const attackTypes = ['Intercept-Resend', 'Man-in-the-Middle', 'Denial of Service', 'Photon Splitting', 'Entanglement'];
      const riskLevels = ['Low', 'Medium', 'High', 'Critical'];
      
      // Use attack history to determine likelihood
      const hasAttacks = attackHistory && attackHistory.length > 0;
      const recentAttacks = hasAttacks ? attackHistory.slice(-5) : [];
      const attackCount = recentAttacks.length;

      // Generate prediction
      const randomAttack = attackTypes[Math.floor(Math.random() * attackTypes.length)];
      const riskIndex = Math.min(Math.floor(Math.random() * 4), 3);
      const risk = riskLevels[riskIndex];
      const confidenceScore = Math.floor(Math.random() * 40) + 60; // 60-100%
      
      // Adjust based on actual attack history
      let adjustedRisk = riskIndex;
      if (attackCount > 2) adjustedRisk = Math.min(riskIndex + 1, 3);
      if (attackCount > 5) adjustedRisk = Math.min(riskIndex + 2, 3);
      
      const finalRisk = riskLevels[adjustedRisk];
      const finalConfidence = Math.min(confidenceScore + (attackCount * 2), 98);

      setPrediction({
        attackType: randomAttack,
        riskLevel: finalRisk,
        timeFrame: Math.floor(Math.random() * 120) + 30, // 30-150 seconds
        confidence: finalConfidence,
        pattern: hasAttacks ? 'Recurring pattern detected' : 'No pattern detected',
        recommendation: getRecommendation(finalRisk, randomAttack)
      });
      setConfidence(finalConfidence);
      setIsPredicting(false);
    }, 1500);
  };

  const getRecommendation = (risk, attackType) => {
    if (risk === 'Critical' || risk === 'High') {
      return `⚠️ Immediate action: Regenerate quantum key and monitor for ${attackType} attacks.`;
    }
    if (risk === 'Medium') {
      return `📋 Monitor network closely. ${attackType} attacks may be attempted.`;
    }
    return `✅ Network appears secure. Continue standard monitoring.`;
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'text-green-500';
      case 'Medium': return 'text-yellow-500';
      case 'High': return 'text-orange-500';
      case 'Critical': return 'text-red-500 animate-pulse';
      default: return 'text-gray-500';
    }
  };

  const getRiskBg = (risk) => {
    switch (risk) {
      case 'Low': return 'bg-green-500/10 border-green-500/30';
      case 'Medium': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'High': return 'bg-orange-500/10 border-orange-500/30';
      case 'Critical': return 'bg-red-500/20 border-red-500/50 animate-pulse';
      default: return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  if (!prediction) {
    return (
      <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-4 text-center">
        <Brain className="w-8 h-8 text-blue-500 mx-auto mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">AI analyzing network patterns...</p>
        <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl border ${getRiskBg(prediction.riskLevel)} transition-all duration-300`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            AI Attack Prediction
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${getRiskColor(prediction.riskLevel)}`}>
            Risk: {prediction.riskLevel}
          </span>
          <span className="text-xs text-gray-400">
            {prediction.confidence}% confidence
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="bg-white/50 dark:bg-dark-bg/50 rounded-lg p-2">
          <p className="text-xs text-gray-400">Predicted Attack</p>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-500" />
            {prediction.attackType}
          </p>
        </div>
        <div className="bg-white/50 dark:bg-dark-bg/50 rounded-lg p-2">
          <p className="text-xs text-gray-400">Time Frame</p>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            ~{prediction.timeFrame}s
          </p>
        </div>
      </div>

      <div className="mt-2 bg-white/50 dark:bg-dark-bg/50 rounded-lg p-2">
        <p className="text-xs text-gray-400">Pattern Analysis</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
          {prediction.pattern}
        </p>
      </div>

      <div className="mt-2 flex items-start gap-2 p-2 bg-white/50 dark:bg-dark-bg/50 rounded-lg">
        <Shield className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {prediction.recommendation}
        </p>
      </div>

      <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            prediction.riskLevel === 'Critical' ? 'bg-red-500' :
            prediction.riskLevel === 'High' ? 'bg-orange-500' :
            prediction.riskLevel === 'Medium' ? 'bg-yellow-500' :
            'bg-green-500'
          }`}
          style={{ width: `${prediction.confidence}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] text-gray-400">
          {isPredicting ? '🔮 Analyzing...' : '✅ AI active'}
        </span>
        <span className="text-[10px] text-gray-400">
          {prediction.confidence}% confidence
        </span>
      </div>
    </div>
  );
};

export default AIPrediction;