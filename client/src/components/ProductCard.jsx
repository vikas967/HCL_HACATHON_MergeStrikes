import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function ProductCard({ product, onCompare, compareSelected = false }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const toast = useToast();

  async function handleWishlist() {
    if (!user) return toast.error('Please log in to use the wishlist.');
    try {
      await api.post(`/wishlist/${product._id}`);
      toast.success('Added to wishlist');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Could not add');
    }
  }

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="card flex flex-col overflow-hidden group hover:shadow-md transition">
      <Link to={`/product/${product._id}`} className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        {discount && (
          <span className="absolute top-2 left-2 badge bg-accent-500 text-white">-{discount}%</span>
        )}
      </Link>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="text-xs text-navy-500">{product.brand}</div>
        <Link to={`/product/${product._id}`} className="font-semibold text-navy-900 line-clamp-2 hover:text-navy-700">
          {product.name}
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1 text-accent-700 font-medium">
            <Star className="w-3.5 h-3.5 fill-accent-500 stroke-accent-500" />
            {product.rating?.toFixed(1) || '0.0'}
          </span>
          <span className="text-navy-400">({product.reviewCount || 0})</span>
        </div>
        <div className="flex items-end gap-2 mt-auto">
          <div className="text-lg font-bold text-navy-900">₹{product.price.toLocaleString('en-IN')}</div>
          {product.originalPrice && (
            <div className="text-sm text-navy-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button onClick={() => addItem(product._id)} className="btn-primary text-sm flex-1">
            <ShoppingBag className="w-4 h-4" /> Add
          </button>
          <button onClick={handleWishlist} className="btn-outline text-sm px-2.5" aria-label="Save">
            <Heart className="w-4 h-4" />
          </button>
          {onCompare && (
            <button
              onClick={() => onCompare(product)}
              className={`btn text-sm px-2.5 ${compareSelected ? 'bg-accent-500 text-white' : 'btn-outline'}`}
              title="Add to compare"
            >
              VS
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
