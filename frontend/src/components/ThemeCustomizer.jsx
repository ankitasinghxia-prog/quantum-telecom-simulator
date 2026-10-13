/**
 * Theme Customizer Component
 * Quantum Telecom Simulator
 */

import React, { useState, useEffect } from 'react';
import { Palette, X, Check } from 'lucide-react';

const presetThemes = [
  { name: 'Quantum Blue', primary: '#3B82F6', secondary: '#8B5CF6', accent: '#06B6D4' },
  { name: 'Quantum Green', primary: '#10B981', secondary: '#34D399', accent: '#06B6D4' },
  { name: 'Quantum Purple', primary: '#8B5CF6', secondary: '#A78BFA', accent: '#EC4899' },
  { name: 'Quantum Red', primary: '#EF4444', secondary: '#F87171', accent: '#F59E0B' },
  { name: 'Quantum Cyan', primary: '#06B6D4', secondary: '#22D3EE', accent: '#8B5CF6' },
  { name: 'Quantum Pink', primary: '#EC4899', secondary: '#F472B6', accent: '#8B5CF6' },
];

const ThemeCustomizer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('quantum-theme');
    return saved ? JSON.parse(saved) : presetThemes[0];
  });

  useEffect(() => {
    // Apply theme to root
    const root = document.documentElement;
    root.style.setProperty('--quantum-primary', currentTheme.primary);
    root.style.setProperty('--quantum-secondary', currentTheme.secondary);
    root.style.setProperty('--quantum-accent', currentTheme.accent);
    localStorage.setItem('quantum-theme', JSON.stringify(currentTheme));
  }, [currentTheme]);

  const applyTheme = (theme) => {
    setCurrentTheme(theme);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg transition relative"
        title="Customize Theme"
      >
        <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <div 
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-dark-bg"
          style={{ backgroundColor: currentTheme.primary }}
        />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-slide-up">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-dark-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Customize Theme
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {presetThemes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => applyTheme(theme)}
                  className="p-3 rounded-lg border-2 transition-all hover:scale-[1.02] text-left"
                  style={{
                    borderColor: currentTheme === theme ? theme.primary : 'transparent',
                    background: `linear-gradient(135deg, ${theme.primary}20, ${theme.secondary}20)`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.primary }} />
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.secondary }} />
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.accent }} />
                    {currentTheme === theme && (
                      <Check className="w-4 h-4 text-green-500 ml-auto" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{theme.name}</p>
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">
              Theme is saved automatically
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ThemeCustomizer;