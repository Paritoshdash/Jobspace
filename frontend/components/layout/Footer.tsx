import React from 'react';
import Link from 'next/link';
import { Sparkles, Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-white text-xs">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-slate-800">JobSpace</span>
          <span>— AI-Powered Job Intelligence & Semantic Vector Search</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <div className="flex items-center gap-1">
            <Terminal className="h-3.5 w-3.5" />
            <span>FastAPI + PostgreSQL + pgvector + Qwen3 14B</span>
          </div>
          <span>•</span>
          <Link href="/" className="hover:text-slate-700 transition">
            Search
          </Link>
          <Link href="/saved" className="hover:text-slate-700 transition">
            Saved
          </Link>
          <Link href="/applications" className="hover:text-slate-700 transition">
            Applications
          </Link>
        </div>
      </div>
    </footer>
  );
}
