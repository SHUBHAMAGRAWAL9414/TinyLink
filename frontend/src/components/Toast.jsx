import React, { useEffect } from 'react';

// Simple Toast component that slides in from the top-right and auto-dismisses.
// Props:
// - message: string to display
// - type: 'success' | 'error' | 'info' (controls gradient)
// - onClose: callback to remove the toast
// - duration: milliseconds before auto-dismiss (optional, default 3000)
export default function Toast({ id, message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    const t = setTimeout(() => onClose && onClose(id), duration);
    return () => clearTimeout(t);
  }, [id, onClose, duration]);

  const bg = {
    success: 'bg-gradient-to-r from-green-400 to-emerald-500',
    error: 'bg-gradient-to-r from-red-400 to-rose-500',
    info: 'bg-gradient-to-r from-sky-400 to-indigo-500'
  }[type];

  return (
    <div
      className={`max-w-sm w-full ${bg} text-white p-4 rounded-lg shadow-lg flex items-start gap-3 animate-slideInRight`}
      role="status"
      aria-live="polite"
    >
      <div className="text-2xl leading-none">{type === 'success' ? '🎉' : type === 'error' ? '⚠️' : 'ℹ️'}</div>
      <div className="flex-1 text-sm">
        <div className="font-medium">{message}</div>
      </div>
      <button
        aria-label="Close"
        className="text-white opacity-90 hover:opacity-100 ml-2"
        onClick={() => onClose && onClose(id)}
      >
        ×
      </button>
    </div>
  );
}
