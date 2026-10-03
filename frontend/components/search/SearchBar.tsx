'use client';

import React, { useState } from 'react';
import { Search, Sparkles, X, Loader2 } from 'lucide-react';

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

const EXAMPLE_QUERIES = [
  'Python AI Engineer in Bangalore',
  'Remote Data Scientist with SQL',
  'Junior backend developer with FastAPI',
  'Machine learning engineer with PyTorch',
  'Entry-level software engineer',
];

export default function SearchBar({
  initialQuery = '',
  onSearch,
  isLoading = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    onSearch(example);
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Primary search form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center rounded-2xl bg-white border-2 border-slate-200 shadow-md hover:border-blue-400 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
          <div className="pl-4 sm:pl-5 text-blue-600">
            <Sparkles className="h-6 w-6" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe your ideal role in natural language (e.g. 'Python AI engineer in Bangalore with 0-2 years experience')"
            className="w-full bg-transparent px-3 sm:px-4 py-4 sm:py-5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-slate-400 hover:text-slate-600 transition mr-1"
              aria-label="Clear query"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          <div className="pr-2 sm:pr-3">
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 sm:px-7 py-3 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Suggested prompts */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
        <span className="font-semibold text-slate-700">Try searching:</span>
        {EXAMPLE_QUERIES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => handleExampleClick(example)}
            className="rounded-full bg-white px-3 py-1 text-slate-600 border border-slate-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition cursor-pointer font-medium"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
