export default function StockStatusBadge({ status }) {
  const map = {
    in_stock: { label: 'In stock', cls: 'bg-accent-100 text-accent-700' },
    low_stock: { label: 'Low', cls: 'bg-amber-100 text-amber-700' },
    out_of_stock: { label: 'Out', cls: 'bg-red-100 text-red-700' },
    near_expiry: { label: 'Near expiry', cls: 'bg-amber-100 text-amber-700' },
    critical: { label: 'Critical', cls: 'bg-red-100 text-red-700' },
    expired: { label: 'Expired', cls: 'bg-red-200 text-red-800' },
  };
  const s = map[status] || { label: status, cls: 'bg-navy-100 text-navy-700' };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}
