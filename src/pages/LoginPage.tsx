import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import { CanvasDropZoneAction } from '../components/canvas/CanvasDropZoneAction';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Return to intended location or explore
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/explore';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both your campus email and password.');
      return;
    }

    setLoading(true);
    const res = await signIn(email.trim(), password);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-elevated">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center mb-4" />
          <h1 className="text-2xl font-black text-navy-950 tracking-tight">
            Sign in to Reunify
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your verified campus lost & found reports and claims.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Campus Email
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="your.name@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-teal-600 transition-all"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-800">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] font-semibold text-teal-700 hover:text-teal-800"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-teal-600 transition-all"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="pt-2">
            <CanvasDropZoneAction
              cardLabel="Campus Keycard"
              cardSublabel="Drag to authenticate"
              cardIcon={<Lock className="w-4 h-4 text-white" />}
              zoneLabel="Supabase Auth Gateway"
              zoneDescription="Drop here to authorize session"
              variant="navy"
              isLoading={loading}
              loadingLabel="Authenticating with Supabase..."
              disabled={loading}
              onValidate={() => {
                if (!email.trim() || !password) {
                  throw new Error('Please provide both your campus email and password.');
                }
                return true;
              }}
              onExecute={async () => {
                await handleSubmit({ preventDefault: () => {} } as React.FormEvent);
              }}
              keyboardActionName="Sign In"
            />
          </div>
        </form>

        {/* Security Assurance */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <Shield className="w-3.5 h-3.5 text-teal-600" />
          <span>Protected with Supabase Authentication & Row Level Security</span>
        </div>

        {/* Register Link */}
        <div className="mt-4 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-teal-700 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
