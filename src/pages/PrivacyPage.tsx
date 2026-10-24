import React from 'react';
import { ShieldCheck, Lock, EyeOff, Database, Server } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[80vh]">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-brand-blue text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Security & Data Protection</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          How Reunify safeguards confidential ownership evidence, protects claimant identities, and secures university lost and found records.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-card space-y-8 text-xs text-slate-600 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Lock className="w-4 h-4 text-brand-blue" />
            <h2>1. Confidential Ownership Evidence Protection</h2>
          </div>
          <p>
            When submitting a lost report or claiming a found belonging, users may provide sensitive identification markers (such as device serial numbers, engraved initials, hidden scratches, or lock-screen descriptions).
          </p>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700">
            <p className="font-semibold text-slate-900 mb-1">Our Core Privacy Rule:</p>
            Confidential evidence is strictly excluded from public item card listings, public search queries, and unauthorized viewing. Only the claimant and authorized campus security reviewers can view these protected fields.
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Database className="w-4 h-4 text-brand-blue" />
            <h2>2. Row-Level Security (RLS) & Access Control</h2>
          </div>
          <p>
            Reunify enforces PostgreSQL Row-Level Security (RLS) on all database tables:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Items Table:</strong> Public non-sensitive characteristics are readable by the campus community; confidential notes are restricted to the author and authorized security officers.
            </li>
            <li>
              <strong>Claims Table:</strong> Claim evidence is readable only by the authenticated claimant and designated campus reviewers.
            </li>
            <li>
              <strong>Notifications Table:</strong> Users may only view and mutate their own alert events.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Server className="w-4 h-4 text-brand-blue" />
            <h2>3. Safe QR Handover Tokens</h2>
          </div>
          <p>
            QR codes generated for physical handover contain only short-lived, verifiable transaction identifiers. They never embed raw confidential claim evidence, passwords, API tokens, or service keys. Scanning a code alone validates handover authority without disclosing personal private files.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <EyeOff className="w-4 h-4 text-brand-blue" />
            <h2>4. Data Retention & Archival</h2>
          </div>
          <p>
            Completed handover records are retained in the audit timeline for institutional accountability. Unresolved reports can be withdrawn by their creators at any time prior to verified handover.
          </p>
        </section>
      </div>
    </div>
  );
};
