import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';

export const ForgotPasswordPage: React.FC = () => {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await requestPasswordReset(email);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-elevated">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>

        <div className="text-center mb-6">
          <Logo size="md" className="justify-center mb-3" />
          <h1 className="text-xl font-black text-slate-900">
            Password Recovery
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter your registered campus email to receive a secure reset link.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="p-6 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto" />
            <h3 className="text-xs font-bold text-teal-900">Recovery Instructions Dispatched</h3>
            <p className="text-xs text-teal-800 leading-relaxed">
              If an account is associated with <strong>{email}</strong>, a password reset link has been dispatched.
            </p>
            <Link
              to="/login"
              className="inline-block mt-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Campus Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="student@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-brand-blue"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs shadow-soft-glow transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Sending Link...' : 'Send Reset Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
