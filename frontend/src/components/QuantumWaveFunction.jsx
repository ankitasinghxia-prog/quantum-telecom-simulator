/**
 * Quantum Wave Function Visualization Component
 * Quantum Telecom Simulator
 */

import React, { useEffect, useRef } from 'react';

const QuantumWaveFunction = ({ status }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    const width = canvas.width = rect.width || 500;
    const height = canvas.height = 150;

    const isSecure = status?.quantum_channel?.status === 'secure';
    const isCompromised = status?.quantum_channel?.compromised;

    const getColor = (t, i) => {
      if (isCompromised) {
        const r = 200 + 55 * Math.sin(t * 2 + i);
        return `rgb(${r}, 50, 50)`;
      }
      if (isSecure) {
        const g = 150 + 105 * Math.sin(t * 1.5 + i * 0.5);
        return `rgb(50, ${g}, 150)`;
      }
      const b = 150 + 105 * Math.sin(t * 1.2 + i * 0.7);
      return `rgb(50, 100, ${b})`;
    };

    // Create wave points
    const points = 200;
    const timeOffset = Date.now() / 1000;

    const drawWave = () => {
      const time = Date.now() / 1000;
      ctx.clearRect(0, 0, width, height);

      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      if (isCompromised) {
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.1)');
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
      } else if (isSecure) {
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.1)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)');
      } else {
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw multiple wave functions
      const numWaves = isCompromised ? 3 : 2;
      
      for (let w = 0; w < numWaves; w++) {
        const amplitude = 30 + w * 10;
        const frequency = 0.02 + w * 0.01;
        const phase = w * 1.5 + (isCompromised ? 1 : 0);
        
        // Probability density (wavefunction squared)
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
          const x = (i / points) * width;
          const t = (i / points) * Math.PI * 4;
          const wave = Math.sin(t * frequency + time * 2 + phase) * Math.exp(-Math.pow((t - Math.PI * 2) / 3, 2));
          const y = height / 2 + wave * amplitude * 0.8;
          
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        
        const alpha = 0.3 + w * 0.1;
        ctx.strokeStyle = getColor(time, w);
        ctx.lineWidth = 2 + w * 0.5;
        ctx.shadowColor = getColor(time, w);
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Fill area under wave
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = getColor(time, w) + '20';
        ctx.fill();

        // Probability dots (particle positions)
        for (let i = 0; i < 20 + w * 10; i++) {
          const x = Math.random() * width;
          const t = (x / width) * Math.PI * 4;
          const wave = Math.sin(t * frequency + time * 2 + phase) * Math.exp(-Math.pow((t - Math.PI * 2) / 3, 2));
          const y = height / 2 + wave * amplitude * 0.8;
          const size = 1 + Math.random() * 1.5;
          
          const alpha = 0.2 + Math.random() * 0.3;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = getColor(time, w) + Math.floor(alpha * 255).toString(16).padStart(2, '0');
          ctx.fill();
        }
      }

      // Status text
      ctx.fillStyle = isCompromised ? '#EF4444' : (isSecure ? '#10B981' : '#6B7280');
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        isCompromised ? '⚠️ Wavefunction Collapse - Eavesdropping Detected!' :
        isSecure ? '🔒 Quantum Superposition - Secure Channel' :
        '⚛️ Idle - No Quantum State',
        width / 2, height - 12
      );

      // Qubit state indicator
      const stateColors = isCompromised ? ['#EF4444', '#EF4444'] : (isSecure ? ['#10B981', '#3B82F6'] : ['#6B7280', '#6B7280']);
      const stateLabels = isCompromised ? ['|0⟩', '|1⟩ (Compromised)'] : (isSecure ? ['|0⟩', '|1⟩'] : ['|0⟩', '|1⟩']);
      
      for (let i = 0; i < 2; i++) {
        const x = 30 + i * 90;
        const y = 20;
        const isActive = isSecure || isCompromised;
        
        ctx.shadowColor = stateColors[i];
        ctx.shadowBlur = isActive ? 10 : 0;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? stateColors[i] : '#6B7280';
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(stateLabels[i], x, y + 22);
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '6px Arial';
        ctx.fillText(i === 0 ? 'Base: +' : 'Base: x', x, y + 30);
      }

      // Probability indicator
      const prob = isSecure ? 0.5 : (isCompromised ? 0.8 : 0);
      const probX = width - 80;
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '8px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('P(|1⟩)', probX, 18);
      
      ctx.fillStyle = '#E5E7EB';
      ctx.fillRect(probX, 22, 60, 6);
      ctx.fillStyle = isCompromised ? '#EF4444' : (isSecure ? '#10B981' : '#6B7280');
      ctx.fillRect(probX, 22, 60 * prob, 6);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '6px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(prob * 100)}%`, probX + 30, 26);

      animationRef.current = requestAnimationFrame(drawWave);
    };

    drawWave();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [status]);

  return <canvas ref={canvasRef} className="w-full h-36 rounded-lg" />;
};

export default QuantumWaveFunction;