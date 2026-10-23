import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Heart, Star, Package, Loader2 } from 'lucide-react';
import api from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/${id}`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  async function wishlist() {
    if (!user) return toast.error('Log in to use your wishlist.');
    try {
      await api.post(`/wishlist/${id}`);
      toast.success('Saved to wishlist');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Could not save');
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 text-center text-navy-500">
        <Loader2 className="w-6 h-6 animate-spin inline mr-2" /> Loading…
      </div>
    );
  }
  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 text-center">
        <p className="text-navy-500">Product not found.</p>
        <Link to="/catalog" className="btn-primary mt-4 inline-flex">Back to catalog</Link>
      </div>
    );
  }
  const { product, inventory } = data;
  const specs = Object.entries(product.specifications || {});

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Link to="/catalog" className="text-sm text-navy-500 hover:text-navy-800">← Back to catalog</Link>
      <div className="grid md:grid-cols-2 gap-8 mt-4">
        <div className="card aspect-square bg-slate-100 overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="text-sm text-navy-500">{product.brand} · {product.category}</div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy-900 mt-1">{product.name}</h1>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <span className="inline-flex items-center gap-1 text-accent-700 font-medium">
              <Star className="w-4 h-4 fill-accent-500 stroke-accent-500" /> {product.rating?.toFixed(1)}
            </span>
            <span className="text-navy-500">({product.reviewCount} reviews)</span>
          </div>
          <div className="mt-4 flex items-end gap-3">
            <div className="text-3xl font-bold text-navy-900">₹{product.price.toLocaleString('en-IN')}</div>
            {product.originalPrice && (
              <div className="text-lg text-navy-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</div>
            )}
          </div>
          <p className="mt-4 text-navy-700">{product.description}</p>
          <div className="mt-4 flex items-center gap-3">
            <button onClick={() => addItem(product._id)} className="btn-primary flex-1 py-3">
              <ShoppingBag className="w-5 h-5" /> Add to cart
            </button>
            <button onClick={wishlist} className="btn-outline py-3">
              <Heart className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-6 card p-4 bg-slate-50">
            <div className="font-semibold text-navy-900 flex items-center gap-2">
              <Package className="w-4 h-4" /> Availability
            </div>
            <div className="mt-2 text-sm">
              Total in stock: <strong>{inventory.totalAvailable}</strong>
              <div className="mt-1 text-navy-500">
                {inventory.byWarehouse.map((w) => (
                  <div key={w.warehouse}>{w.warehouse}: {w.available} units</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {specs.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-navy-900 mb-3">Specifications</h2>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {specs.map(([k, v]) => (
                  <tr key={k} className="border-b border-navy-50 last:border-0">
                    <td className="px-4 py-2 w-1/3 font-medium text-navy-700 bg-slate-50">{k}</td>
                    <td className="px-4 py-2 text-navy-800">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
