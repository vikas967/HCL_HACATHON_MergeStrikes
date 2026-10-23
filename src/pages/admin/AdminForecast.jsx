import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import MiniBarChart from '../../components/MiniBarChart.jsx';

export default function AdminForecast() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/inventory/forecast').then((r) => setItems(r.data.items)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-1">Demand forecast</h1>
      <p className="text-sm text-navy-500 mb-4">Moving-average baseline from the last 14 days of sales. Treat the numbers as rough estimates.</p>
      {loading ? (
        <div className="text-navy-500">Loading…</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((f) => (
            <div key={f.productId} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-navy-900">{f.product.name}</div>
                  <div className="text-xs text-navy-500">{f.product.brand} · {f.product.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-navy-500">Avg daily demand</div>
                  <div className="text-xl font-bold text-navy-900">{f.avgDailyDemand}</div>
                </div>
              </div>
              <MiniBarChart data={f.history.slice(-14)} />
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-navy-500">Available</div>
                  <div className="font-semibold">{f.availableInventory}</div>
                </div>
                <div>
                  <div className="text-navy-500">Days to stockout</div>
                  <div className="font-semibold">{f.daysToStockout ?? '∞'}</div>
                </div>
                <div>
                  <div className="text-navy-500">Suggested reorder</div>
                  <div className="font-semibold text-accent-700">{f.suggestedReorder}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
