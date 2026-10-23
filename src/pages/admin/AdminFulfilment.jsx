import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import EmptyState from '../../components/EmptyState.jsx';

export default function AdminFulfilment() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/operations/fulfilment-exceptions').then((r) => setItems(r.data.items)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-navy-500">Loading…</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-1">Fulfilment exceptions</h1>
      <p className="text-sm text-navy-500 mb-4">Orders flagged for manual review.</p>
      {items.length === 0 ? (
        <EmptyState title="No open exceptions" hint="All orders can be fulfilled right now." />
      ) : (
        <div className="space-y-3">
          {items.map((o) => (
            <div key={o._id} className="card p-4">
              <div className="flex items-center">
                <div>
                  <div className="font-semibold text-navy-900">{o.orderNumber}</div>
                  <div className="text-xs text-navy-500">{new Date(o.createdAt).toLocaleString()} — {o.user?.name}</div>
                </div>
                <div className="ml-auto badge bg-amber-100 text-amber-700">{o.status}</div>
              </div>
              {o.exceptionReason && (
                <div className="mt-2 text-sm text-navy-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                  Reason: {o.exceptionReason}
                </div>
              )}
              <ul className="mt-2 text-sm text-navy-700 list-disc pl-5">
                {o.items.map((it, i) => (
                  <li key={i}>{it.nameSnapshot} × {it.quantity}</li>
                ))}
              </ul>
              <div className="mt-2 text-xs text-navy-500">Recommended: verify warehouse allocation and either reserve from alternate warehouse or notify customer.</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
