/**
 * Login Simulation Component
 * Quantum Telecom Simulator
 */

import React, { useState } from 'react';
import { User, Lock, Shield, Eye, EyeOff } from 'lucide-react';

const roles = [
  { id: 'alice', label: 'Alice', color: 'blue', icon: '👩' },
  { id: 'bob', label: 'Bob', color: 'green', icon: '👨' },
  { id: 'eve', label: 'Eve (Attacker)', color: 'red', icon: '👩‍💻' },
];

const LoginSimulation = ({ onLogin, isLoggedIn, currentUser }) => {
  const [selectedRole, setSelectedRole] = useState('alice');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!password) {
      alert('Please enter a password (mock)');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onLogin) onLogin(selectedRole);
    }, 1000);
  };

  const handleLogout = () => {
    if (onLogin) onLogin(null);
  };

  if (isLoggedIn && currentUser) {
    const role = roles.find(r => r.id === currentUser);
    return (
      <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-100 dark:bg-dark-bg rounded-lg">
        <span className="text-lg">{role?.icon || '👤'}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {role?.label || currentUser}
        </span>
        <button
          onClick={handleLogout}
          className="text-xs text-red-500 hover:text-red-600 transition"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        className="px-2 py-1.5 bg-gray-100 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.icon} {role.label}
          </option>
        ))}
      </select>

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (mock)"
          className="px-2 py-1.5 bg-gray-100 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </button>
      </div>

      <button
        onClick={handleLogin}
        disabled={isLoading}
        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 text-sm"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Shield className="w-3 h-3" />
        )}
        Login
      </button>
    </div>
  );
};

export default LoginSimulation;