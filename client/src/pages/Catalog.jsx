import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import api from '../services/api.js';
import ProductGrid, { ProductGridSkeleton } from '../components/ProductGrid.jsx';

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(Number(params.get('page') || 1));
  const [loading, setLoading] = useState(true);
  const [compareIds, setCompareIds] = useState([]);

  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const brand = params.get('brand') || '';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const minRating = params.get('minRating') || '';
  const sort = params.get('sort') || 'relevance';

  function setParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setParams(next);
  }

  useEffect(() => {
    setLoading(true);
    const query = Object.fromEntries(params.entries());
    api
      .get('/products', { params: { ...query, limit: 20 } })
      .then((res) => {
        setItems(res.data.items);
        setTotal(res.data.total);
        setPage(res.data.page);
      })
      .finally(() => setLoading(false));
  }, [params]);

  function toggleCompare(product) {
    setCompareIds((ids) => {
      if (ids.includes(product._id)) return ids.filter((i) => i !== product._id);
      if (ids.length >= 3) return ids;
      return [...ids, product._id];
    });
  }

  function clearFilters() {
    const next = new URLSearchParams();
    if (q) next.set('q', q);
    setParams(next);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Catalog</h1>
          <p className="text-sm text-navy-500">{total} products</p>
        </div>
        <div className="md:ml-auto flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value)}
            className="input !w-auto"
          >
            <option value="relevance">Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Rating</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-[260px_1fr] gap-6">
        <aside className="card p-4 h-fit space-y-4 sticky top-20">
          <div className="flex items-center justify-between">
            <div className="font-semibold flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</div>
            <button onClick={clearFilters} className="text-xs text-navy-500 hover:text-navy-800 inline-flex items-center gap-1">
              <X className="w-3 h-3" /> Clear
            </button>
          </div>
          <div>
            <label className="label">Search</label>
            <input className="input mt-1" value={q} onChange={(e) => setParam('q', e.target.value)} placeholder="e.g. laptop" />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input mt-1" value={category} onChange={(e) => setParam('category', e.target.value)}>
              <option value="">All</option>
              <option>Electronics</option>
              <option>Fashion</option>
              <option>Home</option>
              <option>Books</option>
              <option>Groceries</option>
            </select>
          </div>
          <div>
            <label className="label">Brand</label>
            <input className="input mt-1" value={brand} onChange={(e) => setParam('brand', e.target.value)} placeholder="e.g. Sony" />
          </div>
          <div>
            <label className="label">Price range</label>
            <div className="flex items-center gap-2 mt-1">
              <input className="input" placeholder="Min" value={minPrice} onChange={(e) => setParam('minPrice', e.target.value)} type="number" />
              <input className="input" placeholder="Max" value={maxPrice} onChange={(e) => setParam('maxPrice', e.target.value)} type="number" />
            </div>
          </div>
          <div>
            <label className="label">Min rating</label>
            <select className="input mt-1" value={minRating} onChange={(e) => setParam('minRating', e.target.value)}>
              <option value="">Any</option>
              <option value="4">4+ stars</option>
              <option value="4.5">4.5+ stars</option>
            </select>
          </div>
        </aside>
        <section>
          {compareIds.length >= 2 && (
            <div className="card p-3 mb-4 flex items-center justify-between bg-accent-50 border-accent-200">
              <div className="text-sm text-navy-700">
                {compareIds.length} products selected for comparison
              </div>
              <Link to={`/compare?ids=${compareIds.join(',')}`} className="btn-accent text-sm">
                Compare →
              </Link>
            </div>
          )}
          {loading ? <ProductGridSkeleton /> : <ProductGrid products={items} onCompare={toggleCompare} compareIds={compareIds} />}
          {!loading && items.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                disabled={page <= 1}
                onClick={() => setParam('page', String(page - 1))}
                className="btn-outline text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <div className="text-sm text-navy-500">Page {page}</div>
              <button
                disabled={items.length < 20}
                onClick={() => setParam('page', String(page + 1))}
                className="btn-outline text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
