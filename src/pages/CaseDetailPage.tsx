import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { Item, CaseTimelineEvent } from '../types';
import { TypeBadge, StatusBadge } from '../components/common/Badge';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getItemById, getTimelineForItem } = useItems();
  const [item, setItem] = useState<Item | null>(null);
  const [timeline, setTimeline] = useState<CaseTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCase() {
      if (!id) return;
      setLoading(true);
      const fetched = await getItemById(id);
      setItem(fetched);
      if (fetched) {
        const events = await getTimelineForItem(fetched.id);
        setTimeline(events);
      }
      setLoading(false);
    }
    loadCase();
  }, [id, getItemById, getTimelineForItem]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded mb-4" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-navy-950">Case Record Not Found</h2>
        <Link to="/explore" className="text-xs text-teal-700 underline mt-4 inline-block">
          Return to Explore
        </Link>
      </div>
    );
  }

  const rawIncidentDate = item.incident_date || item.date_lost_or_found || item.created_at;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh]">
      <Link
        to={`/items/${item.id}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Item Details</span>
      </Link>

      {/* Case Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold text-slate-400">
                CASE #{item.id.slice(0, 8).toUpperCase()}
              </span>
              <TypeBadge type={item.report_type || item.type || 'lost'} size="sm" />
              <StatusBadge status={item.status} size="sm" />
            </div>
            <h1 className="text-2xl font-black text-navy-950">{item.title}</h1>
          </div>

          <div className="text-xs text-slate-500 space-y-1 sm:text-right">
            <div>
              Reported on:{' '}
              <span className="font-semibold text-slate-800">
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
            <div>
              Status:{' '}
              <span className="font-semibold text-slate-800 capitalize">
                {item.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Location & Custody Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-800 block">Reported Location</span>
              <span>{item.location_name || item.location || 'Campus'}</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-800 block">Incident Date</span>
              <span>{new Date(rawIncidentDate).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-800 block">Custodial Status</span>
              <span>{item.custody_location || 'Owner Possession / Unconfirmed'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Case Timeline Audit History */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-700" />
            <span>Audit Trail & Event Log</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {timeline.length} Records Logged
          </span>
        </div>

        <div className="space-y-6">
          {timeline.length > 0 ? (
            timeline.map((event, idx) => (
              <div key={event.id} className="flex items-start gap-4 relative">
                {idx < timeline.length - 1 && (
                  <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-slate-100" />
                )}
                <span className="w-6 h-6 rounded-full bg-teal-50 border border-teal-600/30 text-teal-700 flex items-center justify-center text-xs flex-shrink-0 z-10 font-bold">
                  {idx + 1}
                </span>

                <div className="flex-1 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-navy-950">{event.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(event.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">
              No audit events logged yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
