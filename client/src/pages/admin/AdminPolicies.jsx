import { useEffect, useRef, useState } from 'react';
import api from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Upload, Trash2, FileText } from 'lucide-react';

export default function AdminPolicies() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', docType: 'return', version: '1.0', region: 'IN' });
  const fileRef = useRef(null);
  const toast = useToast();

  async function load() {
    setLoading(true);
    const r = await api.get('/policies');
    setItems(r.data.items);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function upload(e) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return toast.error('Please choose a file');
    if (!form.title) return toast.error('Please enter a title');
    const fd = new FormData();
    fd.append('file', file);
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    setUploading(true);
    try {
      await api.post('/policies/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Document ingested and embedded');
      setForm({ title: '', docType: 'return', version: '1.0', region: 'IN' });
      if (fileRef.current) fileRef.current.value = '';
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function remove(id) {
    if (!confirm('Delete this document and all its embeddings?')) return;
    await api.delete(`/policies/${id}`);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-1">Policy documents</h1>
      <p className="text-sm text-navy-500 mb-4">Upload PDF/MD/TXT/JSON. Documents are chunked and embedded for RAG retrieval.</p>

      <form onSubmit={upload} className="card p-5 grid md:grid-cols-4 gap-3 max-w-4xl">
        <div className="md:col-span-2">
          <label className="label">Title</label>
          <input required className="input mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="label">Type</label>
          <select className="input mt-1" value={form.docType} onChange={(e) => setForm({ ...form, docType: e.target.value })}>
            <option value="return">Return</option>
            <option value="refund">Refund</option>
            <option value="shipping">Shipping</option>
            <option value="warranty">Warranty</option>
            <option value="membership">Membership</option>
            <option value="manual">Manual</option>
            <option value="seller">Seller</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="label">Version</label>
          <input className="input mt-1" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
        </div>
        <div className="md:col-span-3">
          <label className="label">File</label>
          <input type="file" ref={fileRef} className="input mt-1" accept=".pdf,.txt,.md,.json" />
        </div>
        <div>
          <label className="label">Region</label>
          <input className="input mt-1" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
        </div>
        <div className="md:col-span-4">
          <button className="btn-primary" disabled={uploading}>
            <Upload className="w-4 h-4" /> {uploading ? 'Processing…' : 'Upload & embed'}
          </button>
        </div>
      </form>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-navy-700">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Type</th>
              <th className="p-3">Version</th>
              <th className="p-3">Chunks</th>
              <th className="p-3">Effective</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="p-5 text-center text-navy-500">Loading…</td></tr>}
            {items.map((d) => (
              <tr key={d._id} className="border-t">
                <td className="p-3 font-medium text-navy-900 flex items-center gap-2"><FileText className="w-4 h-4 text-navy-400" /> {d.title}</td>
                <td className="p-3"><span className="badge bg-navy-100 text-navy-700">{d.docType}</span></td>
                <td className="p-3">{d.version}</td>
                <td className="p-3">{d.chunkCount}</td>
                <td className="p-3 text-xs text-navy-500">{new Date(d.effectiveDate).toLocaleDateString()}</td>
                <td className="p-3 text-right"><button onClick={() => remove(d._id)} className="btn-outline text-xs"><Trash2 className="w-3.5 h-3.5" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
