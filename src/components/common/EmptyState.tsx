import React from 'react';
import { Search, Inbox, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'search' | 'inbox' | 'alert';
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'inbox',
  actionLabel,
  actionHref,
  onActionClick,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto shadow-card">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-sm">
        {icon === 'search' && <Search className="w-8 h-8 text-brand-blue" />}
        {icon === 'inbox' && <Inbox className="w-8 h-8 text-slate-400" />}
        {icon === 'alert' && <AlertCircle className="w-8 h-8 text-amber-500" />}
      </div>

      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-1.5 max-w-sm leading-relaxed">{description}</p>

      {actionLabel && (
        <div className="mt-6">
          {actionHref ? (
            <Link
              to={actionHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white text-xs font-semibold shadow-soft-glow transition-all"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={onActionClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
