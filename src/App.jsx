import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import CustomerLayout from './layouts/CustomerLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import Landing from './pages/Landing.jsx';
import Catalog from './pages/Catalog.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import AIAssistant from './pages/AIAssistant.jsx';
import Compare from './pages/Compare.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderConfirmation from './pages/OrderConfirmation.jsx';
import OrderHistory from './pages/OrderHistory.jsx';
import PolicyAssistant from './pages/PolicyAssistant.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AdminOverview from './pages/admin/AdminOverview.jsx';
import AdminInventory from './pages/admin/AdminInventory.jsx';
import AdminLowStock from './pages/admin/AdminLowStock.jsx';
import AdminForecast from './pages/admin/AdminForecast.jsx';
import AdminExpiry from './pages/admin/AdminExpiry.jsx';
import AdminStockAdjust from './pages/admin/AdminStockAdjust.jsx';
import AdminFulfilment from './pages/admin/AdminFulfilment.jsx';
import AdminPromotions from './pages/admin/AdminPromotions.jsx';
import AdminPolicies from './pages/admin/AdminPolicies.jsx';
import AdminOpsAssistant from './pages/admin/AdminOpsAssistant.jsx';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center text-navy-500">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center text-navy-500">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/assistant" element={<AIAssistant />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/policies" element={<PolicyAssistant />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/wishlist" element={<RequireAuth><Wishlist /></RequireAuth>} />
        <Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
        <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
        <Route path="/order/:id" element={<RequireAuth><OrderConfirmation /></RequireAuth>} />
        <Route path="/orders" element={<RequireAuth><OrderHistory /></RequireAuth>} />
      </Route>

      <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route index element={<AdminOverview />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="low-stock" element={<AdminLowStock />} />
        <Route path="forecast" element={<AdminForecast />} />
        <Route path="expiry" element={<AdminExpiry />} />
        <Route path="stock-adjust" element={<AdminStockAdjust />} />
        <Route path="fulfilment" element={<AdminFulfilment />} />
        <Route path="promotions" element={<AdminPromotions />} />
        <Route path="policies" element={<AdminPolicies />} />
        <Route path="ops-assistant" element={<AdminOpsAssistant />} />
      </Route>

      <Route path="*" element={<div className="p-10 text-center text-navy-700">404 — Page not found</div>} />
    </Routes>
  );
}
