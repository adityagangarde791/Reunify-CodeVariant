import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Bell, 
  PlusCircle, 
  Sparkles, 
  Shield, 
  Menu, 
  X, 
  ChevronDown, 
  User, 
  LogOut, 
  Layers, 
  FileText 
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { RoleBadge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useItems } from '../../context/ItemsContext';

export const Navbar: React.FC = () => {
  const { user, role, isAuthenticated, signOut } = useAuth();
  const { unreadNotifsCount } = useItems();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [reportDropdownOpen, setReportDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setReportDropdownOpen(false);
  }, [location.pathname]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-xs font-semibold tracking-wide transition-all px-3 py-1.5 rounded-xl ${
      isActive
        ? 'text-teal-700 bg-teal-50/90 font-bold shadow-xs'
        : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100/70'
    }`;

  const isStaffOrAdmin = role === 'campus_security' || role === 'admin';

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/90'
          : 'bg-white border-b border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo size="md" showTagline={false} />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          <NavLink to="/explore" className={navLinkClass}>
            Explore
          </NavLink>
          <NavLink to="/matches" className={navLinkClass}>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Smart Matches</span>
            </span>
          </NavLink>
          <NavLink to="/my-cases" className={navLinkClass}>
            My Cases
          </NavLink>
          {isStaffOrAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              <span className="flex items-center gap-1.5 text-navy-900">
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                <span>Admin Console</span>
              </span>
            </NavLink>
          )}
        </nav>

        {/* Right Section: Report CTA, Notifications & Account */}
        <div className="hidden md:flex items-center gap-3">
          {/* Prominent Report Action */}
          <div className="relative">
            <button
              onClick={() => {
                setReportDropdownOpen(!reportDropdownOpen);
                setUserDropdownOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-navy-950 hover:bg-navy-900 text-white shadow-soft transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-teal-400" />
              <span>Report an Item</span>
              <ChevronDown className="w-3 h-3 text-slate-300 ml-0.5" />
            </button>

            {reportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-elevated border border-slate-200 p-2 z-50 animate-scale-up">
                <Link
                  to="/report/lost"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-amber-700 hover:bg-amber-50/70 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Report Lost Item</span>
                </Link>
                <Link
                  to="/report/found"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-teal-700 hover:bg-teal-50/70 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  <span>Report Found Item</span>
                </Link>
              </div>
            )}
          </div>

          {/* Notifications Icon (Only shown with count if authenticated) */}
          {isAuthenticated && (
            <Link
              to="/notifications"
              className="relative p-2 rounded-xl text-slate-600 hover:text-navy-950 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              )}
            </Link>
          )}

          {/* User Account Controls */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setReportDropdownOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              >
                <div className="w-8 h-8 rounded-full bg-navy-950 text-teal-300 font-bold text-xs flex items-center justify-center shadow-xs">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left text-xs">
                  <div className="font-semibold text-slate-900 leading-tight truncate max-w-[120px]">
                    {user.full_name}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    {user.role.replace('_', ' ')}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-elevated border border-slate-200 p-2 z-50 animate-scale-up">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.full_name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <div className="mt-1">
                      <RoleBadge role={user.role} size="sm" />
                    </div>
                  </div>
                  <Link
                    to="/my-cases"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Layers className="w-4 h-4 text-slate-400" />
                    <span>My Recovery Cases</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Profile & Account</span>
                  </Link>
                  {isStaffOrAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-navy-900 hover:bg-slate-50 transition-colors font-semibold"
                    >
                      <Shield className="w-4 h-4 text-teal-600" />
                      <span>Admin Oversight</span>
                    </Link>
                  )}
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={async () => {
                      await signOut();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-700 hover:text-navy-950 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-xl shadow-soft transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {isAuthenticated && (
            <Link
              to="/notifications"
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500" />
              )}
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-slide-down">
          {/* Mobile Report Buttons */}
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
            <Link
              to="/report/lost"
              className="p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-center font-bold text-xs"
            >
              Report Lost
            </Link>
            <Link
              to="/report/found"
              className="p-2.5 rounded-xl bg-teal-50 text-teal-900 border border-teal-200 text-center font-bold text-xs"
            >
              Report Found
            </Link>
          </div>

          <nav className="flex flex-col space-y-1">
            <NavLink to="/explore" className={navLinkClass}>
              Explore Belongings
            </NavLink>
            <NavLink to="/matches" className={navLinkClass}>
              Smart Matches
            </NavLink>
            <NavLink to="/my-cases" className={navLinkClass}>
              My Cases
            </NavLink>
            {isStaffOrAdmin && (
              <NavLink to="/admin" className={navLinkClass}>
                Admin & Moderation
              </NavLink>
            )}
            {isAuthenticated && (
              <NavLink to="/profile" className={navLinkClass}>
                Profile Settings
              </NavLink>
            )}
          </nav>

          {/* Mobile Auth footer */}
          <div className="pt-3 border-t border-slate-100">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-slate-900">{user.full_name}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{user.role.replace('_', ' ')}</div>
                </div>
                <button
                  onClick={async () => {
                    await signOut();
                    navigate('/login');
                  }}
                  className="text-xs text-rose-600 font-semibold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  className="text-center py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-center py-2 text-xs font-semibold text-white bg-teal-700 rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
