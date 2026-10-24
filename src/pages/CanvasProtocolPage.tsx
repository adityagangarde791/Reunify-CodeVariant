import React from 'react';
import { CanvasProtocolBoard } from '../components/canvas/CanvasProtocolBoard';
import { Layers, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CanvasProtocolPage: React.FC = () => {
  return (
    <div className="min-h-[85vh] bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-950 text-teal-300 text-xs font-mono font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>CANVAS PROTOCOL ENGINE v1.0</span>
        </div>
      </div>

      <CanvasProtocolBoard />
    </div>
  );
};
