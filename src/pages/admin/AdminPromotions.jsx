import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function AdminPromotions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'percent',
    discountValue: 10,
    minOrderValue: 0,
    endsAt: '',
  });
  const toast = useToast();

  async function load() {
    setLoading(true);
    const r = await api.get('/admin/promotions');
    setItems(r.data.items);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    try {
      await api.post('/admin/promotions', {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderValue: Number(form.minOrderValue),
        endsAt: new Date(form.endsAt).toISOString(),
      });
      toast.success('Promotion created');
      setForm({ code: '', description: '', discountType: 'percent', discountValue: 10, minOrderValue: 0, endsAt: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not create');
    }
  }

  async function toggle(p) {
    await api.patch(`/admin/promotions/${p._id}`, { enabled: !p.enabled });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-1">Promotions</h1>
      <p className="text-sm text-navy-500 mb-4">Discount codes validated server-side on each cart.</p>

      <form onSubmit={create} className="card p-5 grid md:grid-cols-3 gap-3 max-w-4xl">
        <div className="md:col-span-1">
          <label className="label">Code</label>
          <input className="input mt-1 uppercase" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Description</label>
          <input className="input mt-1" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className="label">Type</label>
          <select className="input mt-1" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
            <option value="percent">Percent</option>
            <option value="fixed">Fixed</option>
          </select>
        </div>
        <div>
          <label className="label">Value</label>
          <input type="number" required className="input mt-1" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} />
        </div>
        <div>
          <label className="label">Min order (₹)</label>
          <input type="number" className="input mt-1" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Ends on</label>
          <input type="datetime-local" required className="input mt-1" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
        </div>
        <div className="md:col-span-3">
          <button className="btn-primary">Create promotion</button>
        </div>
      </form>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-navy-700">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Description</th>
              <th className="p-3">Discount</th>
              <th className="p-3">Min order</th>
              <th className="p-3">Ends</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="p-5 text-center text-navy-500">Loading…</td></tr>}
            {items.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="p-3 font-semibold text-navy-900">{p.code}</td>
                <td className="p-3 text-navy-700">{p.description}</td>
                <td className="p-3">{p.discountType === 'percent' ? `${p.discountValue}%` : `₹${p.discountValue}`}</td>
                <td className="p-3">₹{p.minOrderValue}</td>
                <td className="p-3 text-xs text-navy-500">{new Date(p.endsAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <span className={`badge ${p.enabled ? 'bg-accent-100 text-accent-700' : 'bg-navy-100 text-navy-500'}`}>
                    {p.enabled ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => toggle(p)} className="btn-outline text-xs">{p.enabled ? 'Disable' : 'Enable'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
