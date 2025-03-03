'use client';

import { useState } from 'react';

export const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 实现搜索功能
    console.log('Searching for:', searchTerm);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="搜索小说名称、作者或关键词..."
          className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
        />
        <svg
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          搜索
        </button>
      </div>
    </form>
  );
}; 