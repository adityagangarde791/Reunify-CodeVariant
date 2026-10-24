import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Shield, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  Share2, 
  ShieldCheck,
  Building2, 
  Send, 
  Lock,
  Trash2,
  Check
} from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { useAuth } from '../context/AuthContext';
import { Item, CaseTimelineEvent, MatchCandidate } from '../types';
import { TypeBadge, StatusBadge } from '../components/common/Badge';

export const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getItemById, getTimelineForItem, getSmartMatches, submitClaim, deleteReport, showToast } = useItems();
  const { user, role, isAuthenticated } = useAuth();

  const [item, setItem] = useState<Item | null>(null);
  const [timeline, setTimeline] = useState<CaseTimelineEvent[]>([]);
  const [matches, setMatches] = useState<MatchCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  // Claim modal state
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [ownershipProof, setOwnershipProof] = useState('');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadItemData() {
      if (!id) return;
      setLoading(true);
      const fetched = await getItemById(id);
      setItem(fetched);

      if (fetched) {
        const events = await getTimelineForItem(fetched.id);
        setTimeline(events);

        const candidates = getSmartMatches(fetched.id);
        setMatches(candidates);
      }
      setLoading(false);
    }

    loadItemData();
  }, [id, getItemById]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded mx-auto mb-4" />
        <div className="h-72 w-full bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <ShieldAlert className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-navy-950">Report Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">
          The requested lost or found report does not exist or has been removed.
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-navy-950 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Explore</span>
        </Link>
      </div>
    );
  }

  const isOwner = user && user.id === item.user_id;
  const isSecurityOrAdmin = role === 'campus_security' || role === 'admin';
  const canViewConfidential = isOwner || isSecurityOrAdmin;

  const handleOpenClaimModal = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setClaimModalOpen(true);
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownershipProof.trim()) return;

    setIsSubmittingClaim(true);
    try {
      await submitClaim(item.id, ownershipProof.trim());
      setClaimModalOpen(false);
      setOwnershipProof('');
      navigate('/my-cases');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Claim failed', 'error');
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteReport(item.id);
      navigate('/explore');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete report', 'error');
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Reunify: ${item.title}`,
        text: item.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'info');
    }
  };

  const formattedDate = new Date(item.date_lost_or_found || item.incident_date || item.created_at).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Breadcrumb & Share */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share Report</span>
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Media Gallery & Timeline */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-card">
            <div className="relative aspect-[16/10] bg-slate-100">
              {item.primary_image_url || item.image_url ? (
                <img
                  src={item.primary_image_url || item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                  <ShieldCheck className="w-12 h-12 text-slate-300 mb-2" />
                  <span className="text-xs font-medium">No photograph uploaded</span>
                </div>
              )}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <TypeBadge type={item.report_type || item.type || 'lost'} />
                <StatusBadge status={item.status} />
              </div>
            </div>

            {/* Description & Non-Sensitive Details */}
            <div className="p-6 sm:p-8">
              <h2 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">
                Item Description
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>

              {/* Custody Info for Found items */}
              {(item.report_type === 'found' || item.type === 'found') && item.custody_location && (
                <div className="mt-6 p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-teal-950">Custodial Safety Location</h4>
                    <p className="text-xs text-teal-900 mt-0.5">
                      Physically held at: <strong>{item.custody_location}</strong>
                    </p>
                    <p className="text-[11px] text-teal-700 mt-1">
                      Present an approved claim verification pass to collect this item.
                    </p>
                  </div>
                </div>
              )}

              {/* Confidential Clues (Protected by RLS) */}
              {item.confidential_notes && (
                <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Confidential Ownership Clues</span>
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Private Field
                    </span>
                  </div>
                  {canViewConfidential ? (
                    <p className="text-xs text-slate-600 leading-relaxed font-mono bg-white p-2.5 rounded-xl border border-slate-200">
                      {item.confidential_notes}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      Hidden from public view. Only accessible to the item reporter and authorized campus security reviewers.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Case Timeline Stream */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-700" />
                <span>Case Activity Timeline</span>
              </h3>
              <Link
                to={`/cases/${item.id}`}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                Detailed Audit View →
              </Link>
            </div>

            <div className="space-y-4">
              {timeline.length > 0 ? (
                timeline.map((event, idx) => (
                  <div key={event.id} className="flex items-start gap-3 relative">
                    {idx < timeline.length - 1 && (
                      <div className="absolute left-2.5 top-5 bottom-0 w-0.5 bg-slate-100" />
                    )}
                    <span className="w-5 h-5 rounded-full bg-teal-50 border border-teal-600/30 text-teal-700 flex items-center justify-center text-[10px] flex-shrink-0 z-10">
                      •
                    </span>
                    <div className="text-xs flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy-950">{event.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(event.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-0.5 leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No events recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Metadata, Primary CTA & Potential Matches */}
        <div className="lg:col-span-5 space-y-6">
          {/* Item Info Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card space-y-6">
            <div>
              <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
                {item.category?.replace('_', ' ')}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-navy-950 mt-1 leading-snug">
                {item.title}
              </h1>
            </div>

            <div className="space-y-3 pt-2 text-xs text-slate-600 border-t border-slate-100">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800">Location</div>
                  <div>{item.location_name || item.location}</div>
                  {item.campus_zone && (
                    <div className="text-[11px] text-slate-400">{item.campus_zone}</div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800">
                    {item.report_type === 'lost' || item.type === 'lost' ? 'Date Lost' : 'Date Discovered'}
                  </div>
                  <div>{formattedDate}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800">Reporter Identity</div>
                  <div>
                    {item.author_name || 'Campus Member'}
                    {item.author_role && (
                      <span className="text-[10px] text-slate-400 ml-1.5 capitalize">
                        ({item.author_role.replace('_', ' ')})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              {(item.report_type === 'found' || item.type === 'found') && !isOwner && item.status !== 'returned' && (
                <button
                  onClick={handleOpenClaimModal}
                  className="w-full py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-soft transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Claim Ownership of This Item</span>
                </button>
              )}

              {(item.report_type === 'lost' || item.type === 'lost') && (
                <Link
                  to="/matches"
                  className="w-full py-3.5 rounded-2xl bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs shadow-soft transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span>Search Compatible Matches</span>
                </Link>
              )}

              <Link
                to={`/cases/${item.id}`}
                className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors flex items-center justify-center"
              >
                View Complete Case Audit File
              </Link>

              {/* Owner / Staff Actions */}
              {(isOwner || isSecurityOrAdmin) && (
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    disabled={isDeleting}
                    onClick={handleDelete}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Report</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Potential Matches Box */}
          {matches.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-navy-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>Smart Candidates ({matches.length})</span>
                </span>
                <Link to="/matches" className="text-[11px] font-semibold text-teal-700">
                  All Matches →
                </Link>
              </div>

              <div className="space-y-3">
                {matches.slice(0, 2).map((cand) => {
                  const counterpart = (item.report_type === 'lost' || item.type === 'lost') ? cand.found_item : cand.lost_item;
                  return (
                    <Link
                      key={cand.id}
                      to={`/items/${counterpart.id}`}
                      className="p-3 rounded-2xl border border-slate-200 hover:border-teal-700 flex items-center gap-3 transition-all hover:bg-teal-50/20 group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden">
                        {counterpart.primary_image_url || counterpart.image_url ? (
                          <img
                            src={counterpart.primary_image_url || counterpart.image_url}
                            alt={counterpart.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                            No Photo
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-navy-950 truncate group-hover:text-teal-700">
                            {counterpart.title}
                          </span>
                          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full ml-1 flex-shrink-0">
                            {cand.score}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {counterpart.location_name || counterpart.location}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Claim Submission Modal */}
      {claimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 text-slate-900">
            <div className="bg-navy-950 p-6 text-white">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-950 border border-teal-800 text-teal-400 text-xs font-semibold mb-2">
                <Lock className="w-3.5 h-3.5" />
                Confidential Ownership Claim
              </div>
              <h3 className="text-lg font-bold">Claim "{item.title}"</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Provide private evidence only the owner would know. This evidence is protected by database Row Level Security and only reviewed by Campus Security.
              </p>
            </div>

            <form onSubmit={handleClaimSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Private Verification Evidence <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail hidden unique marks, serial numbers, password patterns, internal contents, purchase receipts, or specific stickers that prove your ownership..."
                  value={ownershipProof}
                  onChange={(e) => setOwnershipProof(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-800 space-y-1">
                <p className="font-semibold">Security Notice:</p>
                <p>
                  False claims violate the University Campus Code of Conduct. Once submitted, your evidence will be queued in the reviewer moderation dashboard.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setClaimModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingClaim}
                  className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-soft transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingClaim ? 'Submitting to Supabase...' : 'Submit Claim'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
