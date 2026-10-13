/**
 * Message Search & Filter Component
 * Quantum Telecom Simulator
 */

import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

const MessageSearch = ({ messages, onFiltered }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSender, setFilterSender] = useState('all');

  const handleSearch = (term) => {
    setSearchTerm(term);
    applyFilters(term, filterSender);
  };

  const handleFilter = (sender) => {
    setFilterSender(sender);
    applyFilters(searchTerm, sender);
  };

  const applyFilters = (term, sender) => {
    let filtered = messages || [];
    
    if (term.trim()) {
      filtered = filtered.filter(m => 
        m.message?.toLowerCase().includes(term.toLowerCase()) ||
        m.sender?.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    if (sender !== 'all') {
      filtered = filtered.filter(m => m.sender === sender);
    }
    
    if (onFiltered) onFiltered(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterSender('all');
    if (onFiltered) onFiltered(messages);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex-1 relative min-w-[120px]">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search messages..."
          className="w-full pl-7 pr-2 py-1 bg-gray-100 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <select
        value={filterSender}
        onChange={(e) => handleFilter(e.target.value)}
        className="px-2 py-1 bg-gray-100 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All</option>
        <option value="Alice">Alice</option>
        <option value="Bob">Bob</option>
      </select>
      {(searchTerm || filterSender !== 'all') && (
        <button
          onClick={clearFilters}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default MessageSearch;