import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Shield } from 'lucide-react';
import api from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Checkout() {
  const { cart, refresh } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [validation, setValidation] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    line1: '',
    line2: '',
    city: 'Delhi',
    state: 'DL',
    pincode: '110001',
    phone: '9876543210',
  });

  useEffect(() => {
    api
      .post('/checkout/validate')
      .then((r) => setValidation(r.data))
      .catch((e) => toast.error(e.response?.data?.error || 'Checkout validation failed'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function placeOrder(e) {
    e.preventDefault();
    setPlacing(true);
    try {
      const res = await api.post('/orders', { shippingAddress: form });
      toast.success('Order placed!');
      await refresh();
      navigate(`/order/${res.data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  }

  const hasIssues = validation?.issues?.length > 0;
  const summary = validation?.summary || cart;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-[1fr_380px] gap-6">
      <form onSubmit={placeOrder} className="card p-6">
        <h1 className="text-2xl font-bold text-navy-900">Checkout</h1>
        <p className="text-sm text-navy-500 mt-1">
          Mock checkout — real payment is not collected. Stock is reserved atomically on confirmation.
        </p>

        {hasIssues && (
          <div className="mt-4 p-3 border border-red-200 bg-red-50 rounded-xl text-sm text-red-700">
            <strong>Some items can't be fulfilled:</strong>
            <ul className="mt-1 list-disc pl-5">
              {validation.issues.map((i) => (
                <li key={String(i.productId)}>
                  {i.name || i.productId}: requested {i.requested}, available {i.available ?? 0}
                </li>
              ))}
            </ul>
          </div>
        )}

        <h2 className="mt-6 font-semibold text-navy-900">Shipping address</h2>
        <div className="mt-3 grid md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="label">Full name</label>
            <input required className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Address line 1</label>
            <input required className="input mt-1" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Address line 2 (optional)</label>
            <input className="input mt-1" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
          </div>
          <div>
            <label className="label">City</label>
            <input required className="input mt-1" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <label className="label">State</label>
            <input required className="input mt-1" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </div>
          <div>
            <label className="label">Pincode</label>
            <input required className="input mt-1" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input required className="input mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>

        <button
          disabled={placing || hasIssues}
          className="btn-accent w-full mt-6 py-3 disabled:opacity-50"
        >
          {placing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
          Place mock order
        </button>
      </form>

      <aside className="card p-5 h-fit">
        <h2 className="font-semibold text-navy-900">Order summary</h2>
        <div className="mt-3 space-y-2 text-sm max-h-72 overflow-y-auto">
          {(summary.items || []).map((i) => (
            <div key={i._id} className="flex items-start gap-2">
              <div className="w-12 h-12 bg-slate-100 rounded overflow-hidden shrink-0">
                <img src={i.product.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="line-clamp-1 text-navy-800">{i.product.name}</div>
                <div className="text-xs text-navy-500">× {i.quantity}</div>
              </div>
              <div className="text-navy-800 font-medium">₹{i.lineTotal.toLocaleString('en-IN')}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 text-sm border-t pt-3">
          <div className="flex justify-between"><span>Subtotal</span><span>₹{summary.subtotal.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between"><span>Discount</span><span className="text-accent-700">-₹{summary.discount.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{summary.shipping === 0 ? 'Free' : `₹${summary.shipping}`}</span></div>
          <div className="flex justify-between font-bold text-navy-900 pt-2 border-t mt-2">
            <span>Total</span><span>₹{summary.total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
