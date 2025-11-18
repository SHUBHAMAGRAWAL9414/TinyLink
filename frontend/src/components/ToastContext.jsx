import React, { createContext, useContext } from 'react';

// ToastContext holds toast API. This file only exports the context and the hook
// so that components can import the hook from a module that only exports
// functions/values (not React components) — avoiding react-refresh rules.

export const ToastContext = createContext(null);

export function useToast(){
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

export default ToastContext;
