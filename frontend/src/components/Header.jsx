import React from 'react';
import { Link } from 'react-router-dom';

export default function Header(){
  return (
    <header className="bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-3">
        <Link to="/" className="flex items-center gap-3">
          <span className="text-2xl">🔗</span>
          <span className="text-2xl font-extrabold tracking-wide gradient-text">TinyLink</span>
        </Link>
        <nav className="ml-auto">
          <a href="/healthz" className="inline-block text-sm px-3 py-1 rounded-full border border-white/30 hover:bg-white/10">Health</a>
        </nav>
      </div>
    </header>
  );
}
