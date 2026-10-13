/**
 * Multi-Node Quantum Network Component
 * Quantum Telecom Simulator
 */

import React, { useState, useEffect } from 'react';
import { Network, Circle, Zap, Link, Activity } from 'lucide-react';

const MultiNodeNetwork = ({ status }) => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    // Create network nodes
    const nodeList = [
      { id: 'alice', name: 'Alice', x: 15, y: 45, color: '#3B82F6', status: status?.nodes?.alice?.status || 'active' },
      { id: 'bob', name: 'Bob', x: 85, y: 45, color: '#10B981', status: status?.nodes?.bob?.status || 'active' },
      { id: 'eve', name: 'Eve', x: 50, y: 20, color: '#EF4444', status: status?.quantum_channel?.compromised ? 'active' : 'inactive' },
      { id: 'node1', name: 'Node A', x: 30, y: 75, color: '#8B5CF6', status: 'active' },
      { id: 'node2', name: 'Node B', x: 70, y: 75, color: '#06B6D4', status: 'active' },
      { id: 'node3', name: 'Node C', x: 50, y: 90, color: '#EC4899', status: 'active' },
    ];

    setNodes(nodeList);

    // Create connections
    const connList = [
      { from: 'alice', to: 'bob', type: 'quantum', secure: status?.quantum_channel?.status === 'secure' },
      { from: 'alice', to: 'node1', type: 'classical', secure: true },
      { from: 'bob', to: 'node2', type: 'classical', secure: true },
      { from: 'node1', to: 'node3', type: 'classical', secure: true },
      { from: 'node2', to: 'node3', type: 'classical', secure: true },
    ];

    // Add Eve connections if active
    if (status?.quantum_channel?.compromised) {
      connList.push({ from: 'eve', to: 'alice', type: 'eavesdrop', secure: false });
      connList.push({ from: 'eve', to: 'bob', type: 'eavesdrop', secure: false });
    }

    setConnections(connList);
  }, [status]);

  const getNodeColor = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    return node?.color || '#6B7280';
  };

  const getNodeStatus = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (nodeId === 'eve') {
      return status?.quantum_channel?.compromised ? 'active' : 'inactive';
    }
    return node?.status || 'active';
  };

  return (
    <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-4 border border-gray-200 dark:border-dark-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Quantum Network Topology
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            {nodes.filter(n => getNodeStatus(n.id) === 'active').length} active
          </span>
          <span className="flex items-center gap-1">
            <Link className="w-3 h-3" />
            {connections.length} connections
          </span>
        </div>
      </div>

      <div className="relative w-full h-48 bg-gradient-to-br from-gray-100/50 to-white/50 dark:from-dark-bg/50 dark:to-dark-bg/30 rounded-lg overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Connections */}
          {connections.map((conn, idx) => {
            const from = nodes.find(n => n.id === conn.from);
            const to = nodes.find(n => n.id === conn.to);
            if (!from || !to) return null;

            const isEve = conn.type === 'eavesdrop';
            const isSecure = conn.secure;

            return (
              <g key={idx}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={isEve ? '#EF4444' : (isSecure ? '#10B981' : '#6B7280')}
                  strokeWidth={isEve ? '2' : '1.5'}
                  strokeDasharray={isEve ? '4,4' : (isSecure ? '0' : '4,4')}
                  opacity={isEve ? 0.8 : 0.6}
                />
                {isEve && (
                  <>
                    {/* Warning indicators along the line */}
                    {[0.3, 0.5, 0.7].map((t, i) => (
                      <circle
                        key={i}
                        cx={from.x + (to.x - from.x) * t}
                        cy={from.y + (to.y - from.y) * t}
                        r="1.5"
                        fill="#EF4444"
                        opacity="0.6"
                      >
                        <animate attributeName="opacity" values="0.2;1;0.2" dur="1s" repeatCount="indefinite" />
                      </circle>
                    ))}
                  </>
                )}
                {isSecure && (
                  <circle
                    cx={(from.x + to.x) / 2}
                    cy={(from.y + to.y) / 2 - 3}
                    r="1.5"
                    fill="#10B981"
                    opacity="0.5"
                  >
                    <animate attributeName="r" values="0;3;0" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isActive = getNodeStatus(node.id) === 'active';
            const isEve = node.id === 'eve';
            const isSelected = selectedNode === node.id;

            return (
              <g
                key={node.id}
                onClick={() => setSelectedNode(isSelected ? null : node.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* Node glow */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="10"
                  fill={node.color}
                  opacity={isActive ? '0.2' : '0.05'}
                >
                  {isActive && (
                    <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
                  )}
                </circle>

                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="7"
                  fill={isActive ? node.color : '#6B7280'}
                  stroke={isSelected ? '#FFFFFF' : 'none'}
                  strokeWidth="1.5"
                >
                  {isActive && isEve && (
                    <animate attributeName="r" values="6;8;6" dur="0.8s" repeatCount="indefinite" />
                  )}
                </circle>

                {/* Status indicator */}
                <circle
                  cx={node.x + 5}
                  cy={node.y - 5}
                  r="2"
                  fill={isActive ? '#22C55E' : '#6B7280'}
                />

                {/* Label */}
                <text
                  x={node.x}
                  y={node.y + 14}
                  textAnchor="middle"
                  fontSize="4"
                  fill={isActive ? '#374151' : '#9CA3AF'}
                  fontWeight="bold"
                >
                  {node.name}
                  {isEve && isActive && ' 👾'}
                </text>

                {/* Subtitle */}
                {isSelected && (
                  <foreignObject x={node.x - 15} y={node.y + 18} width="30" height="12">
                    <div className="text-[4px] text-gray-400 text-center bg-white dark:bg-dark-bg rounded px-1">
                      {isActive ? '🟢 Online' : '🔴 Offline'}
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}

          {/* Legend */}
          <foreignObject x="2" y="88" width="96" height="12">
            <div className="flex items-center justify-between text-[3.5px] text-gray-400">
              <span className="flex items-center gap-0.5">
                <span className="w-2 h-0.5 bg-green-500"></span>
                Secure
              </span>
              <span className="flex items-center gap-0.5">
                <span className="w-2 h-0.5 bg-red-500 dashed"></span>
                Eavesdrop
              </span>
              <span className="flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Active
              </span>
              <span className="flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                Inactive
              </span>
            </div>
          </foreignObject>
        </svg>
      </div>

      {/* Node details */}
      {selectedNode && (
        <div className="mt-2 p-2 bg-white dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-dark-border animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getNodeColor(selectedNode) }}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {nodes.find(n => n.id === selectedNode)?.name}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className={getNodeStatus(selectedNode) === 'active' ? 'text-green-500' : 'text-gray-400'}>
                {getNodeStatus(selectedNode) === 'active' ? '🟢 Active' : '⚪ Inactive'}
              </span>
              <span className="text-[10px]">
                {connections.filter(c => c.from === selectedNode || c.to === selectedNode).length} connections
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiNodeNetwork;