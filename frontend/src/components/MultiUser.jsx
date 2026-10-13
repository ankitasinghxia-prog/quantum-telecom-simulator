/**
 * Multi-User Support Component
 * Quantum Telecom Simulator
 */

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserMinus, Circle, MoreVertical } from 'lucide-react';

const defaultUsers = [
  { id: 'alice', name: 'Alice', role: 'sender', color: '#3B82F6', status: 'online' },
  { id: 'bob', name: 'Bob', role: 'receiver', color: '#10B981', status: 'online' },
  { id: 'eve', name: 'Eve', role: 'attacker', color: '#EF4444', status: 'offline' },
];

const MultiUser = ({ onUserSelect, currentUser, onUserStatusChange }) => {
  const [users, setUsers] = useState(defaultUsers);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleUserStatus = (userId) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const newStatus = user.status === 'online' ? 'offline' : 'online';
        if (onUserStatusChange) onUserStatusChange(userId, newStatus);
        return { ...user, status: newStatus };
      }
      return user;
    }));
  };

  const getStatusColor = (status) => {
    return status === 'online' ? 'bg-green-500' : 'bg-gray-400';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-dark-bg rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm"
      >
        <Users className="w-4 h-4 text-blue-500" />
        <span className="text-gray-700 dark:text-gray-300">Users</span>
        <span className="text-xs text-gray-400">
          {users.filter(u => u.status === 'online').length} online
        </span>
      </button>

      {isExpanded && (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-dark-card rounded-xl shadow-xl border border-gray-200 dark:border-dark-border p-2 min-w-[200px] z-50 animate-slide-up">
          <div className="flex items-center justify-between mb-2 px-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Active Users</span>
            <span className="text-xs text-gray-400">
              {users.filter(u => u.status === 'online').length}/{users.length}
            </span>
          </div>
          
          {users.map((user) => (
            <div
              key={user.id}
              className={`flex items-center gap-2 p-2 rounded-lg transition cursor-pointer ${
                currentUser === user.id ? 'bg-blue-500/10' : 'hover:bg-gray-100 dark:hover:bg-dark-bg'
              }`}
              onClick={() => {
                if (onUserSelect) onUserSelect(user.id);
                setIsExpanded(false);
              }}
            >
              <div className="relative">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name[0]}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-dark-bg ${getStatusColor(user.status)}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.name}
                </p>
                <p className="text-xs text-gray-400 capitalize">{user.role}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleUserStatus(user.id);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              >
                {user.status === 'online' ? <UserMinus className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiUser;