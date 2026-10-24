import React from 'react';
import { Scale, CheckCircle2, ShieldAlert, Award } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[80vh]">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-brand-blue text-xs font-semibold mb-2">
          <Scale className="w-3.5 h-3.5" />
          <span>Campus Recovery Guidelines</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Terms of Service
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          Standard operational agreements, honor code compliance, and recovery guidelines on Reunify.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-card space-y-8 text-xs text-slate-600 leading-relaxed">
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Award className="w-4 h-4 text-brand-blue" />
            <h2>1. University Honor Code & True Claims</h2>
          </div>
          <p>
            Reunify operates on institutional integrity. Attempting to claim belongings that do not belong to you or submitting deceptive ownership proof constitutes a violation of the Student & Campus Code of Conduct. All fraudulent claims are logged and reported to University Administration.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <CheckCircle2 className="w-4 h-4 text-brand-blue" />
            <h2>2. Custodial Duty of Care</h2>
          </div>
          <p>
            Items turned in as "Found" must be promptly deposited at an authorized campus custodial desk (such as the Main Library Front Counter or Campus Safety Division). Individuals who discover belongings do not acquire personal ownership rights by merely submitting a digital report.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <ShieldAlert className="w-4 h-4 text-brand-blue" />
            <h2>3. Physical Handover Protocol</h2>
          </div>
          <p>
            Physical handovers should occur at verified university recovery hubs during supervised operational hours. The recipient must present their digital QR handover pass, and both parties must explicitly acknowledge the return in the platform.
          </p>
        </section>
      </div>
    </div>
  );
};
