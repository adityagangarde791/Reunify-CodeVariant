import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  Sparkles, 
  ShieldCheck, 
  CheckCheck, 
  ArrowRight, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { EmptyState } from '../components/common/EmptyState';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadNotifsCount, markNotificationRead, markAllNotificationsRead } = useItems();

  const getIcon = (type: string) => {
    switch (type) {
      case 'match_found':
        return <Sparkles className="w-5 h-5 text-cyan-500" />;
      case 'claim_update':
        return <ShieldCheck className="w-5 h-5 text-brand-blue" />;
      case 'handover_ready':
      case 'item_returned':
        return <CheckCheck className="w-5 h-5 text-teal-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-brand-blue text-xs font-semibold mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>Alerts & Activity Stream</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time match alerts, claim status transitions, and handover readiness updates.
          </p>
        </div>

        {unreadNotifsCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-blue bg-blue-50 hover:bg-blue-100 transition-colors self-start sm:self-auto flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationRead(notif.id)}
              className={`p-5 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer ${
                notif.is_read
                  ? 'bg-white border-slate-200/80 shadow-sm opacity-80 hover:opacity-100'
                  : 'bg-white border-brand-blue/30 shadow-card ring-1 ring-brand-blue/10'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-xs ${notif.is_read ? 'font-semibold text-slate-800' : 'font-extrabold text-slate-900'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {notif.message}
                </p>

                {notif.link_url && (
                  <Link
                    to={notif.link_url}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-blue hover:text-blue-700 mt-2"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {!notif.is_read && (
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="inbox"
          title="No Notifications"
          description="You're all caught up! New matches, claim updates, and handover reminders will appear here."
        />
      )}
    </div>
  );
};
