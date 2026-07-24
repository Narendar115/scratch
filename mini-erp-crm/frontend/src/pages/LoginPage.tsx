import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Lock, Mail, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email: loginEmail, password: loginPass });
      setAuth(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}! (${res.data.user.role} Role)`);
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Invalid credentials. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const handleQuickLogin = (targetEmail: string) => {
    setEmail(targetEmail);
    setPassword('password123');
    performLogin(targetEmail, 'password123');
  };

  const quickRoles = [
    { label: 'Admin', email: 'admin@company.com', color: 'border-purple-500 hover:bg-purple-950/60 text-purple-300' },
    { label: 'Sales', email: 'sales@company.com', color: 'border-blue-500 hover:bg-blue-950/60 text-blue-300' },
    { label: 'Warehouse', email: 'warehouse@company.com', color: 'border-amber-500 hover:bg-amber-950/60 text-amber-300' },
    { label: 'Accounts', email: 'accounts@company.com', color: 'border-emerald-500 hover:bg-emerald-950/60 text-emerald-300' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-lg shadow-indigo-500/30 mb-4">
            EP
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Mini ERP + CRM Portal
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enterprise Wholesale & Operations Console
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-400 text-sm">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 text-center">
            One-Click Demo Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            {quickRoles.map((r) => (
              <button
                key={r.label}
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin(r.email)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border ${r.color} transition-all flex items-center justify-between disabled:opacity-50`}
              >
                <span>{r.label}</span>
                <CheckCircle2 className="w-3.5 h-3.5 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
