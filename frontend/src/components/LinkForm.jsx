import React, { useMemo, useState } from 'react';
import { useToast } from './ToastContext';

export default function LinkForm({ onCreate }) {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const urlValid = useMemo(() => {
    try { return Boolean(new URL(url)); } catch { return false; }
  }, [url]);

  const codeValid = useMemo(() => {
    if (!code) return true; // optional
    return /^[a-zA-Z0-9]{6,8}$/.test(code.trim());
  }, [code]);

  async function handleSubmit(e){
    e.preventDefault();
    setError(null);
    if (!urlValid) { setError('Enter a valid full URL (include http/https)'); return; }
    if (!codeValid) { setError('Custom code must be 6-8 alphanumeric characters'); return; }
    setLoading(true);
    try {
      await onCreate({ url, code: code ? code.trim() : undefined });
      setUrl(''); setCode('');
      toast('Short link created successfully! 🎉', 'success');
    } catch (err) {
      const msg = err?.body?.error || err.message || 'Something went wrong';
      setError(msg);
      toast(msg, 'error');
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="card bg-linear-to-br from-white to-blue-50">
      <div className="mb-3">
        <label className="block text-sm font-medium">Target URL</label>
        <div className="mt-1 relative">
          <input value={url} onChange={e=>setUrl(e.target.value)} className="w-full input pr-10" placeholder="https://example.com/very/long/path" />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-sm">
            {url.length > 0 ? (urlValid ? <span className="text-green-600">✓</span> : <span className="text-red-600">✗</span>) : null}
          </div>
        </div>
        {!urlValid && url.length > 0 && <div className="text-sm text-red-600 mt-1">Please enter a valid URL beginning with http/https</div>}
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium">Custom code (optional)</label>
        <div className="mt-1 relative inline-block">
          <input value={code} onChange={e=>setCode(e.target.value)} className="input w-48" placeholder="6-8 alphanumeric" />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-sm">
            {code.length > 0 ? (codeValid ? <span className="text-green-600">✓</span> : <span className="text-red-600">✗</span>) : null}
          </div>
        </div>
        {!codeValid && code.length > 0 && <div className="text-sm text-red-600 mt-1">Use 6-8 letters and numbers only</div>}
      </div>

      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      <div className="flex gap-2 items-center">
        <button disabled={loading} className="btn-primary">
          {loading ? '⏳ Saving...' : 'Create Short Link'}
        </button>
        <button type="button" className="btn-secondary" onClick={() => { setUrl(''); setCode(''); setError(null); }}>Clear</button>
      </div>
    </form>
  );
}
