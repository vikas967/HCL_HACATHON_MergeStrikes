import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';
import api from '../services/api.js';

export default function Compare() {
  const [params] = useSearchParams();
  const ids = (params.get('ids') || '').split(',').filter(Boolean);
  const [state, setState] = useState({ loading: true, products: [], comparison: null, error: null });

  useEffect(() => {
    if (ids.length < 2) {
      setState({ loading: false, products: [], comparison: null, error: 'Please select 2 or 3 products to compare.' });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    api
      .post('/products/compare', { productIds: ids })
      .then((r) => setState({ loading: false, products: r.data.products, comparison: r.data.comparison, error: null }))
      .catch((e) =>
        setState({ loading: false, products: [], comparison: null, error: e.response?.data?.error || 'Compare failed' })
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  if (state.loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-navy-500">
        <Loader2 className="w-6 h-6 animate-spin inline mr-2" /> Preparing comparison…
      </div>
    );
  }
  if (state.error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-navy-700">{state.error}</p>
        <Link to="/catalog" className="btn-primary mt-4 inline-flex">Browse catalog</Link>
      </div>
    );
  }
  const { products, comparison } = state;
  const allSpecKeys = Array.from(
    new Set(products.flatMap((p) => Object.keys(p.specifications || {})))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-navy-900">Product Comparison</h1>
      <p className="text-sm text-navy-500 mt-1">Side-by-side comparison grounded in actual catalogue data.</p>

      {comparison && (
        <div className="card p-5 mt-4 bg-navy-50 border-navy-200">
          <div className="inline-flex items-center gap-2 text-sm text-navy-700 mb-2">
            <Sparkles className="w-4 h-4 text-accent-500" /> AI summary
            {comparison.fallback && <span className="badge bg-amber-100 text-amber-700">fallback</span>}
          </div>
          <p className="text-navy-800">{comparison.summary}</p>
          {comparison.verdict?.bestFor && (
            <p className="mt-2 text-navy-700"><strong>Best for your context:</strong> {comparison.verdict.bestFor}</p>
          )}
        </div>
      )}

      <div className="card mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left font-semibold text-navy-700">Attribute</th>
              {products.map((p) => (
                <th key={p._id} className="p-3 text-left">
                  <Link to={`/product/${p._id}`} className="block">
                    <div className="w-20 h-20 rounded-lg bg-slate-100 overflow-hidden mb-2">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="font-semibold text-navy-900">{p.name}</div>
                    <div className="text-xs text-navy-500">{p.brand}</div>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-3 font-medium text-navy-700">Price</td>
              {products.map((p) => (
                <td key={p._id} className="p-3 text-navy-900 font-semibold">₹{p.price.toLocaleString('en-IN')}</td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="p-3 font-medium text-navy-700">Rating</td>
              {products.map((p) => (
                <td key={p._id} className="p-3">{p.rating?.toFixed(1)} ★ ({p.reviewCount})</td>
              ))}
            </tr>
            {allSpecKeys.map((k) => (
              <tr key={k} className="border-t">
                <td className="p-3 font-medium text-navy-700">{k}</td>
                {products.map((p) => (
                  <td key={p._id} className="p-3 text-navy-800">{p.specifications?.[k] || '—'}</td>
                ))}
              </tr>
            ))}
            <tr className="border-t align-top">
              <td className="p-3 font-medium text-navy-700">Strengths</td>
              {products.map((p) => (
                <td key={p._id} className="p-3">
                  <ul className="list-disc pl-4 text-sm space-y-0.5">
                    {(comparison?.perProduct?.find((x) => x.name === p.name)?.strengths || []).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
            <tr className="border-t align-top">
              <td className="p-3 font-medium text-navy-700">Limitations</td>
              {products.map((p) => (
                <td key={p._id} className="p-3">
                  <ul className="list-disc pl-4 text-sm space-y-0.5 text-navy-600">
                    {(comparison?.perProduct?.find((x) => x.name === p.name)?.limitations || []).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
