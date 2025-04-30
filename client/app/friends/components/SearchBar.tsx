"use client";

import { Search, X } from "lucide-react";

type SearchBarProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

export default function SearchBar({
  searchQuery,
  setSearchQuery,
}: SearchBarProps) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-5 h-5 text-gray-400" />
      </div>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-cosmic-purple-500 dark:focus:ring-cosmic-purple-400 focus:border-transparent"
        placeholder="Search friends by username"
      />

      {searchQuery && (
        <button
          onClick={() => setSearchQuery("")}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
