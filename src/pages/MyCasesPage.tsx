import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Layers, 
  PlusCircle, 
  Sparkles, 
  QrCode, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  ShieldCheck 
} from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { useAuth } from '../context/AuthContext';
import { ItemCard } from '../components/common/ItemCard';
import { StatusBadge, TypeBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { QRHandoverModal } from '../components/common/QRHandoverModal';
import { Claim } from '../types';

export const MyCasesPage: React.FC = () => {
  const { user } = useAuth();
  const { items, claims } = useItems();
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found' | 'claims'>('all');
  const [selectedClaimForQR, setSelectedClaimForQR] = useState<Claim | null>(null);

  // Filter items created by active user
  const myItems = items.filter((i) => i.user_id === user?.id);
  const myLostItems = myItems.filter((i) => (i.report_type || i.type) === 'lost');
  const myFoundItems = myItems.filter((i) => (i.report_type || i.type) === 'found');

  // Filter claims submitted by active user
  const myClaims = claims.filter((c) => c.claimant_id === user?.id);

  // Pending handovers
  const pendingHandovers = myClaims.filter((c) => c.status === 'approved' || c.status === 'handover_pending');
  const returnedClaims = myClaims.filter((c) => c.status === 'returned');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh]">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
            Personal Recovery Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            My Recovery Cases
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your lost reports, custody records, and verified handover passes for {user?.full_name}.
          </p>
        </div>

        {/* Quick Report Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/report/lost"
            className="px-4 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white text-xs font-semibold shadow-soft-glow transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Lost</span>
          </Link>
          <Link
            to="/report/found"
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-cyan-glow transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Found</span>
          </Link>
        </div>
      </div>

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
            Lost Reports
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums font-mono">
            {myLostItems.length}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
            Found Belongings
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums font-mono">
            {myFoundItems.length}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
            Claims In Review
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums font-mono">
            {myClaims.filter((c) => c.status === 'submitted' || c.status === 'under_review').length}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
            Handover Ready
          </span>
          <div className="text-2xl font-black text-teal-600 mt-1 tabular-nums font-mono">
            {pendingHandovers.length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 space-x-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'all'
              ? 'border-brand-blue text-brand-blue'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Activity ({myItems.length + myClaims.length})
        </button>
        <button
          onClick={() => setActiveTab('lost')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'lost'
              ? 'border-brand-blue text-brand-blue'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Lost Reports ({myLostItems.length})
        </button>
        <button
          onClick={() => setActiveTab('found')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'found'
              ? 'border-brand-blue text-brand-blue'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Found Reports ({myFoundItems.length})
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'claims'
              ? 'border-brand-blue text-brand-blue'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Claims & Passes ({myClaims.length})
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="space-y-8">
        {/* Approved Handover Passes Banner */}
        {pendingHandovers.length > 0 && (
          <div className="bg-teal-50 border border-teal-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-teal-900 font-bold text-sm mb-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <span>You Have {pendingHandovers.length} Approved Handover Pass Ready!</span>
            </div>
            <p className="text-xs text-teal-800 mb-4 leading-relaxed">
              Your ownership verification was approved by Campus Security. Click below to view your digital QR handover pass.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pendingHandovers.map((claim) => (
                <div
                  key={claim.id}
                  className="bg-white p-4 rounded-2xl border border-teal-200 flex items-center justify-between shadow-sm"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {claim.item?.title || 'Claimed Belonging'}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Desk: {claim.handover_location || 'Campus Security Desk 1'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedClaimForQR(claim)}
                    className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1 shadow-sm"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QR Pass</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Claims Section */}
        {(activeTab === 'all' || activeTab === 'claims') && myClaims.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-blue" />
                <span>My Submitted Ownership Claims</span>
              </h3>
            </div>

            <div className="space-y-3">
              {myClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900">
                        {claim.item?.title || 'Item Report'}
                      </span>
                      <StatusBadge status={claim.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      Evidence submitted: "{claim.ownership_proof}"
                    </p>
                    {claim.reviewer_notes && (
                      <p className="text-[11px] text-brand-blue mt-1">
                        Reviewer feedback: {claim.reviewer_notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {claim.status === 'approved' && (
                      <button
                        onClick={() => setSelectedClaimForQR(claim)}
                        className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Pass</span>
                      </button>
                    )}
                    <Link
                      to={`/claims/${claim.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                    >
                      View Claim
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items Grid */}
        {activeTab !== 'claims' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-blue" />
                <span>
                  {activeTab === 'lost'
                    ? 'Reported Lost Items'
                    : activeTab === 'found'
                    ? 'Reported Found Belongings'
                    : 'My Published Reports'}
                </span>
              </h3>
            </div>

            {(activeTab === 'lost' ? myLostItems : activeTab === 'found' ? myFoundItems : myItems).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(activeTab === 'lost' ? myLostItems : activeTab === 'found' ? myFoundItems : myItems).map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="inbox"
                title="No Reports in this Category"
                description="You have not created any reports in this section yet."
                actionLabel="Report Lost Item"
                actionHref="/report/lost"
              />
            )}
          </div>
        )}
      </div>

      {/* QR Handover Modal */}
      {selectedClaimForQR && (
        <QRHandoverModal
          claim={selectedClaimForQR}
          isOpen={Boolean(selectedClaimForQR)}
          onClose={() => setSelectedClaimForQR(null)}
        />
      )}
    </div>
  );
};
