/**
 * Screenshot Button Component
 * Quantum Telecom Simulator
 */

import React, { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

const ScreenshotButton = ({ targetRef, filename = 'quantum-dashboard' }) => {
  const [isCapturing, setIsCapturing] = useState(false);

  const captureScreenshot = async () => {
    if (!targetRef?.current) {
      alert('No target element found!');
      return;
    }

    setIsCapturing(true);

    try {
      const canvas = await html2canvas(targetRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#0F172A' : '#F9FAFB',
      });

      const link = document.createElement('a');
      link.download = `${filename}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

    } catch (error) {
      console.error('Screenshot failed:', error);
      alert('Failed to capture screenshot. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <button
      onClick={captureScreenshot}
      disabled={isCapturing}
      className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 dark:bg-dark-bg text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition disabled:opacity-50 text-sm"
      title="Capture Screenshot"
    >
      {isCapturing ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Capturing...
        </>
      ) : (
        <>
          <Camera className="w-4 h-4" />
          Screenshot
        </>
      )}
    </button>
  );
};

export default ScreenshotButton;