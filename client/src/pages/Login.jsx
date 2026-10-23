import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('demo@shopsmart.ai');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="card p-6 max-w-md w-full">
        <div className="flex items-center gap-2 text-navy-900 font-bold text-lg">
          <Sparkles className="w-5 h-5 text-accent-500" /> Welcome back
        </div>
        <p className="text-sm text-navy-500 mt-1">Log in to ShopSmart AI</p>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <div>
            <label className="label">Email</label>
            <input className="input mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn-primary w-full py-2.5" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Log in
          </button>
        </form>
        <div className="mt-4 text-sm text-navy-500">
          No account? <Link className="text-accent-700 hover:underline" to="/register">Create one</Link>
        </div>
        <div className="mt-4 text-xs text-navy-500 bg-slate-50 rounded-lg p-3 border border-slate-200">
          <strong>Demo credentials</strong>
          <div>Customer: demo@shopsmart.ai / demo1234</div>
          <div>Admin: admin@shopsmart.ai / admin1234</div>
        </div>
      </div>
    </div>
  );
}
