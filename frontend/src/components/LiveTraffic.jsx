/**
 * Live Network Traffic Flow Component
 * Quantum Telecom Simulator
 */

import React, { useState, useEffect, useRef } from 'react';
import { Activity, Zap, Shield, AlertTriangle } from 'lucide-react';

const LiveTraffic = ({ status, onMessageSent }) => {
  const canvasRef = useRef(null);
  const packetsRef = useRef([]);
  const animationRef = useRef(null);
  const [packetCount, setPacketCount] = useState(0);
  const [avgSpeed, setAvgSpeed] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    const width = canvas.width = rect.width || 600;
    const height = canvas.height = 150;

    // Packet class
    class Packet {
      constructor() {
        this.x = 20;
        this.y = Math.random() * (height - 40) + 20;
        this.size = 4 + Math.random() * 6;
        this.speed = 0.8 + Math.random() * 1.5;
        this.color = Math.random() > 0.5 ? '#3B82F6' : '#10B981';
        this.isEncrypted = Math.random() > 0.3;
        this.alpha = 0.7 + Math.random() * 0.3;
        this.trail = [];
        this.pulse = 0;
        this.type = Math.random() > 0.7 ? 'data' : 'key';
        this.id = Date.now() + Math.random();
      }

      update() {
        this.x += this.speed;
        this.pulse += 0.05;
        this.trail.push({ x: this.x, y: this.y, size: this.size });
        if (this.trail.length > 15) this.trail.shift();
        return this.x < width - 20;
      }

      draw(ctx) {
        // Draw trail
        this.trail.forEach((t, i) => {
          const alpha = (i / this.trail.length) * 0.2;
          const size = t.size * (i / this.trail.length);
          ctx.beginPath();
          ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
          ctx.fillStyle = this.color + Math.floor(alpha * 80).toString(16).padStart(2, '0');
          ctx.fill();
        });

        // Glow effect
        const glowSize = this.size * 2 + Math.sin(this.pulse) * 2;
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowSize);
        glow.addColorStop(0, this.color + '80');
        glow.addColorStop(1, this.color + '00');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Core packet
        const gradient = ctx.createRadialGradient(
          this.x - this.size * 0.3, this.y - this.size * 0.3, 0,
          this.x, this.y, this.size
        );
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.3, this.color);
        gradient.addColorStop(1, this.color + 'CC');
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Encryption ring
        if (this.isEncrypted) {
          ctx.strokeStyle = '#FFFFFF88';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 4]);
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size + 3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Type indicator
        if (this.type === 'key') {
          ctx.fillStyle = '#F59E0B';
          ctx.font = '6px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('🔑', this.x, this.y + 2);
        }
      }
    }

    // Spawn packets based on network activity
    const spawnPacket = () => {
      const maxPackets = status?.quantum_channel?.status === 'secure' ? 25 : 40;
      if (packetsRef.current.length < maxPackets) {
        packetsRef.current.push(new Packet());
        setPacketCount(prev => prev + 1);
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.strokeStyle = '#E5E7EB22';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 30) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      // Draw connection line
      const isSecure = status?.quantum_channel?.status === 'secure';
      const isCompromised = status?.quantum_channel?.compromised;
      
      const gradient = ctx.createLinearGradient(20, 0, width - 20, 0);
      if (isCompromised) {
        gradient.addColorStop(0, '#EF4444');
        gradient.addColorStop(0.5, '#EF444488');
        gradient.addColorStop(1, '#EF4444');
      } else if (isSecure) {
        gradient.addColorStop(0, '#10B981');
        gradient.addColorStop(0.5, '#10B98188');
        gradient.addColorStop(1, '#10B981');
      } else {
        gradient.addColorStop(0, '#6B7280');
        gradient.addColorStop(0.5, '#6B728044');
        gradient.addColorStop(1, '#6B7280');
      }
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(20, height / 2);
      ctx.lineTo(width - 20, height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Alice node
      const drawNode = (x, label, color, isActive = true) => {
        const pulse = Math.sin(Date.now() / 1000) * 3 + 15;
        
        // Glow
        const glow = ctx.createRadialGradient(x, height / 2, 0, x, height / 2, pulse + 10);
        glow.addColorStop(0, color + '40');
        glow.addColorStop(1, color + '00');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, height / 2, pulse + 10, 0, Math.PI * 2);
        ctx.fill();

        // Node circle
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(x, height / 2, 14, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? color : '#6B7280';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Border
        ctx.strokeStyle = '#FFFFFF44';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, height / 2, 14, 0, Math.PI * 2);
        ctx.stroke();

        // Label
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, height / 2 + 26);

        // Status dot
        ctx.beginPath();
        ctx.arc(x, height / 2 - 16, 4, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? '#22C55E' : '#EF4444';
        ctx.fill();

        // Subtitle
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '8px Arial';
        const subtext = label === 'Alice' ? (status?.nodes?.alice?.has_key ? '🔑 Key' : '⏳ Idle') :
                       label === 'Bob' ? (status?.nodes?.bob?.has_key ? '🔑 Key' : '⏳ Idle') :
                       label === 'Eve' ? (isCompromised ? '⚠️ Active' : '💤 Inactive') : '';
        ctx.fillText(subtext, x, height / 2 + 38);
      };

      drawNode(20, 'Alice', '#3B82F6', status?.nodes?.alice?.status === 'active');
      
      // Eve node (if compromised)
      if (isCompromised) {
        drawNode(width / 2, 'Eve 👾', '#EF4444', true);
        // Attack alert
        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ INTERCEPTING', width / 2, height / 2 - 25);
      }

      drawNode(width - 20, 'Bob', '#10B981', status?.nodes?.bob?.status === 'active');

      // Update and draw packets
      const speeds = packetsRef.current.map(p => p.speed);
      const avg = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;
      setAvgSpeed(parseFloat(avg.toFixed(2)));

      packetsRef.current = packetsRef.current.filter(packet => packet.update());
      packetsRef.current.forEach(packet => packet.draw(ctx));

      // Speed indicator
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '9px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`📊 ${packetsRef.current.length} packets | ⚡ ${avgSpeed.toFixed(1)} p/s`, 10, height - 8);

      animationRef.current = requestAnimationFrame(animate);
    };

    // Spawn packets based on activity
    const spawnInterval = setInterval(() => {
      const isActive = status?.quantum_channel?.status === 'secure';
      const count = isActive ? 3 : 1;
      for (let i = 0; i < count; i++) {
        spawnPacket();
      }
    }, 200);

    animate();

    // Handle resize
    const handleResize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width || 600;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(spawnInterval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [status]);

  return (
    <div className="relative bg-gray-50 dark:bg-dark-bg rounded-xl overflow-hidden border border-gray-200 dark:border-dark-border">
      <div className="absolute top-2 left-3 flex items-center gap-4 z-10">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${status?.quantum_channel?.status === 'secure' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-[10px] text-gray-500 dark:text-gray-400">
            {status?.quantum_channel?.status === 'secure' ? '🟢 Secure' : 
             status?.quantum_channel?.compromised ? '🔴 Compromised' : '⚪ Idle'}
          </span>
        </div>
        <span className="text-[10px] text-gray-400">
          📦 {packetCount} total
        </span>
        <span className="text-[10px] text-gray-400">
          ⚡ {avgSpeed.toFixed(1)} p/s
        </span>
      </div>
      <canvas ref={canvasRef} className="w-full h-36" />
    </div>
  );
};

export default LiveTraffic;