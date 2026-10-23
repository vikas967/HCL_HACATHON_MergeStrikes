export default function MetricCard({ label, value, hint, icon: Icon, tone = 'default' }) {
  const toneClass = {
    default: 'bg-white',
    good: 'bg-accent-50 border-accent-200',
    warn: 'bg-amber-50 border-amber-200',
    bad: 'bg-red-50 border-red-200',
  }[tone];
  return (
    <div className={`card border p-5 ${toneClass}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-navy-500">{label}</div>
          <div className="text-2xl font-bold text-navy-900 mt-1">{value}</div>
          {hint && <div className="text-xs text-navy-500 mt-1">{hint}</div>}
        </div>
        {Icon && <Icon className="w-6 h-6 text-navy-500" />}
      </div>
    </div>
  );
}
