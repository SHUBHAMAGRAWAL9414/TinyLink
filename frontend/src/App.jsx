import React from 'react';
import Header from './components/Header';
import { ToastProvider } from './components/ToastContainer';

export default function App({ children }) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-blue-50 to-pink-50 text-slate-800">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8 animate-fadeIn">
          {children}
        </main>
        <footer className="text-center py-6 text-sm text-slate-600 opacity-90">
          TinyLink — small url shortener
        </footer>
      </div>
    </ToastProvider>
  );
}
