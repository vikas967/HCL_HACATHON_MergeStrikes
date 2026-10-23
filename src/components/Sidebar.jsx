import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  AlertTriangle,
  LineChart,
  CalendarClock,
  SlidersHorizontal,
  PackageSearch,
  BadgePercent,
  FileText,
  Bot,
  Sparkles,
} from 'lucide-react';

const links = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { to: '/admin/low-stock', label: 'Low Stock', icon: AlertTriangle },
  { to: '/admin/forecast', label: 'Demand Forecast', icon: LineChart },
  { to: '/admin/expiry', label: 'Expiry Alerts', icon: CalendarClock },
  { to: '/admin/stock-adjust', label: 'Adjust Stock', icon: SlidersHorizontal },
  { to: '/admin/fulfilment', label: 'Fulfilment Issues', icon: PackageSearch },
  { to: '/admin/promotions', label: 'Promotions', icon: BadgePercent },
  { to: '/admin/policies', label: 'Policy Docs', icon: FileText },
  { to: '/admin/ops-assistant', label: 'Ops AI Assistant', icon: Bot },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-navy-900 text-navy-100 min-h-screen hidden md:flex flex-col">
      <Link to="/" className="flex items-center gap-2 px-4 py-5 border-b border-navy-800">
        <div className="w-9 h-9 rounded-xl bg-navy-700 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-accent-400" />
        </div>
        <span className="font-bold text-white">ShopSmart AI</span>
      </Link>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                isActive ? 'bg-navy-700 text-white' : 'text-navy-300 hover:bg-navy-800 hover:text-white'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
