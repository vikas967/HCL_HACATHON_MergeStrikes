import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import StockStatusBadge from '../../components/StockStatusBadge.jsx';

export default function AdminExpiry() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/inventory/expiry').then((r) => setItems(r.data.items)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-1">Expiry alerts</h1>
      <p className="text-sm text-navy-500 mb-4">Batches within 30 days of expiry, or already expired. Rotate stock or create a clearance promotion.</p>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-navy-700">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Batch</th>
              <th className="p-3">Warehouse</th>
              <th className="p-3 text-right">Qty</th>
              <th className="p-3">Expires on</th>
              <th className="p-3 text-right">Days to expiry</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="p-5 text-center text-navy-500">Loading…</td></tr>}
            {!loading && items.length === 0 && <tr><td colSpan={7} className="p-5 text-center text-navy-500">No near-expiry batches.</td></tr>}
            {items.map((b) => (
              <tr key={b._id} className="border-t">
                <td className="p-3 font-medium text-navy-900">{b.product?.name}</td>
                <td className="p-3 text-navy-600">{b.batchCode}</td>
                <td className="p-3">{b.warehouse?.name}</td>
                <td className="p-3 text-right">{b.quantity}</td>
                <td className="p-3">{new Date(b.expiresOn).toLocaleDateString()}</td>
                <td className="p-3 text-right">{b.daysToExpiry}</td>
                <td className="p-3"><StockStatusBadge status={b.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
