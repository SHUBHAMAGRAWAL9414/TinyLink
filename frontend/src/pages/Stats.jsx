import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLink } from '../api';

export default function Stats(){
  const { code } = useParams();
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      setLoading(true);
      setErr(null);
      setLink(null);
    });

    getLink(code)
      .then(data => { if (!cancelled) setLink(data); })
      .catch(e => { if (!cancelled) setErr(e.message || 'Not found'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [code]);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1,2,3].map(i => (
        <div key={i} className="skeleton h-28 rounded-lg" />
      ))}
    </div>
  );
  if (err) return (
    <div className="stat-card p-4" style={{background: 'linear-gradient(90deg,#fb7185,#f97316)'}}>
      <div className="text-white font-semibold">Error</div>
      <div className="text-white/90 mt-2">{err}</div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">{link.code}</h1>
          <div className="text-sm text-slate-600">Statistics & details</div>
        </div>
        <div>
          <Link to="/" className="text-sm text-slate-500 hover:underline">← Back to Dashboard</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card" style={{background: 'linear-gradient(90deg,#06b6d4,#3b82f6)'}}>
          <div className="text-sm">📊 Total clicks</div>
          <div className="text-2xl font-bold mt-2">{link.clicks ?? 0}</div>
        </div>

        <div className="stat-card" style={{background: 'linear-gradient(90deg,#7c3aed,#ec4899)'}}>
          <div className="text-sm">🕒 Last clicked</div>
          <div className="text-2xl font-bold mt-2">{link.last_clicked ? new Date(link.last_clicked).toLocaleString() : '-'}</div>
        </div>

        <div className="stat-card" style={{background: 'linear-gradient(90deg,#10b981,#06b6d4)'}}>
          <div className="text-sm">🔗 Target URL</div>
          <div className="text-sm mt-2 wrap-break-word">{link.url}</div>
          <div className="mt-4">
            {(() => {
              const apiBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || window.location.origin;
              const shortUrl = `${apiBase.replace(/\/$/, '')}/${link.code}`;
              return (
                <a href={shortUrl} className="btn-primary inline-block" target="_blank" rel="noreferrer">Open redirect</a>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
