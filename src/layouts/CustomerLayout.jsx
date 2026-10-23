import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

export default function CustomerLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
