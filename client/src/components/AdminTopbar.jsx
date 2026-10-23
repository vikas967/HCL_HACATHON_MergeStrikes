import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ExternalLink, LogOut } from 'lucide-react';

export default function AdminTopbar() {
  const { user, logout } = useAuth();
  return (
    <div className="bg-white border-b border-navy-100 px-6 py-3 flex items-center">
      <div>
        <h2 className="font-semibold text-navy-900">Admin Console</h2>
        <p className="text-xs text-navy-500">Operations overview and inventory controls</p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Link to="/" className="btn-outline text-sm">
          <ExternalLink className="w-4 h-4" /> View storefront
        </Link>
        <div className="text-sm text-navy-600 pl-3 border-l border-navy-100">
          Signed in as <span className="font-semibold text-navy-900">{user?.name}</span>
        </div>
        <button onClick={logout} className="p-2 rounded-lg hover:bg-navy-50 text-navy-600" title="Log out">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
