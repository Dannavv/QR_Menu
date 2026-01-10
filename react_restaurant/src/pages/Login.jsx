import { useState } from 'react';
import { api } from '../services/api';
import { useNavigate, Link } from 'react-router-dom'; // Added Link and useNavigate
import { LogIn, Lock, User, AlertCircle, Globe } from 'lucide-react';

export default function Login({ setAuth }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.login(credentials);
      const { access_token, role, admin_id, restaurant_id } = res.data;

      localStorage.setItem("token", access_token);
      localStorage.setItem("role", role);

      if (role === "admin") localStorage.setItem("admin_id", admin_id);
      if (role === "restaurant") localStorage.setItem("restaurant_id", restaurant_id);

      setAuth(true);
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6">
            <LogIn className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Partner Login
          </h2>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Manage your digital menu and presence
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-400 p-4 flex items-center animate-shake rounded-r-xl">
            <AlertCircle className="h-5 w-5 text-rose-400 mr-3" />
            <p className="text-xs font-bold text-rose-700 uppercase tracking-tight">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-5">
            {/* Username Field */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-300" />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 text-slate-900 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-200 transition-all font-bold text-sm"
                  placeholder="admin_username"
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-300" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 text-slate-900 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-200 transition-all font-bold text-sm"
                  placeholder="••••••••"
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex justify-center py-4 px-4 bg-slate-900 text-white text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
            >
              Sign In
            </button>
          </div>
        </form>

        {/* BROWSE OPTION SECTION */}
        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Not a partner?
          </p>
          <Link 
            to="/browse" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors"
          >
            <Globe size={14} />
            Browse Restaurants
          </Link>
        </div>
      </div>
    </div>
  );
}