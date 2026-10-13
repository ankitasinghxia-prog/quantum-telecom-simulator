/**
 * Sound Manager Component
 * Quantum Telecom Simulator
 */

import React, { useEffect, useRef } from 'react';

// Audio context for generating sounds without external files
const SoundManager = ({ enabled = true }) => {
  const audioContextRef = useRef(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playTone = (frequency, duration, type = 'sine', volume = 0.3) => {
    if (!enabled || !audioContextRef.current) return;
    
    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  };

  const playKeyGenerated = () => {
    playTone(523, 0.15, 'sine', 0.3);
    setTimeout(() => playTone(659, 0.15, 'sine', 0.3), 150);
    setTimeout(() => playTone(784, 0.2, 'sine', 0.4), 300);
  };

  const playMessageSent = () => {
    playTone(800, 0.1, 'sine', 0.2);
    setTimeout(() => playTone(1000, 0.1, 'sine', 0.2), 100);
  };

  const playAttackDetected = () => {
    playTone(440, 0.3, 'sawtooth', 0.3);
    setTimeout(() => playTone(330, 0.3, 'sawtooth', 0.3), 300);
    setTimeout(() => playTone(220, 0.5, 'sawtooth', 0.4), 600);
  };

  const playKeyCompromised = () => {
    playTone(300, 0.2, 'square', 0.2);
    setTimeout(() => playTone(200, 0.2, 'square', 0.2), 200);
    setTimeout(() => playTone(150, 0.4, 'square', 0.3), 400);
  };

  const playError = () => {
    playTone(200, 0.3, 'sawtooth', 0.2);
  };

  return null; // No UI, just sound functions
};

// Hook to use sound effects in components
export const useSound = () => {
  const [audioContext, setAudioContext] = React.useState(null);

  React.useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(ctx);
    return () => {
      if (ctx) ctx.close();
    };
  }, []);

  const playTone = React.useCallback((frequency, duration, type = 'sine', volume = 0.3) => {
    if (!audioContext) return;
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
      // Silently fail
    }
  }, [audioContext]);

  const playKeyGenerated = React.useCallback(() => {
    playTone(523, 0.15);
    setTimeout(() => playTone(659, 0.15), 150);
    setTimeout(() => playTone(784, 0.2), 300);
  }, [playTone]);

  const playMessageSent = React.useCallback(() => {
    playTone(800, 0.1);
    setTimeout(() => playTone(1000, 0.1), 100);
  }, [playTone]);

  const playAttackDetected = React.useCallback(() => {
    playTone(440, 0.3, 'sawtooth', 0.3);
    setTimeout(() => playTone(330, 0.3, 'sawtooth', 0.3), 300);
    setTimeout(() => playTone(220, 0.5, 'sawtooth', 0.4), 600);
  }, [playTone]);

  const playKeyCompromised = React.useCallback(() => {
    playTone(300, 0.2, 'square', 0.2);
    setTimeout(() => playTone(200, 0.2, 'square', 0.2), 200);
    setTimeout(() => playTone(150, 0.4, 'square', 0.3), 400);
  }, [playTone]);

  const playError = React.useCallback(() => {
    playTone(200, 0.3, 'sawtooth', 0.2);
  }, [playTone]);

  return {
    playKeyGenerated,
    playMessageSent,
    playAttackDetected,
    playKeyCompromised,
    playError
  };
};

export default SoundManager;