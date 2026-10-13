/**
 * Network Graph Visualization Component
 * Quantum Telecom Simulator - Phase 5
 */

import React from 'react';

const NetworkGraph = ({ status }) => {
  const nodes = status?.nodes || {};
  const alice = nodes.alice || {};
  const bob = nodes.bob || {};
  const eve = nodes.eve || {};

  return (
    <div className="relative w-full h-48 bg-gray-50 rounded-lg overflow-hidden">
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="flex items-center justify-center gap-8 mb-4">
            {/* Alice Node */}
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                alice.status === 'active' ? 'bg-blue-500' : 'bg-gray-400'
              }`}>
                A
              </div>
              <span className="text-xs mt-1">Alice</span>
              <span className={`text-xs ${alice.has_key ? 'text-green-500' : 'text-gray-400'}`}>
                {alice.has_key ? '🔑' : '🔓'}
              </span>
            </div>

            {/* Connection Line */}
            <div className="flex-1 h-0.5 w-16 bg-gray-300 relative">
              <div className={`absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs ${
                alice.has_key ? 'text-green-500' : 'text-gray-400'
              }`}>
                {alice.has_key ? '🔒' : '⚡'}
              </div>
            </div>

            {/* Bob Node */}
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                bob.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
              }`}>
                B
              </div>
              <span className="text-xs mt-1">Bob</span>
              <span className={`text-xs ${bob.has_key ? 'text-green-500' : 'text-gray-400'}`}>
                {bob.has_key ? '🔑' : '🔓'}
              </span>
            </div>
          </div>

          {/* Eve (if active) */}
          {eve.status === 'active' && (
            <div className="flex justify-center mt-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-red-100 border border-red-300 rounded-full">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-xs text-red-700 font-medium">⚠️ Eve Active</span>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="mt-3 text-xs text-gray-500">
            {alice.has_key ? '🔑 Quantum Key Established' : '⏳ No Quantum Key'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkGraph;