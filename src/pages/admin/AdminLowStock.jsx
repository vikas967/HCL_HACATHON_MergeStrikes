import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import StockStatusBadge from '../../components/StockStatusBadge.jsx';

export default function AdminLowStock() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/inventory/low-stock').then((r) => setItems(r.data.items)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-1">Low-stock alerts</h1>
      <p className="text-sm text-navy-500 mb-4">Items at or below their reorder point. Suggested replenishment uses the target stock level.</p>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-navy-700">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Warehouse</th>
              <th className="p-3 text-right">Available</th>
              <th className="p-3 text-right">Reorder point</th>
              <th className="p-3 text-right">Suggested</th>
              <th className="p-3">Risk</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="p-5 text-center text-navy-500">Loading…</td></tr>}
            {!loading && items.length === 0 && <tr><td colSpan={6} className="p-5 text-center text-navy-500">All items above reorder point.</td></tr>}
            {items.map((i) => (
              <tr key={String(i.productId) + i.warehouseName} className="border-t">
                <td className="p-3 font-medium text-navy-900">{i.productName}</td>
                <td className="p-3">{i.warehouseName}</td>
                <td className="p-3 text-right">{i.available}</td>
                <td className="p-3 text-right">{i.reorderPoint}</td>
                <td className="p-3 text-right font-semibold text-accent-700">{i.suggestedReplenishment}</td>
                <td className="p-3"><StockStatusBadge status={i.available === 0 ? 'out_of_stock' : 'low_stock'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
