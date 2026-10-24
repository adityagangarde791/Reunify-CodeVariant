import React, { useState } from 'react';
import { Database, Settings, KeyRound, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { saveSupabaseCredentials, clearSupabaseCredentials, SUPABASE_URL } from '../../lib/supabase';

export const SupabaseStatusBanner: React.FC = () => {
  const { isSupabaseConnected } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [urlInput, setUrlInput] = useState(SUPABASE_URL || '');
  const [keyInput, setKeyInput] = useState('');
  const [dismissed, setDismissed] = useState(false);

  // If Supabase is properly configured, do not render any banner in production
  if (isSupabaseConnected || dismissed) {
    return null;
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput && keyInput) {
      saveSupabaseCredentials(urlInput, keyInput);
    }
  };

  return (
    <>
      {/* Unconfigured Supabase Warning Banner */}
      <div className="bg-amber-950 text-amber-200 text-[11px] py-1.5 px-4 border-b border-amber-800 flex items-center justify-between z-50">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>
              <strong className="text-white">Supabase Configuration Required:</strong> Set{' '}
              <code className="text-amber-300 bg-amber-900/60 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and{' '}
              <code className="text-amber-300 bg-amber-900/60 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> in your{' '}
              <code className="text-amber-300 bg-amber-900/60 px-1 py-0.5 rounded">.env</code> to enable live persistence.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="text-amber-300 hover:text-white underline flex items-center gap-1 font-semibold transition-colors"
            >
              <Settings className="w-3 h-3" />
              <span>Configure Credentials</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-amber-400 hover:text-white"
              title="Dismiss banner"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 text-slate-900">
            <div className="bg-navy-900 p-6 text-white">
              <div className="flex items-center gap-2 mb-1">
                <Database className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold">Supabase PostgreSQL Connection</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect your real Supabase project to execute live queries with Row Level Security.
                Run the database migration at <code>supabase/migrations/20261024000001_initial_schema.sql</code>.
              </p>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-blue outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supabase Anon Key (Public)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-blue outline-none"
                    required
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">Quick Setup Instructions:</p>
                <ol className="list-decimal pl-4 space-y-0.5 text-[11px]">
                  <li>
                    Create a free project at{' '}
                    <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-brand-blue underline">
                      supabase.com
                    </a>
                  </li>
                  <li>Copy your Project URL and anon public API key</li>
                  <li>Execute the initial schema in the Supabase SQL Editor</li>
                </ol>
              </div>

              <div className="pt-2 flex items-center justify-between">
                {isSupabaseConnected ? (
                  <button
                    type="button"
                    onClick={clearSupabaseCredentials}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                  >
                    Disconnect
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-brand-blue hover:bg-blue-600 text-white shadow-soft-glow transition-all"
                  >
                    Save & Connect
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
