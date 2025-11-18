import React, { useEffect, useMemo, useState } from 'react';
import LinkForm from '../components/LinkForm';
import LinkRow from '../components/LinkRow';
import { getLinks, createLink, deleteLink } from '../api';

export default function Dashboard(){
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDir, setSortDir] = useState('desc');

  async function load(){
    setLoading(true);
    try {
      const data = await getLinks();
      setLinks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  }

  useEffect(()=>{ load(); }, []);

  async function handleCreate(payload){
    const created = await createLink(payload);
    await load();
    return created;
  }

  async function handleDelete(code){
    if (!confirm(`Delete ${code}?`)) return;
    await deleteLink(code);
    await load();
  }

  const shown = useMemo(() => {
    let s = links.filter(l => {
      if (!filter) return true;
      return l.code.includes(filter) || l.url.includes(filter);
    });
    if (!sortField) return s;
    s = s.slice().sort((a,b) => {
      if (sortField === 'clicks') {
        const na = Number(a.clicks || 0);
        const nb = Number(b.clicks || 0);
        if (na === nb) return 0;
        return sortDir === 'asc' ? (na - nb) : (nb - na);
      }
      if (sortField === 'last_clicked') {
        const ta = a.last_clicked ? new Date(a.last_clicked).getTime() : 0;
        const tb = b.last_clicked ? new Date(b.last_clicked).getTime() : 0;
        if (ta === tb) return 0;
        return sortDir === 'asc' ? (ta - tb) : (tb - ta);
      }
      const av = String(a[sortField] ?? '');
      const bv = String(b[sortField] ?? '');
      if (av === bv) return 0;
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return s;
  }, [links, filter, sortField, sortDir]);

  function toggleSort(field){
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="animate-slideInUp">
          <h2 className="text-lg font-semibold">Create Short Link</h2>
          <LinkForm onCreate={handleCreate} />
        </div>
        <div className="animate-slideInUp">
          <h2 className="text-lg font-semibold">Links</h2>
          <div className="mt-2 flex items-center gap-3">
            <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Search code or url" className="input w-full" />
            <div className="text-sm text-slate-500">{links.length} total</div>
          </div>
          <div className="mt-4 overflow-x-auto bg-white rounded shadow">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-12 w-full skeleton rounded-md" />
                ))}
              </div>
            ) : (
              <table className="w-full">
                <thead className="text-left text-sm text-slate-500">
                  <tr>
                    <th className="px-3 py-2 cursor-pointer" onClick={()=>toggleSort('code')}>Code {sortField==='code' ? (sortDir==='asc' ? '↑' : '↓') : ''}</th>
                    <th className="px-3 py-2">Target</th>
                    <th className="px-3 py-2 text-center cursor-pointer" onClick={()=>toggleSort('clicks')}>Clicks {sortField==='clicks' ? (sortDir==='asc' ? '↑' : '↓') : ''}</th>
                    <th className="px-3 py-2 text-center cursor-pointer" onClick={()=>toggleSort('last_clicked')}>Last clicked {sortField==='last_clicked' ? (sortDir==='asc' ? '↑' : '↓') : ''}</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-slate-500 text-lg">🔗 No links yet! Create your first short link above 🚀</td></tr>}
                  {shown.map(l => <LinkRow key={l.code} row={l} onDelete={handleDelete} />)}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
