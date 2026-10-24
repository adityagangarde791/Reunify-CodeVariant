import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-0 overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-[16/10] bg-slate-200 w-full" />
      <div className="p-5 space-y-3">
        <div className="w-16 h-3.5 bg-slate-200 rounded" />
        <div className="w-3/4 h-5 bg-slate-200 rounded" />
        <div className="w-full h-3 bg-slate-200 rounded" />
        <div className="w-2/3 h-3 bg-slate-200 rounded" />
        <div className="pt-3 border-t border-slate-100 flex justify-between">
          <div className="w-24 h-3 bg-slate-200 rounded" />
          <div className="w-16 h-3 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  );
};

export const CardGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};
