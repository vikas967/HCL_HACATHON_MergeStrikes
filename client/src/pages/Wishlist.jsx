import { useEffect, useState } from 'react';
import { Trash2, ShoppingBag, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import EmptyState from '../components/EmptyState.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const toast = useToast();

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/wishlist');
      setItems(res.data.items);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function remove(id) {
    await api.delete(`/wishlist/${id}`);
    toast.info('Removed from wishlist');
    load();
  }

  if (loading) return <div className="p-10 text-center text-navy-500">Loading…</div>;
  if (!items.length)
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <EmptyState
          title="Your wishlist is empty"
          hint="Save products you love and come back later."
          icon={Heart}
          action={<Link to="/catalog" className="btn-primary">Browse catalog</Link>}
        />
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-navy-900">Your Wishlist</h1>
      <div className="grid md:grid-cols-2 gap-3 mt-4">
        {items.map((p) => (
          <div key={p._id} className="card p-3 flex gap-3">
            <Link to={`/product/${p._id}`} className="w-24 h-24 shrink-0 bg-slate-100 rounded-lg overflow-hidden">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
            </Link>
            <div className="flex-1">
              <Link to={`/product/${p._id}`} className="font-semibold line-clamp-2 text-navy-900">
                {p.name}
              </Link>
              <div className="text-xs text-navy-500">{p.brand}</div>
              <div className="font-bold text-navy-900 mt-1">₹{p.price.toLocaleString('en-IN')}</div>
              <div className="mt-2 flex gap-2">
                <button onClick={() => addItem(p._id)} className="btn-primary text-xs">
                  <ShoppingBag className="w-3.5 h-3.5" /> Add to cart
                </button>
                <button onClick={() => remove(p._id)} className="btn-outline text-xs">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
