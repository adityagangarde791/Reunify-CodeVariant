import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import { CanvasDropZoneAction } from '../components/canvas/CanvasDropZoneAction';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, isSupabaseConnected } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Ensure Supabase is configured before attempting sign‑up
    if (!isSupabaseConnected) {
      setError('Supabase is not configured. Please set the project URL and anon key.');
      setLoading(false);
      return;
    }

    setLoading(true);
    const res = await signUp(email, password, fullName);
    setLoading(false);

    if (res.error) {
      // Map common Supabase errors to friendlier messages
      const msg = res.error;
      let friendly = msg;
      const lower = msg.toLowerCase();
      if (lower.includes('already registered') || lower.includes('duplicate')) {
        friendly = 'An account with this email already exists. Please sign in or reset your password.';
      } else if (lower.includes('invalid email')) {
        friendly = 'Please enter a valid campus email address.';
      } else if (lower.includes('password')) {
        friendly = 'Password must meet the required criteria (minimum 6 characters).';
      } else if (lower.includes('rate limit') || lower.includes('too many requests')) {
        friendly = 'Too many registration or confirmation email requests. Please wait before trying again.';
      }
      setError(friendly);
    } else {
      setMessage(res.message || 'Account created successfully!');
      setTimeout(() => navigate('/explore'), 1500);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-elevated">
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center mb-4" />
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Create an Account
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Join the digital campus lost & found network.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-3 mb-6 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Alex Morgan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Campus Email
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="alex.m@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Password (min 6 characters)
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-brand-blue"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-brand-blue"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
            Registered accounts receive standard member privileges. Administrative clearance is granted through internal campus verification.
          </div>

          <div className="pt-2">
            <CanvasDropZoneAction
              cardLabel="Membership Registration Key"
              cardSublabel="Drag to initialize member account"
              cardIcon={<User className="w-4 h-4 text-white" />}
              zoneLabel="Account Activation Chamber"
              zoneDescription="Drop here to register in Supabase"
              variant="blue"
              isLoading={loading}
              loadingLabel="Creating Account in Supabase..."
              disabled={loading}
              onValidate={() => {
                if (password !== confirmPassword) {
                  throw new Error('Passwords do not match');
                }
                if (password.length < 6) {
                  throw new Error('Password must be at least 6 characters');
                }
                return true;
              }}
              onExecute={async () => {
                await handleSubmit({ preventDefault: () => {} } as React.FormEvent);
              }}
              keyboardActionName="Register Account"
            />
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-brand-blue hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
