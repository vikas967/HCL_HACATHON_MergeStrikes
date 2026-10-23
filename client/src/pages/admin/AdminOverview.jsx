import { useEffect, useState } from 'react';
import { Boxes, AlertTriangle, CalendarClock, PackageSearch } from 'lucide-react';
import api from '../../services/api.js';
import MetricCard from '../../components/MetricCard.jsx';

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/operations/overview').then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-navy-500">Loading overview…</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-1">Operations Overview</h1>
      <p className="text-sm text-navy-500 mb-6">Live metrics computed from inventory, batches, and orders.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Products" value={data.totalProducts} icon={Boxes} />
        <MetricCard label="Units in stock" value={data.totalUnits.toLocaleString()} icon={Boxes} />
        <MetricCard
          label="Low-stock items"
          value={data.lowStockItems}
          icon={AlertTriangle}
          tone={data.lowStockItems > 10 ? 'warn' : 'default'}
        />
        <MetricCard label="Out of stock" value={data.outOfStock} icon={AlertTriangle} tone={data.outOfStock > 0 ? 'bad' : 'good'} />
        <MetricCard label="Near-expiry batches" value={data.nearExpiryBatches} icon={CalendarClock} tone="warn" />
        <MetricCard label="Expired batches" value={data.expiredBatches} icon={CalendarClock} tone={data.expiredBatches ? 'bad' : 'default'} />
        <MetricCard label="Fulfilment issues" value={data.fulfilmentExceptions} icon={PackageSearch} tone={data.fulfilmentExceptions ? 'warn' : 'default'} />
      </div>

      <div className="mt-8 card p-5">
        <h2 className="font-semibold text-navy-900">What to look at next</h2>
        <ul className="mt-2 text-sm space-y-1 text-navy-700 list-disc pl-5">
          <li>Low-stock items need replenishment prioritisation.</li>
          <li>Near-expiry batches should be rotated or discounted via a new promotion.</li>
          <li>Fulfilment issues require manual review before shipping.</li>
          <li>The AI Ops Assistant can summarise the top risks and recommend actions.</li>
        </ul>
      </div>
    </div>
  );
}
