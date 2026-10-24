import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useItems } from '../../context/ItemsContext';

export const Toast: React.FC = () => {
  const { toastMessage, toastType } = useItems();

  if (!toastMessage) return null;

  const bgStyles =
    toastType === 'success'
      ? 'bg-navy-900 text-white border-teal-500/50'
      : toastType === 'error'
      ? 'bg-rose-950 text-white border-rose-500/50'
      : 'bg-navy-900 text-white border-blue-500/50';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-slide-up">
      <div className={`p-4 rounded-2xl shadow-elevated border flex items-center gap-3 backdrop-blur-md ${bgStyles}`}>
        {toastType === 'success' && <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />}
        {toastType === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />}
        {toastType === 'info' && <Info className="w-5 h-5 text-cyan-400 flex-shrink-0" />}

        <p className="text-xs font-medium leading-relaxed">{toastMessage}</p>
      </div>
    </div>
  );
};
