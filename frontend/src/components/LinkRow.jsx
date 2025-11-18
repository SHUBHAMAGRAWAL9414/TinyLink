import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from './ToastContext';

function truncate(s, n=60){ return s.length > n ? s.slice(0,n-3)+'...' : s; }

export default function LinkRow({ row, onDelete }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  // Prefer the backend API base (set via Vite env VITE_API_BASE) so short links
  // point to the backend domain which handles server-side redirects. Fallback
  // to the current origin when the env variable is not set (local dev).
  const apiBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || window.location.origin;
  const short = `${apiBase.replace(/\/$/, '')}/${row.code}`;

  async function handleCopy(){
    try {
      await navigator.clipboard.writeText(short);
      setCopied(true);
      toast('Link copied to clipboard! 📋', 'success');
      setTimeout(()=>setCopied(false), 2000);
    } catch {
      toast('Unable to copy to clipboard', 'error');
    }
  }

  return (
    <tr className="odd:bg-white even:bg-slate-50 hover:shadow-sm transition-shadow transform hover:-translate-y-0.5">
      <td className="px-3 py-2 text-sm font-medium">
        <Link to={`/code/${row.code}`} className="hover:underline gradient-text">{row.code}</Link>
      </td>
      <td className="px-3 py-2 text-sm">
        <a href={row.url} title={row.url} target="_blank" rel="noreferrer" className="text-slate-700 hover:underline">{truncate(row.url)}</a>
      </td>
      <td className="px-3 py-2 text-sm text-center">{row.clicks ?? 0}</td>
      <td className="px-3 py-2 text-sm text-center">{row.last_clicked ? new Date(row.last_clicked).toLocaleString() : '-'}</td>
      <td className="px-3 py-2 text-sm text-right">
        <button className={`mr-2 px-3 py-1 rounded-md text-sm ${copied ? 'bg-emerald-500 text-white' : 'hover:bg-linear-to-r from-indigo-400 to-purple-500 text-indigo-700/90'}`} onClick={handleCopy}>
          {copied ? 'Copied! ✓' : 'Copy'}
        </button>
        <button className="px-3 py-1 rounded-md text-sm text-red-600 hover:bg-red-50" onClick={()=>onDelete(row.code)}>Delete</button>
      </td>
    </tr>
  );
}
