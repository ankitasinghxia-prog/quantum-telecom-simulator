/**
 * Quantum Particle Background - Animated Background
 * Quantum Telecom Simulator
 */

import React, { useEffect, useRef } from 'react';

const QuantumBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particles = [];
    const numParticles = 60;

    const colors = ['#3B82F6', '#8B5CF6', '#06B6D4', '#EC4899', '#10B981'];

    for (let i = 0; i < numParticles; i++) {
      const particle = document.createElement('div');
      particle.className = 'quantum-particle';
      const size = Math.random() * 4 + 2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      const tx = (Math.random() - 0.5) * 200;
      const ty = (Math.random() - 0.5) * 200;
      const duration = Math.random() * 20 + 15;

      particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        left: ${x}px;
        top: ${y}px;
        --tx: ${tx}px;
        --ty: ${ty}px;
        animation-duration: ${duration}s;
        animation-delay: ${Math.random() * 10}s;
        box-shadow: 0 0 ${size * 2}px ${color}40;
      `;

      container.appendChild(particle);
      particles.push(particle);
    }

    const handleResize = () => {
      // No-op: particles will reposition naturally
    };

    window.addEventListener('resize', handleResize);

    return () => {
      particles.forEach(p => p.remove());
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <div ref={containerRef} className="quantum-bg" />;
};

export default QuantumBackground;