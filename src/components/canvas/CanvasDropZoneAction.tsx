import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GripVertical,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  CornerDownRight,
  ShieldCheck
} from 'lucide-react';

export interface CanvasDropZoneActionProps {
  cardLabel: string;
  cardSublabel?: string;
  cardIcon?: React.ReactNode;
  zoneLabel: string;
  zoneDescription?: string;
  zoneIcon?: React.ReactNode;
  variant?: 'teal' | 'amber' | 'rose' | 'navy' | 'blue';
  isLoading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  onValidate?: () => boolean | Promise<boolean>;
  onExecute: () => void | Promise<void>;
  confirmMessage?: string;
  compact?: boolean;
  className?: string;
  keyboardActionName?: string;
}

const variantStyles = {
  teal: {
    cardBg: 'bg-teal-700 text-white border-teal-600 shadow-teal-900/20',
    cardBadge: 'bg-teal-800 text-teal-200 border-teal-600',
    zoneBorder: 'border-teal-300 bg-teal-50/50 hover:bg-teal-50',
    zoneOver: 'border-teal-500 bg-teal-100/70 shadow-lg shadow-teal-500/20 ring-4 ring-teal-400/30',
    accentText: 'text-teal-700',
    accentGlow: 'rgba(13, 148, 136, 0.4)',
  },
  amber: {
    cardBg: 'bg-amber-600 text-white border-amber-500 shadow-amber-900/20',
    cardBadge: 'bg-amber-700 text-amber-200 border-amber-500',
    zoneBorder: 'border-amber-300 bg-amber-50/50 hover:bg-amber-50',
    zoneOver: 'border-amber-500 bg-amber-100/70 shadow-lg shadow-amber-500/20 ring-4 ring-amber-400/30',
    accentText: 'text-amber-700',
    accentGlow: 'rgba(217, 119, 6, 0.4)',
  },
  rose: {
    cardBg: 'bg-rose-600 text-white border-rose-500 shadow-rose-900/20',
    cardBadge: 'bg-rose-700 text-rose-200 border-rose-500',
    zoneBorder: 'border-rose-300 bg-rose-50/50 hover:bg-rose-50',
    zoneOver: 'border-rose-500 bg-rose-100/70 shadow-lg shadow-rose-500/20 ring-4 ring-rose-400/30',
    accentText: 'text-rose-700',
    accentGlow: 'rgba(225, 29, 72, 0.4)',
  },
  navy: {
    cardBg: 'bg-navy-950 text-white border-navy-800 shadow-navy-950/30',
    cardBadge: 'bg-navy-900 text-teal-300 border-navy-700',
    zoneBorder: 'border-slate-300 bg-slate-50/70 hover:bg-slate-100/70',
    zoneOver: 'border-teal-500 bg-teal-50 shadow-lg shadow-teal-600/20 ring-4 ring-teal-400/30',
    accentText: 'text-navy-950',
    accentGlow: 'rgba(2, 6, 23, 0.4)',
  },
  blue: {
    cardBg: 'bg-brand-blue text-white border-blue-500 shadow-blue-900/20',
    cardBadge: 'bg-blue-800 text-blue-200 border-blue-600',
    zoneBorder: 'border-blue-300 bg-blue-50/50 hover:bg-blue-50',
    zoneOver: 'border-blue-500 bg-blue-100/70 shadow-lg shadow-blue-500/20 ring-4 ring-blue-400/30',
    accentText: 'text-brand-blue',
    accentGlow: 'rgba(37, 99, 235, 0.4)',
  },
};

export const CanvasDropZoneAction: React.FC<CanvasDropZoneActionProps> = ({
  cardLabel,
  cardSublabel = 'Drag into zone to commit',
  cardIcon,
  zoneLabel,
  zoneDescription = 'Target Action Zone',
  zoneIcon,
  variant = 'teal',
  isLoading = false,
  loadingLabel = 'Executing Protocol...',
  disabled = false,
  onValidate,
  onExecute,
  confirmMessage,
  compact = false,
  className = '',
  keyboardActionName,
}) => {
  const styles = variantStyles[variant] || variantStyles.teal;

  const [isOver, setIsOver] = useState(false);
  const [isDropped, setIsDropped] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [keyboardModalOpen, setKeyboardModalOpen] = useState(false);

  const zoneRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Clear error after 4 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const isPointInsideZone = (point: { x: number; y: number }) => {
    if (!zoneRef.current) return false;
    const rect = zoneRef.current.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset || 0;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    // Viewport coordinates check (clientX / clientY)
    const isInsideViewport =
      point.x >= rect.left &&
      point.x <= rect.right &&
      point.y >= rect.top &&
      point.y <= rect.bottom;

    // Page coordinates check (pageX / pageY from framer-motion PanInfo)
    const isInsidePage =
      point.x >= rect.left + scrollX &&
      point.x <= rect.right + scrollX &&
      point.y >= rect.top + scrollY &&
      point.y <= rect.bottom + scrollY;

    return isInsideViewport || isInsidePage;
  };

  const triggerExecution = async () => {
    if (disabled || isLoading) return;

    // Optional confirmation check for sensitive actions
    if (confirmMessage) {
      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) {
        setIsOver(false);
        return;
      }
    }

    // Pre-execution validation check
    if (onValidate) {
      try {
        const isValid = await onValidate();
        if (!isValid) {
          setShake(true);
          setErrorMessage('Validation required: Please fill all required fields before committing.');
          setTimeout(() => setShake(false), 600);
          return;
        }
      } catch (err: unknown) {
        setShake(true);
        setErrorMessage(err instanceof Error ? err.message : 'Validation failed.');
        setTimeout(() => setShake(false), 600);
        return;
      }
    }

    setIsDropped(true);
    setErrorMessage(null);

    try {
      await onExecute();
    } catch (err: unknown) {
      setIsDropped(false);
      setErrorMessage(err instanceof Error ? err.message : 'Execution failed.');
    }
  };

  const handleDrag = (_: unknown, info: { point: { x: number; y: number } }) => {
    setIsOver(isPointInsideZone(info.point));
  };

  const handleDragEnd = async (_: unknown, info: { point: { x: number; y: number } }) => {
    const isInside = isPointInsideZone(info.point);
    setIsOver(false);

    if (isInside) {
      await triggerExecution();
    }
  };

  return (
    <div
      className={`relative rounded-2xl bg-white/80 p-4 border border-slate-200/90 shadow-sm transition-all ${className}`}
      aria-label="Canvas Protocol Drag and Drop Controller"
    >
      {/* Protocol Banner Header */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            Canvas Protocol • Drag-to-Execute
          </span>
        </div>
        <button
          type="button"
          onClick={() => setKeyboardModalOpen(true)}
          className="text-[10px] text-teal-700 hover:text-teal-900 font-semibold underline underline-offset-2 flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-teal-500 rounded px-1"
          aria-label="Accessible keyboard drop option"
        >
          <span>Keyboard Assist</span>
        </button>
      </div>

      {/* Error Message Toast */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 shadow-xs"
            role="alert"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span className="flex-1">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Protocol Runway Grid */}
      <div
        className={`grid ${compact ? 'grid-cols-1 sm:grid-cols-2 gap-3' : 'grid-cols-1 md:grid-cols-12 gap-4 items-center'
          }`}
      >
        {/* 1. DRAGGABLE ACTION CARD */}
        <div className={compact ? 'w-full' : 'md:col-span-5'}>
          <motion.div
            ref={cardRef}
            drag={!disabled && !isLoading && !isDropped}
            dragElastic={0.4}
            dragSnapToOrigin={!isDropped}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            whileHover={!disabled && !isLoading ? { scale: 1.02, y: -2 } : {}}
            whileTap={!disabled && !isLoading ? { scale: 0.98, cursor: 'grabbing' } : {}}
            animate={
              shake
                ? { x: [-8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.4 } }
                : isDropped
                  ? { scale: 0.98, opacity: 0.9 }
                  : { x: 0, y: 0 }
            }
            tabIndex={0}
            role="button"
            aria-grabbed={isOver}
            aria-disabled={disabled || isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setKeyboardModalOpen(true);
              }
            }}
            className={`select-none rounded-xl p-3 sm:p-3.5 border shadow-card transition-shadow cursor-grab active:cursor-grabbing focus:ring-2 focus:ring-teal-500 focus:outline-none ${styles.cardBg
              } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-xs">
                  {cardIcon || <GripVertical className="w-4 h-4 text-white" />}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate leading-tight flex items-center gap-1.5">
                    <span>{cardLabel}</span>
                  </div>
                  <div className="text-[10px] text-white/80 truncate mt-0.5">
                    {isLoading ? loadingLabel : cardSublabel}
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 flex items-center gap-1.5">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <div className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${styles.cardBadge}`}>
                    DRAG ME
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* 2. DIRECTIONAL ARROW CONNECTOR */}
        <div className={compact ? 'hidden' : 'md:col-span-2 flex items-center justify-center'}>
          <div className="flex items-center gap-1 text-slate-300 font-mono text-[10px] uppercase">
            <span className="hidden lg:inline">drop into</span>
            <ArrowRight className={`w-4 h-4 ${isOver ? 'text-teal-600 animate-pulse translate-x-1' : 'text-slate-400'} transition-all`} />
          </div>
        </div>

        {/* 3. DESIGNATED ACTION DROP ZONE */}
        <div className={compact ? 'w-full' : 'md:col-span-5'}>
          <div
            ref={zoneRef}
            className={`relative rounded-xl p-3 sm:p-3.5 border-2 border-dashed transition-all duration-200 flex items-center justify-between gap-3 min-h-[58px] ${isOver ? styles.zoneOver : styles.zoneBorder
              } ${isDropped ? 'bg-teal-100/90 border-teal-500 border-solid' : ''}`}
            aria-label={`${zoneLabel} Drop Target`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isOver ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isDropped ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  zoneIcon || <CornerDownRight className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-bold truncate leading-tight ${isOver ? styles.accentText : 'text-slate-800'}`}>
                  {isOver ? 'RELEASE TO EXECUTE' : zoneLabel}
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  {isOver ? 'Drop action confirmed' : zoneDescription}
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase transition-colors ${isOver
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-200/80 text-slate-600'
                  }`}
              >
                {isOver ? 'ACTIVE TARGET' : 'DROP BAY'}
              </span>
            </div>

            {/* Target Ring Glow Effect */}
            {isOver && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 rounded-xl pointer-events-none ring-2 ring-teal-500/60 animate-pulse"
              />
            )}
          </div>
        </div>
      </div>

      {/* Keyboard Accessibility Dialog */}
      <AnimatePresence>
        {keyboardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-slate-900"
              role="dialog"
              aria-modal="true"
              aria-labelledby="keyboard-assist-title"
            >
              <div className="flex items-center gap-2 mb-3 text-teal-700">
                <Sparkles className="w-4 h-4" />
                <h4 id="keyboard-assist-title" className="text-xs font-bold uppercase tracking-wider">
                  Canvas Protocol Keyboard Assist
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Execute the <strong>{keyboardActionName || cardLabel}</strong> action into the <strong>{zoneLabel}</strong> via keyboard protocol.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setKeyboardModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setKeyboardModalOpen(false);
                    await triggerExecution();
                  }}
                  disabled={disabled || isLoading}
                  className="px-4 py-2 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs shadow-soft flex items-center gap-1.5 disabled:opacity-50"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>Execute Protocol Drop</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
