import React from 'react';
import { ItemType, ItemStatus, ClaimStatus, UserRole } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const TypeBadge: React.FC<{ type: ItemType } & BadgeProps> = ({ type, className = '', size = 'md' }) => {
  const isLost = type === 'lost';
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';
  
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full uppercase tracking-wider font-semibold border ${
        isLost
          ? 'bg-amber-50 text-amber-700 border-amber-200/80'
          : 'bg-cyan-50 text-cyan-800 border-cyan-200/80'
      } ${sizeClasses} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isLost ? 'bg-amber-500 animate-pulse' : 'bg-cyan-500 animate-pulse'
        }`}
      />
      {type === 'lost' ? 'Lost Item' : 'Found Item'}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: ItemStatus | ClaimStatus } & BadgeProps> = ({
  status,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs font-medium';

  const config: Record<string, { label: string; bg: string; text: string; border: string }> = {
    active: { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    potential_match: { label: 'Match Found', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    claim_pending: { label: 'Claim In Review', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    under_review: { label: 'Under Review', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    approved: { label: 'Claim Approved', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
    handover_scheduled: { label: 'Handover Ready', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    handover_pending: { label: 'Handover Pending', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    returned: { label: 'Reunified & Returned', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' },
    rejected: { label: 'Claim Rejected', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    closed: { label: 'Closed', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
    cancelled: { label: 'Cancelled', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
    submitted: { label: 'Submitted', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  };

  const current = config[status] || { label: status, bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeClasses} ${className}`}
    >
      {current.label}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: UserRole } & BadgeProps> = ({ role, className = '', size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  const map: Record<UserRole, { label: string; style: string }> = {
    student: { label: 'Student', style: 'bg-sky-50 text-sky-700 border-sky-200' },
    faculty_staff: { label: 'Faculty & Staff', style: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    campus_security: { label: 'Campus Security', style: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold' },
    admin: { label: 'Admin', style: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold' },
  };

  const { label, style } = map[role] || { label: role, style: 'bg-slate-100 text-slate-700 border-slate-200' };

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${style} ${sizeClasses} ${className}`}>
      {label}
    </span>
  );
};
