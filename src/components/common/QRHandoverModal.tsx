import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { X, ShieldCheck, MapPin, CheckCircle2, Clock, Copy, Check } from 'lucide-react';
import { Claim } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useItems } from '../../context/ItemsContext';

interface QRHandoverModalProps {
  claim: Claim;
  isOpen: boolean;
  onClose: () => void;
}

export const QRHandoverModal: React.FC<QRHandoverModalProps> = ({ claim, isOpen, onClose }) => {
  const { user, role } = useAuth();
  const { confirmHandover } = useItems();
  const [copied, setCopied] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handoverCode = claim.handover_code || 'REUN-7821-PASS';
  const qrPayload = JSON.stringify({
    platform: 'REUNIFY',
    type: 'SAFE_HANDOVER_TOKEN',
    code: handoverCode,
    claimId: claim.id,
    itemId: claim.item_id,
    expires: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  });

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        qrPayload,
        {
          width: 200,
          margin: 2,
          color: {
            dark: '#0B1120',
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) console.error('QR code generation failed:', error);
        }
      );
    }
  }, [isOpen, qrPayload]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(handoverCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCompleteHandover = async () => {
    setIsConfirming(true);
    const success = await confirmHandover(claim.id);
    setIsConfirming(false);
    if (success) {
      // Trigger victory reunion confetti
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06B6D4', '#2563EB', '#0D9488', '#38BDF8'],
      });
      onClose();
    }
  };

  const isStaffOrSecurity = role === 'campus_security' || role === 'admin' || role === 'faculty_staff';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-navy-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Handover Pass
          </div>

          <h3 className="text-xl font-bold tracking-tight">Safe Campus Recovery Pass</h3>
          <p className="text-xs text-slate-400 mt-1">
            Present this verifiable pass at the designated desk for safe return.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center">
          {/* QR Code Canvas */}
          <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm mb-4">
            <canvas ref={canvasRef} className="rounded-lg" />
          </div>

          {/* Secure Handover Token */}
          <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Verification Token
              </span>
              <span className="font-mono font-bold text-slate-900 text-sm tracking-wide">
                {handoverCode}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Handover Details */}
          <div className="w-full space-y-2.5 text-xs text-slate-600 mb-6">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">Handover Location: </span>
                <span>{claim.handover_location || 'Campus Security Office - Desk 1'}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">Token Validity: </span>
                <span>Valid for 48 hours upon issuance</span>
              </div>
            </div>
          </div>

          {/* Security Officer or Staff Confirmation Action */}
          {claim.status !== 'returned' && (
            <div className="w-full pt-4 border-t border-slate-100">
              {isStaffOrSecurity ? (
                <button
                  onClick={handleCompleteHandover}
                  disabled={isConfirming}
                  className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isConfirming ? 'Processing Return...' : 'Confirm Return & Complete Handover'}</span>
                </button>
              ) : (
                <p className="text-[11px] text-center text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  Campus Security or the custodial desk officer will inspect this pass to complete the return.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
