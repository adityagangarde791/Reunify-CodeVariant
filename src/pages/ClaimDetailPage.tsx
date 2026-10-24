import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  QrCode, 
  Clock, 
  User, 
  MapPin, 
  AlertCircle 
} from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { useAuth } from '../context/AuthContext';
import { Claim } from '../types';
import { StatusBadge } from '../components/common/Badge';
import { QRHandoverModal } from '../components/common/QRHandoverModal';

export const ClaimDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClaimById, reviewClaim, confirmHandover } = useItems();
  const { user, role } = useAuth();

  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [handoverSpot, setHandoverSpot] = useState('Campus Security Office - Desk 1');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function loadClaim() {
      if (!id) return;
      setLoading(true);
      const fetched = await getClaimById(id);
      setClaim(fetched);
      if (fetched?.reviewer_notes) {
        setReviewerNotes(fetched.reviewer_notes);
      }
      setLoading(false);
    }
    loadClaim();
  }, [id, getClaimById]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded mb-4" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Claim Record Not Found</h2>
        <Link to="/my-cases" className="text-xs text-brand-blue underline mt-4 inline-block">
          Return to My Cases
        </Link>
      </div>
    );
  }

  const isClaimant = user && user.id === claim.claimant_id;
  const isAuthorizedReviewer = role === 'campus_security' || role === 'admin';
  const canViewEvidence = isClaimant || isAuthorizedReviewer;

  const handleReviewAction = async (approved: boolean) => {
    setIsProcessing(true);
    const updated = await reviewClaim(claim.id, approved, reviewerNotes || (approved ? 'Proof verified.' : 'Evidence insufficient.'), handoverSpot);
    if (updated) {
      setClaim(updated);
    }
    setIsProcessing(false);
  };

  const handleReturnAction = async () => {
    setIsProcessing(true);
    const success = await confirmHandover(claim.id);
    if (success) {
      setClaim((prev) => (prev ? { ...prev, status: 'returned' } : null));
    }
    setIsProcessing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh]">
      <Link
        to="/my-cases"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Cases</span>
      </Link>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold text-slate-400">
                CLAIM #{claim.id.slice(-8).toUpperCase()}
              </span>
              <StatusBadge status={claim.status} />
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              Claim for {claim.item?.title || 'Reported Belonging'}
            </h1>
          </div>

          <div className="text-xs text-slate-500 space-y-1 sm:text-right">
            <div>
              Submitted on:{' '}
              <span className="font-semibold text-slate-800">
                {new Date(claim.created_at).toLocaleDateString()}
              </span>
            </div>
            <div>
              Claimant:{' '}
              <span className="font-semibold text-slate-800">
                {claim.claimant?.full_name || 'Campus Student'}
              </span>
            </div>
          </div>
        </div>

        {/* Claim Status Stepper */}
        <div className="pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className={`p-2.5 rounded-xl border ${claim.status !== 'rejected' ? 'bg-blue-50 border-blue-200 font-bold text-brand-blue' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              1. Submitted
            </div>
            <div className={`p-2.5 rounded-xl border ${claim.status === 'under_review' || claim.status === 'approved' || claim.status === 'returned' ? 'bg-amber-50 border-amber-200 font-bold text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              2. Under Review
            </div>
            <div className={`p-2.5 rounded-xl border ${claim.status === 'approved' || claim.status === 'returned' ? 'bg-teal-50 border-teal-200 font-bold text-teal-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              3. Handover Ready
            </div>
            <div className={`p-2.5 rounded-xl border ${claim.status === 'returned' ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              4. Reunified
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Confidential Ownership Evidence */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Confidential Ownership Evidence</span>
              </h3>
              <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Encrypted & RLS Protected
              </span>
            </div>

            {canViewEvidence ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-mono">
                {claim.ownership_proof}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400">
                Private verification details are protected. Only the claimant and authorized review staff have clearance.
              </div>
            )}

            {claim.reviewer_notes && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  Reviewer Notes:
                </span>
                <p className="text-xs text-slate-600 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  {claim.reviewer_notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Reviewer Controls or Handover Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* If Approved, Show Handover Card */}
          {claim.status === 'approved' && (
            <div className="bg-teal-50 border border-teal-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <span>Handover Verification Ready</span>
              </div>
              <p className="text-xs text-teal-800 leading-relaxed">
                Claim has been approved! Present the digital QR token at the security desk to collect the belonging.
              </p>

              <button
                onClick={() => setQrModalOpen(true)}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <QrCode className="w-4 h-4" />
                <span>View Digital Handover Pass</span>
              </button>

              {isAuthorizedReviewer && (
                <button
                  onClick={handleReturnAction}
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-xl bg-white border border-teal-300 text-teal-800 font-semibold text-xs hover:bg-teal-100/50 transition-colors"
                >
                  Confirm Physical Handover (Officer Action)
                </button>
              )}
            </div>
          )}

          {/* Reviewer Action Box (Campus Security / Admin) */}
          {isAuthorizedReviewer && claim.status !== 'returned' && claim.status !== 'approved' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
              <span className="text-xs font-bold text-slate-900 block border-b border-slate-100 pb-2">
                Authorized Reviewer Actions
              </span>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Designated Handover Desk
                </label>
                <input
                  type="text"
                  value={handoverSpot}
                  onChange={(e) => setHandoverSpot(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Review Assessment Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Verification rationale or reason for decline..."
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => handleReviewAction(true)}
                  disabled={isProcessing}
                  className="py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Claim</span>
                </button>
                <button
                  onClick={() => handleReviewAction(false)}
                  disabled={isProcessing}
                  className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Claim</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {qrModalOpen && (
        <QRHandoverModal
          claim={claim}
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
        />
      )}
    </div>
  );
};
