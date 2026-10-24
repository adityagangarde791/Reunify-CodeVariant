import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  HelpCircle, 
  Sliders, 
  Layers, 
  Clock 
} from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { EmptyState } from '../components/common/EmptyState';
import { MatchCandidate } from '../types';

export const MatchesPage: React.FC = () => {
  const { getAllSmartMatches } = useItems();
  const [minConfidence, setMinConfidence] = useState<number>(45);

  const allMatches = getAllSmartMatches();
  const filteredMatches = allMatches.filter((m) => m.score >= minConfidence);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Deterministic Rule-Based Matching</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
            Smart Matching Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Ranked candidate matches derived by comparing categories, normalized title tokens, location proximity, and temporal delta.
          </p>
        </div>

        {/* Confidence Filter Toggle */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs self-start sm:self-auto text-xs font-semibold">
          <span className="text-[11px] text-slate-400 pl-2">Threshold:</span>
          <button
            onClick={() => setMinConfidence(75)}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              minConfidence === 75 ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:text-navy-950'
            }`}
          >
            High (75%+)
          </button>
          <button
            onClick={() => setMinConfidence(50)}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              minConfidence === 50 ? 'bg-navy-950 text-white shadow-xs' : 'text-slate-600 hover:text-navy-950'
            }`}
          >
            Medium (50%+)
          </button>
          <button
            onClick={() => setMinConfidence(35)}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              minConfidence === 35 ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600 hover:text-navy-950'
            }`}
          >
            All (35%+)
          </button>
        </div>
      </div>

      {/* Engine Transparency Banner */}
      <div className="p-4 bg-navy-950 text-slate-300 rounded-2xl mb-8 border border-navy-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-950 text-teal-300 flex items-center justify-center font-bold flex-shrink-0">
            %
          </div>
          <div>
            <span className="text-white font-semibold">Explainability Guarantee: </span>
            A score indicates semantic, spatial, and temporal similarity—never automatic ownership proof. All claims require manual verification.
          </div>
        </div>
        <div className="text-[11px] text-teal-300 font-mono flex-shrink-0">
          5 Weighted Criteria (100 pts)
        </div>
      </div>

      {/* Matches List */}
      {filteredMatches.length > 0 ? (
        <div className="space-y-6">
          {filteredMatches.map((cand) => {
            const lostRawDate = cand.lost_item.date_lost_or_found || cand.lost_item.incident_date || cand.lost_item.created_at;
            const foundRawDate = cand.found_item.date_lost_or_found || cand.found_item.incident_date || cand.found_item.created_at;

            return (
              <div
                key={cand.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all"
              >
                {/* Top Score Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-teal-700 tabular-nums font-mono">
                        {cand.score}%
                      </span>
                      <span className="text-xs font-bold text-slate-400">Match Score</span>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        cand.score >= 75
                          ? 'bg-teal-50 text-teal-800 border border-teal-200'
                          : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {cand.score >= 75 ? 'High Confidence Pair' : 'Moderate Similarity'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/items/${cand.found_item.id}`}
                      className="px-4 py-2 rounded-xl bg-navy-950 hover:bg-navy-900 text-white text-xs font-semibold shadow-soft transition-all flex items-center gap-1.5"
                    >
                      <span>Inspect Found Item</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Side-by-Side Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                  {/* Lost Report Card */}
                  <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-amber-100 text-amber-800">
                        Lost Report
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(lostRawDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-start gap-4">
                      {cand.lost_item.primary_image_url || cand.lost_item.image_url ? (
                        <img
                          src={cand.lost_item.primary_image_url || cand.lost_item.image_url}
                          alt={cand.lost_item.title}
                          className="w-16 h-16 rounded-xl object-cover border border-amber-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-amber-100/60 border border-amber-200 flex items-center justify-center text-[10px] text-amber-800 flex-shrink-0">
                          No Photo
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-navy-950">{cand.lost_item.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {cand.lost_item.description}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-slate-600 mt-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{cand.lost_item.location_name || cand.lost_item.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Found Report Card */}
                  <div className="p-5 rounded-2xl bg-teal-50/40 border border-teal-200/80">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-teal-100 text-teal-800">
                        Found Report in Custody
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(foundRawDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-start gap-4">
                      {cand.found_item.primary_image_url || cand.found_item.image_url ? (
                        <img
                          src={cand.found_item.primary_image_url || cand.found_item.image_url}
                          alt={cand.found_item.title}
                          className="w-16 h-16 rounded-xl object-cover border border-teal-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-teal-100/60 border border-teal-200 flex items-center justify-center text-[10px] text-teal-800 flex-shrink-0">
                          No Photo
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-navy-950">{cand.found_item.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {cand.found_item.description}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-slate-600 mt-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{cand.found_item.location_name || cand.found_item.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Explainable Criteria Breakdown */}
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
                    Score Breakdown & Verification Rationale
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {cand.reasons.map((r) => (
                      <div
                        key={r.criterion}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between text-slate-600 mb-1">
                          <span className="capitalize font-semibold">
                            {r.criterion.replace('_', ' ')}
                          </span>
                          <span className="font-mono font-bold text-navy-950">
                            {r.points}/{r.max}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">{r.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="search"
          title="No Potential Matches at Current Threshold"
          description="Try lowering the confidence threshold to 35% to see broader semantic matches, or report a new lost or found item."
          actionLabel="Show All Matches (35%+)"
          onActionClick={() => setMinConfidence(35)}
        />
      )}
    </div>
  );
};
