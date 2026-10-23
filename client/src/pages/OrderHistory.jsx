import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import EmptyState from '../components/EmptyState.jsx';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my').then((r) => setOrders(r.data.items)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center text-navy-500">Loading…</div>;
  if (!orders.length)
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <EmptyState title="No orders yet" hint="Place your first order to see it here." action={<Link to="/catalog" className="btn-primary">Shop now</Link>} />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-navy-900">Your Orders</h1>
      <div className="mt-4 space-y-3">
        {orders.map((o) => (
          <Link key={o._id} to={`/order/${o._id}`} className="card p-4 flex items-center hover:shadow-md transition">
            <div>
              <div className="font-semibold text-navy-900">{o.orderNumber}</div>
              <div className="text-xs text-navy-500">{new Date(o.createdAt).toLocaleString()}</div>
              <div className="text-sm text-navy-600 mt-1">
                {o.items.length} item{o.items.length > 1 ? 's' : ''} · <span className="badge bg-navy-100 text-navy-700">{o.status}</span>
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="font-bold text-navy-900">₹{o.total.toLocaleString('en-IN')}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
