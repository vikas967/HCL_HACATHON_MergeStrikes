import { PackageOpen } from 'lucide-react';

export default function EmptyState({ title = 'Nothing here yet', hint, action, icon: Icon = PackageOpen }) {
  return (
    <div className="card text-center py-12 px-6">
      <Icon className="w-12 h-12 mx-auto text-navy-300" />
      <h3 className="mt-3 font-semibold text-navy-900">{title}</h3>
      {hint && <p className="mt-1 text-sm text-navy-500">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
