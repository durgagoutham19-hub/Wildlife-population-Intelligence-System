import React, { useState } from 'react';
import { Shield, Sparkles, AlertCircle, Compass, Lock, Mail, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { apiFetch } from '../utils/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await apiFetch('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password: password.trim() })
    });

    if (!res.ok) {
      setError(res.error || 'Incorrect email or password');
      setLoading(false);
      return;
    }

    const data = res.data;
    const userObj = {
      user_id: data.user_id,
      email: data.email,
      role: data.role,
      full_name: data.name,
    };
    login(data.access_token, userObj);
    navigate('/dashboard');
    setLoading(false);
  };

  // Predefined role credentials for instant evaluator testing
  const quickLogins = [
    { name: 'Wildlife Researcher', email: 'researcher@wildlife.org', role: 'wildlife_researcher', badge: 'AI & Metrics' },
    { name: 'Conservation Officer', email: 'officer@wildlife.org', role: 'conservation_officer', badge: 'Alerts & Policies' },
    { name: 'Forest Officer', email: 'forest@wildlife.org', role: 'forest_department_officer', badge: 'Sensors & Patrols' },
    { name: 'Administrator', email: 'admin@wildlife.org', role: 'administrator', badge: 'Full Admin' }
  ];

  const handleQuickLogin = async (emailVal) => {
    setLoading(true);
    setError('');
    const res = await apiFetch('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: emailVal, password: 'password123' })
    });

    if (!res.ok) {
      setError(res.error || 'Login failed');
      setLoading(false);
      return;
    }

    const data = res.data;
    const userObj = { user_id: data.user_id, email: data.email, role: data.role, full_name: data.name };
    login(data.access_token, userObj);
    navigate('/dashboard');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden font-sans">
      {/* Background Animated Gradient Meshes */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-md w-full space-y-7 bg-slate-900/80 border border-slate-800 backdrop-blur-2xl p-8 md:p-10 rounded-3xl shadow-2xl z-10">
        <div className="text-center space-y-2">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-300 p-0.5 shadow-xl shadow-emerald-500/20 flex items-center justify-center">
            <div className="h-full w-full bg-slate-950/40 rounded-[14px] flex items-center justify-center">
              <Compass className="h-7 w-7 text-emerald-300" />
            </div>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white pt-2">
            BioSphere Intelligence
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            AI-Driven Biodiversity, Bioacoustic & Wildlife Telemetry Platform
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-3 text-rose-400 text-xs">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="officer@wildlife.org"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider font-extrabold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 hover:brightness-110 active:scale-[0.99] focus:outline-none transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Platform</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-slate-900 px-3 text-slate-400 font-bold tracking-widest">
              1-Click Demo Evaluation
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {quickLogins.map((btn) => (
            <button
              key={btn.email}
              onClick={() => handleQuickLogin(btn.email)}
              className="flex flex-col text-left p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-950 transition-all group"
            >
              <div className="flex items-center justify-between w-full">
                <p className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors truncate">
                  {btn.name}
                </p>
                <Sparkles className="h-3 w-3 text-slate-600 group-hover:text-emerald-400 transition-colors shrink-0" />
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5">{btn.badge}</span>
            </button>
          ))}
        </div>

        {/* Register Link */}
        <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800/80">
          Need a new wildlife account?{' '}
          <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}
