import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  PlusCircle, 
  Search, 
  Sparkles, 
  Briefcase, 
  Bell, 
  Tag, 
  GripVertical, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  ShieldAlert, 
  Info,
  Maximize2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useItems } from '../../context/ItemsContext';

export interface ActionCardDef {
  id: string;
  targetZoneId: string;
  title: string;
  subtitle: string;
  category: 'reporting' | 'discovery' | 'intelligence' | 'account';
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  colorScheme: {
    bg: string;
    border: string;
    badge: string;
    iconBg: string;
    text: string;
    glow: string;
  };
  destinationRoute: string;
  requiresAuth?: boolean;
}

export interface ActionZoneDef {
  id: string;
  acceptedCardId: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  tag: string;
}

const ACTION_CARDS: ActionCardDef[] = [
  {
    id: 'card-lost',
    targetZoneId: 'zone-lost',
    title: 'Report Lost Item',
    subtitle: 'Log misplaced belongings with campus security encryption',
    category: 'reporting',
    badge: 'PRIORITY REPORT',
    icon: Tag,
    colorScheme: {
      bg: 'bg-amber-600',
      border: 'border-amber-500',
      badge: 'bg-amber-700/80 text-amber-100',
      iconBg: 'bg-amber-700',
      text: 'text-amber-500',
      glow: 'shadow-amber-500/30',
    },
    destinationRoute: '/report/lost',
    requiresAuth: true,
  },
  {
    id: 'card-found',
    targetZoneId: 'zone-found',
    title: 'Report Found Item',
    subtitle: 'Register discovered item for verified campus custody',
    category: 'reporting',
    badge: 'CUSTODY INTAKE',
    icon: PlusCircle,
    colorScheme: {
      bg: 'bg-teal-700',
      border: 'border-teal-600',
      badge: 'bg-teal-800/80 text-teal-100',
      iconBg: 'bg-teal-800',
      text: 'text-teal-600',
      glow: 'shadow-teal-500/30',
    },
    destinationRoute: '/report/found',
    requiresAuth: true,
  },
  {
    id: 'card-explore',
    targetZoneId: 'zone-explore',
    title: 'Explore Campus Items',
    subtitle: 'Search & filter real-time lost and found repository',
    category: 'discovery',
    badge: 'LIVE REPOSITORY',
    icon: Search,
    colorScheme: {
      bg: 'bg-blue-600',
      border: 'border-blue-500',
      badge: 'bg-blue-700/80 text-blue-100',
      iconBg: 'bg-blue-700',
      text: 'text-blue-600',
      glow: 'shadow-blue-500/30',
    },
    destinationRoute: '/explore',
  },
  {
    id: 'card-matches',
    targetZoneId: 'zone-matches',
    title: 'Deterministic Smart Matches',
    subtitle: 'Run algorithmic pairing matrix across reports',
    category: 'intelligence',
    badge: 'AI MATRIX',
    icon: Sparkles,
    colorScheme: {
      bg: 'bg-indigo-600',
      border: 'border-indigo-500',
      badge: 'bg-indigo-700/80 text-indigo-100',
      iconBg: 'bg-indigo-700',
      text: 'text-indigo-600',
      glow: 'shadow-indigo-500/30',
    },
    destinationRoute: '/matches',
  },
  {
    id: 'card-cases',
    targetZoneId: 'zone-cases',
    title: 'Inspect My Cases & Claims',
    subtitle: 'Track submitted reports, active claims, and QR passes',
    category: 'account',
    badge: 'VERIFIED DOSSIER',
    icon: Briefcase,
    colorScheme: {
      bg: 'bg-slate-800',
      border: 'border-slate-700',
      badge: 'bg-slate-900 text-teal-300',
      iconBg: 'bg-slate-900',
      text: 'text-slate-700',
      glow: 'shadow-slate-500/30',
    },
    destinationRoute: '/my-cases',
    requiresAuth: true,
  },
  {
    id: 'card-notifs',
    targetZoneId: 'zone-notifs',
    title: 'Campus Security Alerts',
    subtitle: 'Inspect custody handovers and claim status alerts',
    category: 'account',
    badge: 'REAL-TIME DISPATCH',
    icon: Bell,
    colorScheme: {
      bg: 'bg-rose-600',
      border: 'border-rose-500',
      badge: 'bg-rose-700/80 text-rose-100',
      iconBg: 'bg-rose-700',
      text: 'text-rose-600',
      glow: 'shadow-rose-500/30',
    },
    destinationRoute: '/notifications',
    requiresAuth: true,
  },
];

const ACTION_ZONES: ActionZoneDef[] = [
  {
    id: 'zone-lost',
    acceptedCardId: 'card-lost',
    name: 'Report Lost Item Zone',
    description: 'Drop here to initiate confidential lost property filing',
    icon: Tag,
    accentColor: 'border-amber-400 bg-amber-50/60 text-amber-900',
    tag: 'ZONE 01 • LOST',
  },
  {
    id: 'zone-found',
    acceptedCardId: 'card-found',
    name: 'Report Found Item Zone',
    description: 'Drop here to log custody of a recovered belonging',
    icon: PlusCircle,
    accentColor: 'border-teal-400 bg-teal-50/60 text-teal-900',
    tag: 'ZONE 02 • FOUND',
  },
  {
    id: 'zone-explore',
    acceptedCardId: 'card-explore',
    name: 'Explore Campus Directory',
    description: 'Drop here to browse active items across all buildings',
    icon: Search,
    accentColor: 'border-blue-400 bg-blue-50/60 text-blue-900',
    tag: 'ZONE 03 • EXPLORE',
  },
  {
    id: 'zone-matches',
    acceptedCardId: 'card-matches',
    name: 'Smart Matches Engine',
    description: 'Drop here to run the candidate matching algorithm',
    icon: Sparkles,
    accentColor: 'border-indigo-400 bg-indigo-50/60 text-indigo-900',
    tag: 'ZONE 04 • MATCHES',
  },
  {
    id: 'zone-cases',
    acceptedCardId: 'card-cases',
    name: 'My Cases & Dossiers',
    description: 'Drop here to review active claims and handover passes',
    icon: Briefcase,
    accentColor: 'border-slate-400 bg-slate-50/60 text-slate-900',
    tag: 'ZONE 05 • CASES',
  },
  {
    id: 'zone-notifs',
    acceptedCardId: 'card-notifs',
    name: 'Security Notifications',
    description: 'Drop here to read officer notices and timeline updates',
    icon: Bell,
    accentColor: 'border-rose-400 bg-rose-50/60 text-rose-900',
    tag: 'ZONE 06 • ALERTS',
  },
];

export const CanvasProtocolBoard: React.FC<{ isEmbedded?: boolean }> = ({ isEmbedded = false }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { unreadNotifsCount } = useItems();

  const [activeFilter, setActiveFilter] = useState<'all' | 'reporting' | 'discovery' | 'intelligence' | 'account'>('all');
  const [activeDraggedCardId, setActiveDraggedCardId] = useState<string | null>(null);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [dockedCards, setDockedCards] = useState<Record<string, boolean>>({});
  const [keyboardModalCard, setKeyboardModalCard] = useState<ActionCardDef | null>(null);

  const zoneRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const filteredCards = ACTION_CARDS.filter(
    (card) => (activeFilter === 'all' || card.category === activeFilter) && !dockedCards[card.id]
  );

  const handleDragStart = (cardId: string) => {
    setActiveDraggedCardId(cardId);
    setFeedback({
      type: 'info',
      message: 'Drag card onto its corresponding Action Zone to execute protocol.',
    });
  };

  const handleDrag = (_: unknown, info: { point: { x: number; y: number } }) => {
    let foundZoneId: string | null = null;

    for (const [zoneId, el] of Object.entries(zoneRefs.current)) {
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (
        info.point.x >= rect.left &&
        info.point.x <= rect.right &&
        info.point.y >= rect.top &&
        info.point.y <= rect.bottom
      ) {
        foundZoneId = zoneId;
        break;
      }
    }

    setHoveredZoneId(foundZoneId);
  };

  const executeAction = (card: ActionCardDef) => {
    if (card.requiresAuth && !isAuthenticated) {
      setFeedback({
        type: 'info',
        message: `Authentication required: Redirecting to sign in for ${card.title}...`,
      });
      setTimeout(() => {
        navigate('/login', { state: { from: { pathname: card.destinationRoute } } });
      }, 700);
      return;
    }

    // Trigger celebration effects
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#0D9488', '#2563EB', '#06B6D4', '#F59E0B'],
    });

    setDockedCards((prev) => ({ ...prev, [card.id]: true }));
    setFeedback({
      type: 'success',
      message: `Protocol Accepted: Launching ${card.title}...`,
    });

    setTimeout(() => {
      navigate(card.destinationRoute);
    }, 850);
  };

  const handleDragEnd = (_: unknown, info: { point: { x: number; y: number } }) => {
    const cardId = activeDraggedCardId;
    setActiveDraggedCardId(null);
    setHoveredZoneId(null);

    if (!cardId) return;
    const card = ACTION_CARDS.find((c) => c.id === cardId);
    if (!card) return;

    let targetZoneId: string | null = null;
    for (const [zoneId, el] of Object.entries(zoneRefs.current)) {
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (
        info.point.x >= rect.left &&
        info.point.x <= rect.right &&
        info.point.y >= rect.top &&
        info.point.y <= rect.bottom
      ) {
        targetZoneId = zoneId;
        break;
      }
    }

    if (!targetZoneId) {
      // Released into empty canvas space -> harmless snap back
      setFeedback({
        type: 'info',
        message: 'Action cancelled. Release inside designated zone to trigger.',
      });
      return;
    }

    // Strict validation: Correct vs Incorrect drop
    if (targetZoneId === card.targetZoneId) {
      executeAction(card);
    } else {
      // Wrong zone!
      const targetZone = ACTION_ZONES.find((z) => z.id === targetZoneId);
      setFeedback({
        type: 'error',
        message: `Protocol Rejected: "${card.title}" cannot be dispatched into "${targetZone?.name}". Drop into its matching zone.`,
      });
    }
  };

  const handleReset = () => {
    setDockedCards({});
    setFeedback({
      type: 'info',
      message: 'Canvas protocol reset. All operational cards re-docked.',
    });
  };

  return (
    <div className={`w-full ${isEmbedded ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
      {/* Visual Command Header */}
      <div className="bg-navy-950 text-white rounded-3xl p-6 sm:p-8 border border-navy-800 shadow-elevated relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
              <span className="px-3 py-1 rounded-full bg-teal-950 border border-teal-700/80 text-teal-300 font-mono text-xs font-bold uppercase tracking-wider">
                The Canvas Protocol • Drag-and-Drop Operating Interface
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Interactive Operational Deck
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Drag operational cards from the protocol deck directly into matching action zones to execute commands. Unintended or mismatched drops are safely rejected.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 border border-white/15 transition-all shadow-xs"
              title="Reset all cards back to deck"
            >
              <RotateCcw className="w-4 h-4 text-teal-300" />
              <span>Reset Deck</span>
            </button>
          </div>
        </div>

        {/* Live Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-navy-800 text-xs">
          <span className="text-slate-400 font-mono text-[11px] mr-2">Filter Cards:</span>
          {(['all', 'reporting', 'discovery', 'intelligence', 'account'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all capitalize ${
                activeFilter === cat
                  ? 'bg-teal-600 text-white font-bold shadow-xs'
                  : 'bg-navy-900 text-slate-300 hover:bg-navy-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Live Feedback Banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`mb-6 p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 shadow-soft transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                : feedback.type === 'error'
                ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                : 'bg-sky-50 border-sky-300 text-sky-900'
            }`}
            role="status"
          >
            <div className="flex items-center gap-2.5">
              {feedback.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
              {feedback.type === 'error' && <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
              {feedback.type === 'info' && <Info className="w-4 h-4 text-sky-600 flex-shrink-0" />}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-[11px] underline opacity-70 hover:opacity-100"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2-Column Board: Left Deck & Right Action Bay */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: THE DRAGGABLE PROTOCOL DECK */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-700" />
              <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
                Protocol Deck ({filteredCards.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">DRAG TO DEPLOY</span>
          </div>

          <div className="space-y-3 min-h-[300px]">
            {filteredCards.length > 0 ? (
              filteredCards.map((card) => {
                const IconComponent = card.icon;
                const isCurrentDrag = activeDraggedCardId === card.id;

                return (
                  <motion.div
                    key={card.id}
                    drag
                    dragElastic={0.4}
                    dragSnapToOrigin
                    onDragStart={() => handleDragStart(card.id)}
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98, cursor: 'grabbing' }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Draggable Card: ${card.title}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setKeyboardModalCard(card);
                      }
                    }}
                    className={`select-none rounded-2xl p-4 border text-white shadow-card cursor-grab active:cursor-grabbing transition-shadow relative overflow-hidden group ${
                      card.colorScheme.bg
                    } ${card.colorScheme.border} ${isCurrentDrag ? 'z-50 ring-4 ring-white/50 opacity-90' : 'z-10'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs ${card.colorScheme.iconBg}`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-white/20 ${card.colorScheme.badge}`}>
                              {card.badge}
                            </span>
                            {card.id === 'card-notifs' && unreadNotifsCount > 0 && (
                              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                            )}
                          </div>
                          <h4 className="text-sm font-black leading-snug">{card.title}</h4>
                          <p className="text-[11px] text-white/80 line-clamp-2 mt-0.5 leading-relaxed">
                            {card.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="p-1 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                          <GripVertical className="w-4 h-4 text-white/80" />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setKeyboardModalCard(card);
                          }}
                          className="text-[9px] font-semibold text-white/90 underline hover:text-white"
                          title="Open keyboard drop menu"
                        >
                          Keys
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="p-10 text-center rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <CheckCircle2 className="w-10 h-10 text-teal-600 mx-auto" />
                <h4 className="text-sm font-bold text-navy-950">All Protocol Cards Dispatched</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Every card in this category has been routed. Click reset to restore the deck.
                </p>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-navy-950 text-white text-xs font-semibold"
                >
                  Restore Deck
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DESIGNATED ACTION ZONES */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-teal-700" />
              <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
                Designated Action Zones ({ACTION_ZONES.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">ACTIVE TARGETS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {ACTION_ZONES.map((zone) => {
              const IconComp = zone.icon;
              const isTargetHovered = hoveredZoneId === zone.id;
              const isCompatible = activeDraggedCardId === zone.acceptedCardId;
              const isMismatch = isTargetHovered && !isCompatible;

              return (
                <div
                  key={zone.id}
                  ref={(el) => {
                    zoneRefs.current[zone.id] = el;
                  }}
                  className={`rounded-2xl p-4 border-2 border-dashed transition-all duration-200 relative overflow-hidden flex flex-col justify-between min-h-[140px] shadow-sm ${
                    isMismatch
                      ? 'border-rose-400 bg-rose-50/80 ring-4 ring-rose-400/30'
                      : isTargetHovered && isCompatible
                      ? 'border-teal-500 bg-teal-100/90 ring-4 ring-teal-500/30 scale-[1.02]'
                      : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50'
                  }`}
                  aria-label={zone.name}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-slate-400">
                        {zone.tag}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                          isMismatch
                            ? 'bg-rose-600 text-white'
                            : isTargetHovered && isCompatible
                            ? 'bg-teal-700 text-white animate-pulse'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isMismatch ? 'MISMATCH' : isTargetHovered && isCompatible ? 'RELEASE NOW' : 'DROP BAY'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          isTargetHovered && isCompatible
                            ? 'bg-teal-700 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-navy-950 leading-tight">
                        {zone.name}
                      </h4>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      {zone.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Target: {zone.acceptedCardId.replace('card-', '')}</span>
                    <Maximize2 className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Accessible Keyboard Drop Modal */}
      <AnimatePresence>
        {keyboardModalCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900"
              role="dialog"
              aria-modal="true"
              aria-labelledby="keyboard-board-title"
            >
              <div className="flex items-center gap-2 mb-2 text-teal-800">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <h3 id="keyboard-board-title" className="text-base font-bold">
                  Keyboard Action Protocol
                </h3>
              </div>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Selected Card: <strong>{keyboardModalCard.title}</strong>. Choose a target zone to execute the drop interaction:
              </p>

              <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                {ACTION_ZONES.map((zone) => {
                  const isMatching = zone.id === keyboardModalCard.targetZoneId;
                  return (
                    <button
                      key={zone.id}
                      onClick={() => {
                        setKeyboardModalCard(null);
                        if (isMatching) {
                          executeAction(keyboardModalCard);
                        } else {
                          setFeedback({
                            type: 'error',
                            message: `Protocol Rejected: "${keyboardModalCard.title}" does not match "${zone.name}".`,
                          });
                        }
                      }}
                      className={`w-full p-3 rounded-xl border text-left text-xs flex items-center justify-between gap-3 transition-colors ${
                        isMatching
                          ? 'border-teal-300 bg-teal-50 hover:bg-teal-100/80 font-bold text-teal-950'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{zone.name}</div>
                        <div className="text-[10px] text-slate-500">{zone.tag}</div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200">
                        {isMatching ? 'MATCHING TARGET' : 'INCOMPATIBLE'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => setKeyboardModalCard(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
