/**
 * Interactive Network Topology Component
 * Quantum Telecom Simulator
 */

import React, { useState, useRef, useEffect } from 'react';
import { Move, Zap, Circle, Link, Maximize2 } from 'lucide-react';

const InteractiveTopology = ({ status }) => {
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [draggingNode, setDraggingNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  useEffect(() => {
    // Initialize nodes
    const nodeList = [
      { id: 'alice', label: 'Alice', x: 20, y: 40, color: '#3B82F6', status: 'active', icon: '👩' },
      { id: 'bob', label: 'Bob', x: 80, y: 40, color: '#10B981', status: 'active', icon: '👨' },
      { id: 'eve', label: 'Eve', x: 50, y: 15, color: '#EF4444', status: status?.quantum_channel?.compromised ? 'active' : 'inactive', icon: '👾' },
      { id: 'router', label: 'Router', x: 35, y: 70, color: '#8B5CF6', status: 'active', icon: '🔀' },
      { id: 'switch', label: 'Switch', x: 65, y: 70, color: '#06B6D4', status: 'active', icon: '🔁' },
    ];

    setNodes(nodeList);
  }, [status]);

  const getNodeStatus = (nodeId) => {
    if (nodeId === 'eve') {
      return status?.quantum_channel?.compromised ? 'active' : 'inactive';
    }
    return 'active';
  };

  const handleMouseDown = (e, node) => {
    if (node.id === 'eve' && !status?.quantum_channel?.compromised) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    setDraggingNode(node);
    setDragOffset({
      x: e.clientX - svgRect.left - node.x,
      y: e.clientY - svgRect.top - node.y
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingNode) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, e.clientX - svgRect.left - dragOffset.x));
    const y = Math.max(5, Math.min(95, e.clientY - svgRect.top - dragOffset.y));
    setNodes(prev => prev.map(n => 
      n.id === draggingNode.id ? { ...n, x, y } : n
    ));
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  const handleNodeClick = (node) => {
    setSelectedNode(selectedNode?.id === node.id ? null : node);
  };

  // Connections
  const connections = [
    { from: 'alice', to: 'bob', color: status?.quantum_channel?.status === 'secure' ? '#10B981' : '#6B7280' },
    { from: 'alice', to: 'router', color: '#8B5CF6' },
    { from: 'bob', to: 'switch', color: '#06B6D4' },
    { from: 'router', to: 'switch', color: '#8B5CF6' },
  ];

  if (status?.quantum_channel?.compromised) {
    connections.push({ from: 'eve', to: 'alice', color: '#EF4444', dashed: true });
    connections.push({ from: 'eve', to: 'bob', color: '#EF4444', dashed: true });
  }

  return (
    <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-4 border border-gray-200 dark:border-dark-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Interactive Topology
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <span>🖱️ Drag nodes to reposition</span>
          <span className="flex items-center gap-1">
            <Link className="w-3 h-3" />
            {connections.length} links
          </span>
        </div>
      </div>

      <div 
        ref={svgRef}
        className="relative w-full h-64 bg-gradient-to-br from-gray-100/50 to-white/50 dark:from-dark-bg/50 dark:to-dark-bg/30 rounded-lg overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#E5E7EB22" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Connections */}
          {connections.map((conn, idx) => {
            const from = nodes.find(n => n.id === conn.from);
            const to = nodes.find(n => n.id === conn.to);
            if (!from || !to) return null;

            return (
              <g key={idx}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={conn.color}
                  strokeWidth="1.5"
                  strokeDasharray={conn.dashed ? '3,3' : '0'}
                  opacity="0.6"
                />
                {/* Animated data flow */}
                <circle r="1.5" fill={conn.color} opacity="0.8">
                  <animateMotion
                    dur="3s"
                    repeatCount="indefinite"
                    path={`M${from.x},${from.y} L${to.x},${to.y}`}
                  />
                </circle>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isActive = getNodeStatus(node.id) === 'active';
            const isSelected = selectedNode?.id === node.id;
            const isDragging = draggingNode?.id === node.id;

            return (
              <g
                key={node.id}
                onMouseDown={(e) => handleMouseDown(e, node)}
                onClick={() => handleNodeClick(node)}
                style={{ cursor: isActive ? 'grab' : 'default' }}
              >
                {/* Node glow */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="12"
                  fill={node.color}
                  opacity={isActive ? '0.15' : '0.05'}
                >
                  {isActive && (
                    <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite" />
                  )}
                </circle>

                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="8"
                  fill={isActive ? node.color : '#6B7280'}
                  stroke={isSelected ? '#FFFFFF' : 'none'}
                  strokeWidth="1.5"
                  opacity={isActive ? 1 : 0.5}
                />

                {/* Node icon */}
                <text
                  x={node.x}
                  y={node.y + 3}
                  textAnchor="middle"
                  fontSize="8"
                  fill="#FFFFFF"
                >
                  {node.icon || '•'}
                </text>

                {/* Status dot */}
                <circle
                  cx={node.x + 6}
                  cy={node.y - 6}
                  r="2"
                  fill={isActive ? '#22C55E' : '#6B7280'}
                >
                  {isActive && (
                    <animate attributeName="r" values="1.5;3;1.5" dur="1.5s" repeatCount="indefinite" />
                  )}
                </circle>

                {/* Label */}
                <text
                  x={node.x}
                  y={node.y + 16}
                  textAnchor="middle"
                  fontSize="4"
                  fill={isActive ? '#374151' : '#9CA3AF'}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {node.label}
                </text>

                {/* Selected info */}
                {isSelected && (
                  <foreignObject x={node.x - 20} y={node.y + 20} width="40" height="14">
                    <div className="bg-white/90 dark:bg-dark-bg/90 rounded px-1 text-center shadow-lg">
                      <div className="text-[4px] text-gray-500">
                        {isActive ? '🟢 Online' : '🔴 Offline'}
                      </div>
                    </div>
                  </foreignObject>
                )}

                {/* Dragging indicator */}
                {isDragging && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="14"
                    fill="none"
                    stroke={node.color}
                    strokeWidth="1"
                    strokeDasharray="2,2"
                    opacity="0.5"
                  />
                )}
              </g>
            );
          })}

          {/* Legend */}
          <foreignObject x="2" y="88" width="96" height="12">
            <div className="flex items-center justify-center gap-3 text-[3.5px] text-gray-400">
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
              <span>🖱️ Drag to move</span>
            </div>
          </foreignObject>
        </svg>
      </div>
    </div>
  );
};

export default InteractiveTopology;