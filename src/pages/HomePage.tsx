import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  QrCode, 
  Clock, 
  CheckCircle2, 
  Users, 
  GraduationCap, 
  Briefcase, 
  ShieldAlert, 
  ChevronRight, 
  Inbox,
  PlusCircle
} from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { ItemCard } from '../components/common/ItemCard';
import { CardGridSkeleton } from '../components/common/LoadingSkeleton';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { items, isLoading } = useItems();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const recentItems = items.slice(0, 3);

  const steps = [
    { num: '01', title: 'Report', desc: 'Log item traits, photos, time, and precise campus location.' },
    { num: '02', title: 'Match', desc: 'Deterministic matching engine pairs lost & found reports instantly.' },
    { num: '03', title: 'Claim', desc: 'Submit private ownership evidence without leaking secrets publicly.' },
    { num: '04', title: 'Verify', desc: 'Campus safety officers or custodians validate confidential clues.' },
    { num: '05', title: 'Return', desc: 'Secure QR handover pass confirmation at designated campus desk.' },
  ];

  const personas = [
    {
      title: 'Students',
      icon: GraduationCap,
      description: 'Quickly find lost laptops, earbuds, dorm keys, and ID cards across libraries and dorms.',
      color: 'border-sky-200 bg-sky-50/50',
    },
    {
      title: 'Faculty & Staff',
      icon: Briefcase,
      description: 'Recover teaching materials, eyewear, presentation clickers, and lab belongings.',
      color: 'border-indigo-200 bg-indigo-50/50',
    },
    {
      title: 'Campus Security',
      icon: ShieldAlert,
      description: 'Maintain verified custody lockers, review confidential claims, and coordinate safe handovers.',
      color: 'border-amber-200 bg-amber-50/50',
    },
    {
      title: 'Administrators',
      icon: Users,
      description: 'Campus-wide audit logging, resolution metrics, moderation queues, and lost-property compliance.',
      color: 'border-teal-200 bg-teal-50/50',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="relative overflow-hidden bg-navy-950 text-white pt-16 pb-24 lg:pt-24 lg:pb-32 subtle-mesh-dark">
        {/* Ambient Subtle Radial Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-900/90 border border-navy-800 text-xs text-teal-300 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Smart Campus Recovery Platform</span>
            </motion.div>

            {/* Hero Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-white"
            >
              Reconnecting people with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-200 to-sky-300">
                what matters.
              </span>
            </motion.h1>

            {/* Supporting Copy */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed"
            >
              Misplaced a belonging on campus? Discover reported items, pair matches securely with confidential proof, and follow a verified path from lost to returned.
            </motion.p>

            {/* Refined Search Input */}
            <motion.form
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              onSubmit={handleSearchSubmit}
              className="max-w-xl mx-auto relative pt-2"
            >
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search keys, hydro flask, AirPods, backpack, ID card..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-28 py-4 rounded-2xl bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 border border-white/20 focus:border-teal-500 outline-none text-sm placeholder:text-slate-400 backdrop-blur-md shadow-elevated transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-soft transition-all"
                >
                  Search
                </button>
              </div>
            </motion.form>

            {/* Primary & Secondary CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-3.5 pt-4"
            >
              <Link
                to="/report/lost"
                className="px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-soft transition-all flex items-center gap-2 group"
              >
                <span>Report Lost Item</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/report/found"
                className="px-6 py-3.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-sm shadow-soft transition-all flex items-center gap-2"
              >
                <span>Report Found Item</span>
              </Link>
              <Link
                to="/explore"
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/15 transition-all"
              >
                Explore All
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. RECENT DISCOVERIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/90">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[11px] uppercase font-bold text-teal-800 tracking-wider">
                Live Campus Feed
              </span>
              <h2 className="text-xl font-bold text-navy-950">Recent Campus Reports</h2>
            </div>
            <Link
              to="/explore"
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>View all reports</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <CardGridSkeleton count={3} />
          ) : recentItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="p-8 sm:p-12 text-center rounded-2xl bg-slate-50/70 border border-slate-200">
              <Inbox className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-navy-950">No Reports Logged Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No items have been reported lost or found recently. Everything is currently accounted for!
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Link
                  to="/report/lost"
                  className="px-4 py-2 rounded-xl bg-navy-950 text-white text-xs font-semibold shadow-xs"
                >
                  Report Lost
                </Link>
                <Link
                  to="/report/found"
                  className="px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-semibold shadow-xs"
                >
                  Report Found
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. FOUR CORE FEATURES */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
            Engineered For Trust & Resolution
          </span>
          <h2 className="text-3xl font-extrabold text-navy-950 mt-2">
            Features Built For Resolution
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Reunify replaces chaotic group chats and paper flyers with verifiable campus custody and confidential claims.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Smart Matching */}
          <Link
            to="/matches"
            className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-navy-950 group-hover:text-teal-700 transition-colors">
                Smart Matching
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Deterministic scoring engine compares categories, titles, location proximity, and dates to surface high-confidence pairs.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-semibold text-teal-700">
              <span>View Matches</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Private Claims */}
          <Link
            to="/my-cases"
            className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-navy-950 group-hover:text-brand-blue transition-colors">
                Private Claims
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Submit confidential proof (serial numbers, engravings, receipts) that only authorized campus security officers can inspect.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-semibold text-brand-blue">
              <span>My Cases</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Search */}
          <Link
            to="/explore"
            className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-navy-950 group-hover:text-emerald-700 transition-colors">
                Instant Discovery
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Filter by campus zone, specific building, category, and report status across all college facilities.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-semibold text-emerald-700">
              <span>Explore Items</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* QR Handover */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-5">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-navy-950">
                Secure QR Return
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Approved claimants receive a unique QR verification pass for in-person identification at official security desks.
              </p>
            </div>
            <div className="mt-6 text-xs text-slate-400">
              In-person custody validation
            </div>
          </div>
        </div>
      </section>

      {/* 4. WORKFLOW PROGRESSION */}
      <section className="bg-slate-100/60 py-20 border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              How Reunify Works
            </span>
            <h2 className="text-3xl font-extrabold text-navy-950 mt-2">
              From Misplaced to Reunified
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              A structured five-step lifecycle ensuring privacy, accountability, and safe return.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((s, idx) => (
              <div
                key={s.num}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs relative"
              >
                <div className="text-xs font-mono font-black text-teal-700 mb-3">
                  {s.num}
                </div>
                <h4 className="text-base font-bold text-navy-950 mb-2">{s.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CAMPUS PERSONAS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
            One Unified Platform
          </span>
          <h2 className="text-3xl font-extrabold text-navy-950 mt-2">
            Built For the Entire Campus
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Tailored workflows for students, faculty, safety officers, and operational administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {personas.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className={`p-6 rounded-3xl border ${p.color} transition-all`}
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-700 mb-4 shadow-xs">
                  <Icon className="w-5 h-5 text-teal-700" />
                </div>
                <h3 className="text-base font-bold text-navy-950">{p.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{p.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
