import React, { useState } from 'react';
import { 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Compass, 
  Users2, 
  Cpu,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { SearchAgentSummary } from '../types';
import { translations } from '../i18n';

interface AiAgentSummaryProps {
  summary: SearchAgentSummary;
  onSelectQuery: (q: string) => void;
}

export const AiAgentSummary: React.FC<AiAgentSummaryProps> = ({
  summary,
  onSelectQuery,
}) => {
  const t = translations.en;
  const [isExpanded, setIsExpanded] = useState(true);

  if (!summary) return null;

  const executiveText = summary.executiveSummary;

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-5 shadow-lg shadow-indigo-950/20 border border-slate-800 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md shadow-indigo-500/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono flex items-center gap-1">
                AI Synthesis & Evaluation
              </span>
              <span className="text-[11px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                {summary.totalFound} candidates evaluated
              </span>
            </div>

            <p className="text-sm sm:text-[15px] text-slate-200 leading-relaxed font-sans font-normal">
              {executiveText}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all shrink-0 cursor-pointer border border-white/10"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded 4-Pillar Scorecard & Tips */}
      {isExpanded && (
        <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-4 relative z-10">
          {/* 4-Pillar Metric Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Relevance */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/40 transition-all">
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
                <Compass className="w-3.5 h-3.5" />
                <span>{t.criteriaRelevance}</span>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                {summary.criteriaBreakdown?.relevance || 'High intent correlation across queries.'}
              </p>
            </div>

            {/* License Safety */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-all">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t.criteriaLicense}</span>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                {summary.criteriaBreakdown?.licenseSafety || 'Commercial-friendly licenses audited.'}
              </p>
            </div>

            {/* Community Validation */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 transition-all">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
                <Users2 className="w-3.5 h-3.5" />
                <span>{t.criteriaCommunity}</span>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                {summary.criteriaBreakdown?.communityValidation || 'Verified community downloads & stars.'}
              </p>
            </div>

            {/* Engineering Readiness */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all">
              <div className="flex items-center gap-1.5 text-purple-400 font-semibold mb-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>{t.criteriaEngineering}</span>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                {summary.criteriaBreakdown?.engineeringReadiness || 'Ready-to-use Python loaders and splits.'}
              </p>
            </div>
          </div>

          {/* Market Tips / Engineering Advice */}
          {summary.marketTips && summary.marketTips.length > 0 && (
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-xs font-semibold text-indigo-300 font-mono">Engineering Tip:</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {summary.marketTips[0]}
                </p>
              </div>
            </div>
          )}

          {/* Related Queries */}
          {summary.suggestedRelatedQueries && summary.suggestedRelatedQueries.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 text-[11px] font-mono">{t.relatedQueries}</span>
              {summary.suggestedRelatedQueries.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectQuery(q)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs transition-all cursor-pointer border border-white/10"
                >
                  <span>{q}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

