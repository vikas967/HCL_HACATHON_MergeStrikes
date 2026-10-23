import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(name, email, password);
      toast.success(`Welcome, ${user.name.split(' ')[0]}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="card p-6 max-w-md w-full">
        <div className="font-bold text-navy-900 text-lg">Create account</div>
        <p className="text-sm text-navy-500 mt-1">Join ShopSmart AI</p>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <div>
            <label className="label">Name</label>
            <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <button className="btn-primary w-full py-2.5" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Create account
          </button>
        </form>
        <div className="mt-4 text-sm text-navy-500">
          Already registered? <Link className="text-accent-700 hover:underline" to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
