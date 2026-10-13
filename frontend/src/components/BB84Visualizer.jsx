/**
 * BB84 Protocol Visualizer - Step-by-step animation
 * Quantum Telecom Simulator
 */

import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, RotateCcw, Check, X } from 'lucide-react';

const BB84Visualizer = ({ isActive, onComplete }) => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [qubits, setQubits] = useState([]);

  const steps = [
    { name: 'Alice Generates Qubits', icon: '⚛️', description: 'Alice creates random bits and bases' },
    { name: 'Transmitting Qubits', icon: '📡', description: 'Qubits travel through quantum channel' },
    { name: 'Bob Measures Qubits', icon: '📐', description: 'Bob measures in random bases' },
    { name: 'Key Sifting', icon: '🔑', description: 'Compare bases and extract matching bits' },
    { name: 'Error Checking', icon: '✅', description: 'Check error rate for eavesdropping' },
    { name: 'Key Established!', icon: '🎉', description: 'Secure quantum key generated!' },
  ];

  useEffect(() => {
    if (isActive && isPlaying) {
      const interval = setInterval(() => {
        setStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            if (onComplete) onComplete();
            return prev;
          }
          return prev + 1;
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isActive, isPlaying, steps.length, onComplete]);

  const startVisualization = () => {
    setStep(0);
    setIsPlaying(true);
    // Generate random qubits for visual
    const newQubits = Array.from({ length: 8 }, () => ({
      bit: Math.random() > 0.5 ? 1 : 0,
      basis: Math.random() > 0.5 ? '+' : 'x',
    }));
    setQubits(newQubits);
  };

  const resetVisualization = () => {
    setStep(0);
    setIsPlaying(false);
    setQubits([]);
  };

  const currentStep = steps[step] || steps[0];

  if (!isActive) {
    return (
      <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-4 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Click "Start BB84 Demo" to visualize quantum key distribution
        </p>
        <button
          onClick={startVisualization}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
        >
          Start BB84 Demo
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{currentStep.icon}</span>
          <span className="font-semibold text-gray-800 dark:text-white text-sm">
            {currentStep.name}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Step {step + 1}/{steps.length}
          </span>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            disabled={step >= steps.length - 1}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={resetVisualization}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Qubit Visualization */}
      <div className="flex items-center justify-center gap-2 py-3 mb-2">
        {qubits.length > 0 ? (
          qubits.map((q, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-500 ${
                q.bit === 1 ? 'qubit-1' : 'qubit-0'
              }`}
              style={{
                opacity: step >= 1 ? 1 : 0.3,
                transform: step >= 1 ? 'scale(1)' : 'scale(0.8)',
              }}
            >
              {q.bit}
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-400">Click Start to see qubits</p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2">
        <div
          className="bg-blue-600 rounded-full h-1.5 transition-all duration-500"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Description */}
      <p className="text-xs text-gray-600 dark:text-gray-300 text-center">
        {currentStep.description}
      </p>

      {/* Status */}
      <div className="mt-2 text-center">
        {step >= steps.length - 1 && (
          <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">✅ Key Established Successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BB84Visualizer;