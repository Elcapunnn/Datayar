import React from 'react';
import { 
  Star, 
  Download, 
  Bookmark, 
  Layers, 
  ShieldCheck, 
  AlertTriangle,
  ArrowUpRight,
  Database,
  Code2,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { DatasetItem } from '../types.ts';
import { translations } from '../i18n.ts';

interface DatasetCardProps {
  item: DatasetItem;
  rank: number;
  onInspect: (item: DatasetItem) => void;
  isBookmarked: boolean;
  onToggleBookmark: (item: DatasetItem) => void;
  isCompared: boolean;
  onToggleCompare: (item: DatasetItem) => void;
}

export const DatasetCard: React.FC<DatasetCardProps> = ({
  item,
  onInspect,
  isBookmarked,
  onToggleBookmark,
  isCompared,
  onToggleCompare,
}) => {
  const t = translations.en;

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'huggingface': return 'Hugging Face';
      case 'github': return 'GitHub';
      case 'kaggle': return 'Kaggle';
      case 'openml': return 'OpenML';
      case 'paperswithcode': return 'PapersWithCode';
      default: return platform;
    }
  };

  return (
    <div 
      className={`group rounded-xl bg-white border transition-all duration-150 flex flex-col justify-between shadow-2xs hover:shadow-md ${
        isCompared 
          ? 'border-zinc-900 ring-2 ring-zinc-900/10' 
          : 'border-zinc-200 hover:border-zinc-300'
      }`}
    >
      <div className="p-4 sm:p-5">
        {/* Top meta: Platform + ItemType + Verified + Quality Score */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Item type badge */}
            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md font-mono ${
              item.itemType === 'code_repository'
                ? 'text-indigo-700 bg-indigo-50 border border-indigo-200/60'
                : 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
            }`}>
              {item.itemType === 'code_repository' ? (
                <>
                  <Code2 className="w-3 h-3" />
                  <span>Code Repo</span>
                </>
              ) : (
                <>
                  <Database className="w-3 h-3" />
                  <span>Dataset</span>
                </>
              )}
            </span>

            {/* Platform badge */}
            <span className="text-[11px] font-medium text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md font-mono">
              {getPlatformLabel(item.platform)}
            </span>

            {/* Verified live API tag */}
            {item.isVerified && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200/60" title="Verified via canonical API">
                <CheckCircle2 className="w-2.5 h-2.5 text-blue-600" />
                <span>Verified</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-md font-mono shrink-0">
            <span className="text-[10px] text-zinc-400 font-normal">Score</span>
            <span>{item.aiScore}</span>
          </div>
        </div>

        {/* Source ID / Canonical Title */}
        <div className="mb-2">
          <h3 
            onClick={() => onInspect(item)}
            className="text-sm sm:text-base font-semibold text-zinc-900 hover:text-blue-600 cursor-pointer line-clamp-1 tracking-tight transition-colors font-mono"
            title={item.sourceId || item.title}
          >
            {item.sourceId || item.title}
          </h3>
          <p className="text-[11px] text-zinc-400 font-normal truncate mt-0.5">
            {item.authorOrOrg} • {item.lastUpdated}
          </p>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed mb-4">
          {item.description}
        </p>

        {/* Essential Info Row */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-zinc-100 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5 font-medium text-zinc-700 font-mono text-[11px]">
            {item.platform === 'github' ? <Star className="w-3.5 h-3.5 text-amber-500" /> : <Download className="w-3.5 h-3.5 text-zinc-400" />}
            <span>{item.downloadsStr || item.starsOrDownloads}</span>
          </div>

          <div className="text-[11px] uppercase font-medium text-zinc-500 font-mono">
            {item.modality} {item.sizeStr ? `• ${item.sizeStr}` : ''}
          </div>

          {/* Strict License Indicator */}
          <div className="flex items-center gap-1 text-[11px] font-medium truncate max-w-[130px]" title={`License: ${item.license} (${item.licenseCategory})`}>
            {item.licenseCategory === 'commercial_friendly' ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{item.license}</span>
              </span>
            ) : item.licenseCategory === 'non_commercial' ? (
              <span className="inline-flex items-center gap-1 text-amber-700 font-mono">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">{item.license}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-zinc-500 font-mono">
                <HelpCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="truncate">{item.license || 'Unknown'}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-2.5 bg-zinc-50/70 border-t border-zinc-100 rounded-b-xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {/* Bookmark */}
          <button
            type="button"
            onClick={() => onToggleBookmark(item)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isBookmarked
                ? 'text-amber-600 bg-amber-50'
                : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60'
            }`}
            title={t.bookmarks}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
          </button>

          {/* Compare */}
          <button
            type="button"
            onClick={() => onToggleCompare(item)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
              isCompared
                ? 'bg-zinc-900 text-white font-medium'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
            title={t.compare}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[11px]">{t.compare}</span>
          </button>
        </div>

        {/* View Details */}
        <button
          type="button"
          onClick={() => onInspect(item)}
          className="flex items-center gap-1 text-xs font-semibold text-zinc-900 hover:text-blue-600 cursor-pointer transition-colors"
        >
          <span>Inspect & Code</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
