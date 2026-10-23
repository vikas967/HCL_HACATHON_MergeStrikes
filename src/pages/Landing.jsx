import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ShoppingBag, Search, Shield, Zap, TrendingUp } from 'lucide-react';
import api from '../services/api.js';
import ProductGrid, { ProductGridSkeleton } from '../components/ProductGrid.jsx';

const CATEGORIES = [
  { name: 'Electronics', color: 'bg-indigo-50 text-indigo-800' },
  { name: 'Fashion', color: 'bg-pink-50 text-pink-800' },
  { name: 'Home', color: 'bg-emerald-50 text-emerald-800' },
  { name: 'Books', color: 'bg-amber-50 text-amber-800' },
  { name: 'Groceries', color: 'bg-rose-50 text-rose-800' },
];

export default function Landing() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/products/recommendations')
      .then((r) => setFeatured(r.data.items))
      .finally(() => setLoading(false));
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) navigate(`/assistant?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-14 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-4 leading-tight">
              Shop smarter with an <span className="text-accent-400">AI that gets you</span>
            </h1>
            <p className="mt-4 text-navy-100 max-w-xl">
              Tell ShopSmart AI what you need — in plain words. It understands budget, use case, and preferences,
              then picks the best products from our real catalogue and explains why.
            </p>
            <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-xl">
              <div className="flex items-center flex-1 bg-white rounded-xl px-3">
                <Search className="w-5 h-5 text-navy-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder='Try "laptop under ₹70,000 for Java and AI projects"'
                  className="w-full px-3 py-3 outline-none text-navy-900"
                />
              </div>
              <button className="btn-accent px-5 py-3">
                <Sparkles className="w-4 h-4" /> Ask AI
              </button>
            </form>
            <div className="mt-4 flex items-center gap-4 text-sm text-navy-200">
              <span className="inline-flex items-center gap-1"><Shield className="w-4 h-4 text-accent-400" /> Grounded answers</span>
              <span className="inline-flex items-center gap-1"><Zap className="w-4 h-4 text-accent-400" /> Real catalogue</span>
              <span className="inline-flex items-center gap-1"><TrendingUp className="w-4 h-4 text-accent-400" /> Smart recs</span>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="relative">
              <div className="w-64 h-64 bg-accent-500/20 blur-3xl rounded-full absolute -top-6 -left-6" />
              <div className="relative card bg-navy-800/80 border-navy-700 text-navy-100 p-6 w-80">
                <div className="flex items-center gap-2 text-xs text-accent-300 mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> How it works
                </div>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-accent-500/20 text-accent-300 flex items-center justify-center text-xs font-bold">1</span>
                    <span>Describe what you need in plain words.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-accent-500/20 text-accent-300 flex items-center justify-center text-xs font-bold">2</span>
                    <span>We search our live catalogue, not generic web results.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-accent-500/20 text-accent-300 flex items-center justify-center text-xs font-bold">3</span>
                    <span>You get ranked picks with reasons grounded in product data.</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold text-navy-900 mb-4">Shop by category</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              to={`/catalog?category=${encodeURIComponent(c.name)}`}
              className={`${c.color} card hover:shadow-md transition p-5 text-center font-medium`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-navy-900">Trending products</h2>
          <Link to="/catalog" className="text-sm text-accent-700 hover:underline">Browse all</Link>
        </div>
        {loading ? <ProductGridSkeleton /> : <ProductGrid products={featured} />}
      </section>

      {/* How it works */}
      <section className="bg-white border-t border-navy-100">
        <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-6">
          {[
            { icon: Sparkles, title: 'Ask in plain words', desc: 'Describe what you need — budget, purpose, preferences.' },
            { icon: ShoppingBag, title: 'See real matches', desc: 'We rank products from our actual catalogue.' },
            { icon: Shield, title: 'Policy answers you can trust', desc: 'Return/refund questions use real approved docs.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6">
              <div className="w-10 h-10 rounded-xl bg-navy-100 flex items-center justify-center">
                <Icon className="w-5 h-5 text-navy-800" />
              </div>
              <h3 className="mt-3 font-semibold text-navy-900">{title}</h3>
              <p className="mt-1 text-sm text-navy-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
