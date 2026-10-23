import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import StockStatusBadge from '../../components/StockStatusBadge.jsx';

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    api.get('/admin/inventory').then((r) => setItems(r.data.items)).finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((i) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      i.product?.name?.toLowerCase().includes(s) ||
      i.product?.sku?.toLowerCase().includes(s) ||
      i.warehouse?.name?.toLowerCase().includes(s)
    );
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-1">Warehouse Inventory</h1>
      <p className="text-sm text-navy-500 mb-4">All products across all warehouses, with live available stock.</p>
      <input className="input max-w-md" placeholder="Search product, SKU or warehouse…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="card mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-navy-700">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Warehouse</th>
              <th className="p-3 text-right">On hand</th>
              <th className="p-3 text-right">Reserved</th>
              <th className="p-3 text-right">Available</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="p-5 text-center text-navy-500">Loading…</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} className="p-5 text-center text-navy-500">No matching inventory.</td></tr>
            )}
            {filtered.map((i) => (
              <tr key={i._id} className="border-t">
                <td className="p-3 font-medium text-navy-900">{i.product?.name}</td>
                <td className="p-3 text-navy-600">{i.product?.sku}</td>
                <td className="p-3">{i.warehouse?.name}</td>
                <td className="p-3 text-right">{i.onHand}</td>
                <td className="p-3 text-right">{i.reserved}</td>
                <td className="p-3 text-right font-semibold">{i.available}</td>
                <td className="p-3"><StockStatusBadge status={i.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
