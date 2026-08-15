import React, { useState } from 'react';
import { 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Compass, 
  Users2, 
  Cpu
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
  const [isExpanded, setIsExpanded] = useState(false);

  if (!summary) return null;

  const executiveText = summary.executiveSummary;

  return (
    <div className="mb-5 rounded-xl bg-white border border-zinc-200/90 p-4 shadow-xs">
      {/* Top row: Summary lead */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-md bg-zinc-900 flex items-center justify-center text-white text-[11px] font-mono shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-zinc-900 font-sans">
                AI Executive Briefing
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">
                ({summary.totalFound} {t.resultsCount})
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-sans">
              {executiveText}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors shrink-0 cursor-pointer"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Breakdown */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-zinc-100 space-y-3">
          {/* Subtle Criteria Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-100">
              <div className="flex items-center gap-1 text-zinc-700 font-medium mb-0.5">
                <Compass className="w-3 h-3 text-zinc-500" />
                <span>{t.criteriaRelevance}</span>
              </div>
              <p className="text-[11px] text-zinc-500 line-clamp-2">
                {summary.criteriaBreakdown?.relevance || 'High correlation'}
              </p>
            </div>

            <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-100">
              <div className="flex items-center gap-1 text-emerald-700 font-medium mb-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>{t.criteriaLicense}</span>
              </div>
              <p className="text-[11px] text-zinc-500 line-clamp-2">
                {summary.criteriaBreakdown?.licenseSafety || 'Commercial friendly'}
              </p>
            </div>

            <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-100">
              <div className="flex items-center gap-1 text-zinc-700 font-medium mb-0.5">
                <Users2 className="w-3 h-3 text-zinc-500" />
                <span>{t.criteriaCommunity}</span>
              </div>
              <p className="text-[11px] text-zinc-500 line-clamp-2">
                {summary.criteriaBreakdown?.communityValidation || 'Verified'}
              </p>
            </div>

            <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-100">
              <div className="flex items-center gap-1 text-zinc-700 font-medium mb-0.5">
                <Cpu className="w-3 h-3 text-zinc-500" />
                <span>{t.criteriaEngineering}</span>
              </div>
              <p className="text-[11px] text-zinc-500 line-clamp-2">
                {summary.criteriaBreakdown?.engineeringReadiness || 'Ready to use'}
              </p>
            </div>
          </div>

          {/* Related Queries */}
          {summary.suggestedRelatedQueries && summary.suggestedRelatedQueries.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-zinc-400 text-[11px]">{t.relatedQueries}</span>
              {summary.suggestedRelatedQueries.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectQuery(q)}
                  className="px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] transition-colors cursor-pointer"
                >
                  +{q}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
