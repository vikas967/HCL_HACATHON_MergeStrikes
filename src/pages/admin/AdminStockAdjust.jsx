import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function AdminStockAdjust() {
  const [inventory, setInventory] = useState([]);
  const [form, setForm] = useState({ productId: '', warehouseId: '', delta: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  async function load() {
    const r = await api.get('/admin/inventory');
    setInventory(r.data.items);
  }

  useEffect(() => {
    load();
  }, []);

  const products = Array.from(
    new Map(inventory.map((i) => [String(i.product?._id), i.product])).values()
  ).filter(Boolean);
  const warehousesForProduct = (pid) =>
    inventory.filter((i) => String(i.product?._id) === pid).map((i) => ({
      id: String(i.warehouse?._id),
      name: i.warehouse?.name,
      available: i.available,
      onHand: i.onHand,
    }));

  async function submit(e) {
    e.preventDefault();
    const delta = Number(form.delta);
    if (!form.productId || !form.warehouseId || !delta || !form.reason) {
      toast.error('Please fill all fields.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/admin/inventory/adjust', { ...form, delta });
      toast.success('Stock adjusted');
      setForm({ productId: '', warehouseId: '', delta: '', reason: '' });
      await load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Adjustment failed');
    } finally {
      setSubmitting(false);
    }
  }

  const selectedProduct = form.productId;
  const warehouses = selectedProduct ? warehousesForProduct(selectedProduct) : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-1">Adjust stock</h1>
      <p className="text-sm text-navy-500 mb-4">Audit-logged inventory adjustments. Prevents negative stock.</p>
      <form onSubmit={submit} className="card p-5 grid md:grid-cols-2 gap-3 max-w-3xl">
        <div className="md:col-span-2">
          <label className="label">Product</label>
          <select className="input mt-1" value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value, warehouseId: '' })}>
            <option value="">Select…</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Warehouse</label>
          <select className="input mt-1" value={form.warehouseId} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })} disabled={!selectedProduct}>
            <option value="">Select…</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.name} (on-hand: {w.onHand})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Delta (positive = add, negative = remove)</label>
          <input type="number" className="input mt-1" value={form.delta} onChange={(e) => setForm({ ...form, delta: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Reason</label>
          <input className="input mt-1" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="e.g. received shipment INV-2834" />
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit adjustment'}
          </button>
        </div>
      </form>
    </div>
  );
}
