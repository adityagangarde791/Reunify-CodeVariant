import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/common/Badge';
import { User, Mail, Building, Phone, ShieldCheck, Check, AlertCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, role, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setDepartment(user.department || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const res = await updateProfile({
      full_name: fullName.trim(),
      department: department.trim() || undefined,
      phone: phone.trim() || undefined,
    });

    setSaving(false);

    if (res?.error) {
      setError(res.error);
    } else {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh]">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
          Account Profile
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 mt-1">
          Profile & Campus Credentials
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal university contact details and verified role clearance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Profile Summary Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card text-center">
            <div className="w-20 h-20 rounded-full bg-navy-950 text-teal-300 font-extrabold text-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <h2 className="text-lg font-bold text-navy-950">{user?.full_name || 'Campus Member'}</h2>
            <p className="text-xs text-slate-500 mb-3">{user?.email}</p>
            <RoleBadge role={role} size="md" />

            <div className="mt-6 pt-6 border-t border-slate-100 text-left space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400" />
                <span>{user?.department || 'Department not specified'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{user?.phone || 'Phone not provided'}</span>
              </div>
            </div>
          </div>

          {/* Role Policy Box */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 text-navy-950 font-bold">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Role-Based Security Policy</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              In accordance with university security standards, members cannot self-promote to Campus Security or Administrator. Elevated roles are strictly assigned via server-side database administration.
            </p>
          </div>
        </div>

        {/* Right: Editable Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card">
            <h3 className="text-base font-bold text-navy-950 mb-6">
              Update Contact Information
            </h3>

            {error && (
              <div className="p-3 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-teal-600"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Campus Email (Read-Only)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 cursor-not-allowed outline-none"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Academic Department / Office
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g., Computer Science, School of Architecture"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-teal-600"
                  />
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="+1 (555) 012-3456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-teal-600"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                {isSaved ? (
                  <span className="text-xs text-teal-700 font-semibold flex items-center gap-1">
                    <Check className="w-4 h-4 text-teal-600" />
                    Changes saved to Supabase!
                  </span>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs shadow-soft transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
