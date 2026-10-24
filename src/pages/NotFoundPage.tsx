import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-card">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <Compass className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          404 Error
        </span>
        <h1 className="text-2xl font-black text-slate-900 mt-1">
          Route Not Found
        </h1>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          The requested page could not be located on the platform. It may have moved or been archived.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white text-xs font-semibold shadow-soft-glow transition-all flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link
            to="/explore"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
          >
            <span>Explore Belongings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
