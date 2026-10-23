import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, Sparkles, FileText, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLink = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium rounded-lg transition ${
      isActive ? 'text-navy-900 bg-navy-100' : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-navy-100">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-navy-900 text-lg">
          <div className="w-9 h-9 rounded-xl bg-navy-800 text-white flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-accent-400" />
          </div>
          ShopSmart <span className="text-accent-600">AI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          <NavLink to="/" end className={navLink}>Home</NavLink>
          <NavLink to="/catalog" className={navLink}>Catalog</NavLink>
          <NavLink to="/assistant" className={navLink}>
            <span className="inline-flex items-center gap-1"><Sparkles className="w-4 h-4" /> AI Shopping</span>
          </NavLink>
          <NavLink to="/policies" className={navLink}>
            <span className="inline-flex items-center gap-1"><FileText className="w-4 h-4" /> Policies</span>
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link to="/catalog" className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-navy-600 text-sm hover:bg-slate-200">
            <Search className="w-4 h-4" /> Search
          </Link>
          {user && (
            <Link to="/wishlist" className="p-2 rounded-lg hover:bg-navy-50 text-navy-700" title="Wishlist">
              <Heart className="w-5 h-5" />
            </Link>
          )}
          <Link to="/cart" className="relative p-2 rounded-lg hover:bg-navy-50 text-navy-700">
            <ShoppingBag className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center">{count}</span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-1">
              {user.role === 'admin' && (
                <Link to="/admin" className="btn-outline text-sm px-3 py-1.5">
                  <LayoutDashboard className="w-4 h-4" /> Admin
                </Link>
              )}
              <Link to="/orders" className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-navy-50 text-sm text-navy-700">
                <User className="w-4 h-4" /> {user.name.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-navy-50 text-navy-700" title="Log out">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary text-sm px-3 py-1.5">Log in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
