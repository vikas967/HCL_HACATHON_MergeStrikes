import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ products, onCompare, compareIds = [] }) {
  if (!products?.length) {
    return (
      <div className="text-center py-10 text-navy-500">
        No products found. Try widening your filters.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => (
        <ProductCard
          key={p._id}
          product={p}
          onCompare={onCompare}
          compareSelected={compareIds.includes(p._id)}
        />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="skeleton aspect-[4/3]" />
          <div className="p-3 space-y-2">
            <div className="skeleton h-3 w-16 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-24 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
