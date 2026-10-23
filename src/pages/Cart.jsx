import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Sparkles, Loader2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import EmptyState from '../components/EmptyState.jsx';
import api from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function Cart() {
  const { cart, updateItem, removeItem, applyPromo } = useCart();
  const [promo, setPromo] = useState(cart.promoCode || '');
  const [budget, setBudget] = useState('');
  const [advice, setAdvice] = useState(null);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const toast = useToast();

  async function handlePromo(e) {
    e.preventDefault();
    try {
      await applyPromo(promo || null);
      toast.success(promo ? 'Promo applied' : 'Promo removed');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid promo');
    }
  }

  async function askCheckoutAdvisor() {
    setAdviceLoading(true);
    try {
      const res = await api.post('/ai/checkout-assistant', budget ? { budget: Number(budget) } : {});
      setAdvice(res.data);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Advisor unavailable');
    } finally {
      setAdviceLoading(false);
    }
  }

  if (!cart.items.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <EmptyState
          title="Your cart is empty"
          hint="Browse the catalog or try the AI assistant."
          action={<Link to="/catalog" className="btn-primary">Shop now</Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-[1fr_360px] gap-6">
      <section>
        <h1 className="text-2xl font-bold text-navy-900 mb-4">Your Cart</h1>
        <div className="space-y-3">
          {cart.items.map((item) => (
            <div key={item._id} className="card p-3 flex gap-3">
              <Link to={`/product/${item.product.id}`} className="w-24 h-24 shrink-0 bg-slate-100 rounded-lg overflow-hidden">
                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product.id}`} className="font-semibold text-navy-900 line-clamp-1">
                  {item.product.name}
                </Link>
                <div className="text-xs text-navy-500">{item.product.brand}</div>
                <div className="mt-1 font-bold text-navy-900">₹{item.product.price.toLocaleString('en-IN')}</div>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => updateItem(item._id, Math.max(1, item.quantity - 1))} className="btn-outline text-sm px-2">-</button>
                  <span className="font-medium w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateItem(item._id, item.quantity + 1)} className="btn-outline text-sm px-2">+</button>
                  <button onClick={() => removeItem(item._id)} className="btn-outline text-sm px-2 ml-auto">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-4 mt-6 bg-navy-50 border-navy-200">
          <div className="flex items-center gap-2 text-navy-900 font-semibold">
            <Sparkles className="w-4 h-4 text-accent-500" /> AI Checkout Advisor
          </div>
          <p className="text-sm text-navy-600 mt-1">
            Set a budget — the assistant will check if the cart fits and suggest cheaper alternatives.
          </p>
          <div className="flex gap-2 mt-3">
            <input
              className="input"
              type="number"
              placeholder="Budget (₹)"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
            <button onClick={askCheckoutAdvisor} className="btn-accent text-sm" disabled={adviceLoading}>
              {adviceLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Advise
            </button>
          </div>
          {advice && (
            <div className="mt-3 text-sm text-navy-800 bg-white rounded-lg p-3 border border-navy-100">
              <p className="whitespace-pre-wrap">{advice.advice}</p>
              {advice.alternatives?.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-semibold text-navy-500 uppercase tracking-wide">Suggested swaps</div>
                  {advice.alternatives.map((a, i) => (
                    <div key={i} className="text-xs">
                      <div className="font-medium text-navy-900">{a.original} (₹{a.originalPrice})</div>
                      <ul className="list-disc pl-5 text-navy-600">
                        {a.suggestions.map((s, j) => (
                          <li key={j}>
                            {s.brand} {s.name} — ₹{s.price} ({s.rating}★) — save ₹{s.savings}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <aside className="card p-5 h-fit sticky top-20">
        <h2 className="font-semibold text-navy-900">Summary</h2>
        <div className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>₹{cart.subtotal.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between"><span>Discount</span><span className="text-accent-700">-₹{cart.discount.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{cart.shipping === 0 ? 'Free' : `₹${cart.shipping}`}</span></div>
          <div className="flex justify-between font-bold text-navy-900 text-base pt-2 border-t mt-2">
            <span>Total</span><span>₹{cart.total.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <form onSubmit={handlePromo} className="mt-4 flex gap-2">
          <input value={promo} onChange={(e) => setPromo(e.target.value)} className="input text-sm" placeholder="Promo code (SAVE10)" />
          <button className="btn-outline text-sm">Apply</button>
        </form>
        {cart.promotion && (
          <div className="mt-2 text-xs text-accent-700 bg-accent-50 border border-accent-200 rounded-lg p-2">
            {cart.promotion.code}: {cart.promotion.description}
          </div>
        )}
        <Link to="/checkout" className="btn-primary w-full justify-center mt-5 py-3">
          <ShoppingBag className="w-4 h-4" /> Checkout
        </Link>
        <p className="text-xs text-navy-400 mt-3">
          Mock checkout — no real payment is taken.
        </p>
      </aside>
    </div>
  );
}
