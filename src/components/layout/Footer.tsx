import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { Shield, Sparkles, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-300 pt-16 pb-12 border-t border-navy-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-navy-900">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="white" size="lg" showTagline={true} />
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Reunify is the smart lost and found recovery platform designed to make recovery easier to navigate, safer to verify, and simpler to track.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-cyan-400 font-medium">
              <Sparkles className="w-4 h-4" />
              <span>"Lost Something? Let's Reunify."</span>
            </div>
          </div>

          {/* Core Routes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">
                  Explore Belongings
                </Link>
              </li>
              <li>
                <Link to="/report/lost" className="hover:text-white transition-colors">
                  Report Lost Item
                </Link>
              </li>
              <li>
                <Link to="/report/found" className="hover:text-white transition-colors">
                  Report Found Item
                </Link>
              </li>
              <li>
                <Link to="/matches" className="hover:text-white transition-colors">
                  Smart Matching Engine
                </Link>
              </li>
              <li>
                <Link to="/my-cases" className="hover:text-white transition-colors">
                  My Case Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Desks */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Campus Recovery</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-blue" />
                <span>Main Library 1F Desk</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-blue" />
                <span>Student Union Info Desk</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-blue" />
                <span>Campus Safety Division</span>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors flex items-center gap-1 mt-2">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Security & Review Queue</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Engineering Team */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Engineering Team</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="text-slate-200 font-medium">Aditya Gangarde</li>
              <li className="text-slate-200 font-medium">Atharv Gandage</li>
              <li className="text-slate-200 font-medium">Pranav Gawande</li>
              <li className="text-slate-200 font-medium">Yash Wankhede</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} REUNIFY. All rights reserved. Smart Campus Recovery Platform.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
