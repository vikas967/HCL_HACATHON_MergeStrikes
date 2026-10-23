import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import api from '../services/api.js';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then((r) => setOrder(r.data.order)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-10 text-center text-navy-500">Loading…</div>;
  if (!order) return <div className="p-10 text-center text-navy-500">Order not found.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-14 h-14 mx-auto text-accent-500" />
        <h1 className="mt-3 text-2xl font-bold text-navy-900">Order confirmed</h1>
        <p className="text-sm text-navy-500 mt-1">
          Order ID: <strong>{order.orderNumber}</strong>
        </p>
        <p className="text-sm text-navy-600 mt-2">
          This is a mock checkout — no payment has been collected. Stock has been decremented atomically.
        </p>
      </div>

      <div className="card p-5 mt-5">
        <h2 className="font-semibold text-navy-900">Items</h2>
        <ul className="mt-3 divide-y divide-navy-100 text-sm">
          {order.items.map((i, idx) => (
            <li key={idx} className="py-2 flex justify-between">
              <span>{i.nameSnapshot} × {i.quantity}</span>
              <span>₹{(i.priceSnapshot * i.quantity).toLocaleString('en-IN')}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t pt-3 text-sm space-y-1">
          <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between"><span>Discount</span><span className="text-accent-700">-₹{order.discount.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>₹{order.shipping}</span></div>
          <div className="flex justify-between font-bold text-navy-900 pt-2 border-t mt-2">
            <span>Total</span><span>₹{order.total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3 justify-center">
        <Link to="/orders" className="btn-outline">View all orders</Link>
        <Link to="/catalog" className="btn-primary">Continue shopping</Link>
      </div>
    </div>
  );
}
