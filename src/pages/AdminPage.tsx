import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Layers, 
  AlertTriangle, 
  Building2, 
  Lock, 
  QrCode, 
  Users, 
  Trash2,
  Check, 
  SlidersHorizontal,
  FileText
} from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { useAuth } from '../context/AuthContext';
import { RoleBadge, StatusBadge, TypeBadge } from '../components/common/Badge';
import { QRHandoverModal } from '../components/common/QRHandoverModal';
import { Claim, Item } from '../types';
import { CanvasDropZoneAction } from '../components/canvas/CanvasDropZoneAction';

export const AdminPage: React.FC = () => {
  const { role, user } = useAuth();
  const { items, claims, reviewClaim, confirmHandover, deleteReport, refreshData, showToast } = useItems();

  const [activeQueue, setActiveQueue] = useState<'claims' | 'items' | 'handovers'>('claims');
  const [selectedClaimForQR, setSelectedClaimForQR] = useState<Claim | null>(null);
  const [moderatingId, setModeratingId] = useState<string | null>(null);

  // Authorization Check - strictly verified against authenticated user role
  const isAuthorized = role === 'campus_security' || role === 'admin';

  if (!isAuthorized) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-navy-950">Restricted Administrative Area</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Access to the moderation queue and confidential evidence review is strictly restricted to verified Campus Safety Officers and System Administrators.
        </p>
        <div className="mt-6">
          <Link
            to="/explore"
            className="px-5 py-2.5 rounded-xl bg-navy-950 text-white font-semibold text-xs"
          >
            Return to Explore
          </Link>
        </div>
      </div>
    );
  }

  // Derived counts from actual database
  const pendingClaims = claims.filter((c) => c.status === 'submitted' || c.status === 'under_review');
  const approvedHandovers = claims.filter((c) => c.status === 'approved' || c.status === 'handover_pending');
  const activeItemsCount = items.filter((i) => i.status === 'open' || i.status === 'potential_match').length;
  const returnedCount = items.filter((i) => i.status === 'returned').length;

  const handleDeleteItem = async (itemId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete report "${title}"? This action is permanent.`)) {
      return;
    }
    setModeratingId(itemId);
    try {
      await deleteReport(itemId);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
    } finally {
      setModeratingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-950 text-teal-300 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              <span>Campus Security & Moderation Console</span>
            </div>
            <RoleBadge role={role} size="sm" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
            Administrative Oversight
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Logged in as <strong>{user?.full_name}</strong> ({role === 'campus_security' ? 'Campus Safety Division' : 'Operations'}).
          </p>
        </div>

        <button
          onClick={refreshData}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors self-start sm:self-auto shadow-xs"
        >
          Refresh Queue
        </button>
      </div>

      {/* KPI Stats Derived From Actual Records */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
            Pending Claims Queue
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1 tabular-nums font-mono">
            {pendingClaims.length}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
            Handovers Ready
          </span>
          <div className="text-2xl font-black text-teal-600 mt-1 tabular-nums font-mono">
            {approvedHandovers.length}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
            Active Campus Reports
          </span>
          <div className="text-2xl font-black text-navy-950 mt-1 tabular-nums font-mono">
            {activeItemsCount}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
            Total Reunified
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1 tabular-nums font-mono">
            {returnedCount}
          </div>
        </div>
      </div>

      {/* Queue Tabs */}
      <div className="flex border-b border-slate-200 mb-6 space-x-6 text-xs font-bold">
        <button
          onClick={() => setActiveQueue('claims')}
          className={`pb-3 transition-colors border-b-2 ${
            activeQueue === 'claims'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Claims Review Queue ({pendingClaims.length})
        </button>
        <button
          onClick={() => setActiveQueue('handovers')}
          className={`pb-3 transition-colors border-b-2 ${
            activeQueue === 'handovers'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Approved Handover Passes ({approvedHandovers.length})
        </button>
        <button
          onClick={() => setActiveQueue('items')}
          className={`pb-3 transition-colors border-b-2 ${
            activeQueue === 'items'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Reports Moderation ({items.length})
        </button>
      </div>

      {/* Queue Content */}
      {activeQueue === 'claims' && (
        <div className="space-y-4">
          {pendingClaims.length > 0 ? (
            pendingClaims.map((claim) => (
              <div
                key={claim.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      CLAIM #{claim.id.slice(0, 8).toUpperCase()}
                    </span>
                    <StatusBadge status={claim.status} size="sm" />
                    <span className="text-[11px] text-slate-400">
                      {new Date(claim.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-navy-950">
                    Claim on "{claim.item?.title || claim.report?.title || 'Report'}"
                  </h3>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                    <span className="font-bold text-slate-900 block mb-1">
                      Submitted Private Ownership Evidence:
                    </span>
                    <p className="leading-relaxed whitespace-pre-line font-mono text-[11px]">
                      {claim.message || claim.ownership_proof}
                    </p>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-4 pt-1">
                    <span>
                      Claimant: <strong>{claim.claimant?.full_name || 'Campus Student'}</strong>
                    </span>
                    {claim.claimant?.email && (
                      <span className="text-slate-400">({claim.claimant.email})</span>
                    )}
                  </div>
                </div>

                {/* Review Actions */}
                <div className="flex sm:flex-col gap-2 flex-shrink-0">
                  <Link
                    to={`/claims/${claim.id}`}
                    className="px-4 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs text-center shadow-soft"
                  >
                    Open Review Console
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-navy-950">Claims Queue Clear</h3>
              <p className="text-xs text-slate-500 mt-1">
                There are no pending ownership claims awaiting review.
              </p>
            </div>
          )}
        </div>
      )}

      {activeQueue === 'handovers' && (
        <div className="space-y-4">
          {approvedHandovers.length > 0 ? (
            approvedHandovers.map((claim) => (
              <div
                key={claim.id}
                className="bg-white rounded-3xl p-6 border border-teal-200 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-teal-800">
                      PASS: {claim.handover_code}
                    </span>
                    <StatusBadge status={claim.status} size="sm" />
                  </div>
                  <h4 className="text-base font-bold text-navy-950">
                    {claim.item?.title || claim.report?.title}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Pickup Location: <strong>{claim.handover_location}</strong> • Claimant:{' '}
                    <strong>{claim.claimant?.full_name}</strong>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => setSelectedClaimForQR(claim)}
                    className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs border border-teal-200 flex items-center gap-1.5 self-start sm:self-center"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>View QR Pass</span>
                  </button>

                  <div className="w-full sm:w-auto min-w-[280px]">
                    <CanvasDropZoneAction
                      cardLabel="Handover Token"
                      cardSublabel="Drag to authorize"
                      cardIcon={<Check className="w-4 h-4 text-white" />}
                      zoneLabel="Handover Authorization Bay"
                      zoneDescription="Drop here to execute return"
                      variant="teal"
                      compact
                      confirmMessage="Confirm in-person handover of this item?"
                      onExecute={async () => {
                        await confirmHandover(claim.id);
                      }}
                      keyboardActionName="Confirm Handover"
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <Clock className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-navy-950">No Active Handovers</h3>
              <p className="text-xs text-slate-500 mt-1">
                Approved claims with scheduled desk collections will appear here.
              </p>
            </div>
          )}
        </div>
      )}

      {activeQueue === 'items' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-card">
          <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Report Details</span>
            <span>Actions</span>
          </div>

          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <TypeBadge type={item.report_type || item.type || 'lost'} size="sm" />
                    <StatusBadge status={item.status} size="sm" />
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-navy-950">{item.title}</h4>
                  <p className="text-xs text-slate-500">
                    Location: {item.location_name} • Category: {item.category} • Reporter:{' '}
                    {item.author_name}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/items/${item.id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200"
                  >
                    View
                  </Link>
                  <div className="w-full sm:w-auto min-w-[240px]">
                    <CanvasDropZoneAction
                      cardLabel="Revoke Token"
                      cardSublabel="Drag to delete"
                      cardIcon={<Trash2 className="w-3.5 h-3.5 text-white" />}
                      zoneLabel="Purge Bay"
                      zoneDescription="Drop to delete"
                      variant="rose"
                      compact
                      disabled={moderatingId === item.id}
                      confirmMessage={`Are you sure you want to delete report "${item.title}"? This action is permanent.`}
                      onExecute={() => handleDeleteItem(item.id, item.title)}
                      keyboardActionName="Delete Report"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Code Handover Modal */}
      {selectedClaimForQR && (
        <QRHandoverModal
          isOpen={Boolean(selectedClaimForQR)}
          onClose={() => setSelectedClaimForQR(null)}
          claim={selectedClaimForQR}
        />
      )}
    </div>
  );
};
