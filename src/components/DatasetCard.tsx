import React, { useState } from 'react';
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
  HelpCircle,
  Copy,
  Check,
  FileText,
  Image,
  Mic,
  Table,
  Sparkles
} from 'lucide-react';
import { DatasetItem, ModalityType } from '../types';
import { translations } from '../i18n';

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
  const [isCopied, setIsCopied] = useState(false);

  const getPlatformInfo = (platform: string) => {
    switch (platform) {
      case 'huggingface': 
        return { label: 'Hugging Face', color: 'bg-amber-50 text-amber-800 border-amber-200/80' };
      case 'github': 
        return { label: 'GitHub', color: 'bg-slate-100 text-slate-800 border-slate-300/80' };
      case 'openml': 
        return { label: 'OpenML', color: 'bg-sky-50 text-sky-800 border-sky-200/80' };
      case 'kaggle': 
        return { label: 'Kaggle', color: 'bg-cyan-50 text-cyan-800 border-cyan-200/80' };
      default: 
        return { label: platform, color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const getModalityBadge = (modality: ModalityType) => {
    switch (modality) {
      case 'vision':
        return { label: 'Vision', icon: Image, style: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'audio':
        return { label: 'Audio', icon: Mic, style: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'tabular':
        return { label: 'Tabular', icon: Table, style: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'code':
        return { label: 'Code', icon: Code2, style: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'multimodal':
        return { label: 'Multimodal', icon: Sparkles, style: 'bg-pink-50 text-pink-700 border-pink-200' };
      case 'nlp':
      default:
        return { label: 'NLP / Text', icon: FileText, style: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
  };

  const platformInfo = getPlatformInfo(item.platform);
  const modBadge = getModalityBadge(item.modality);
  const ModIcon = modBadge.icon;

  const quickSnippet = item.codeSnippets?.[0]?.code || (
    item.platform === 'github' 
      ? `git clone ${item.url}.git` 
      : `from datasets import load_dataset\nds = load_dataset("${item.sourceId}")`
  );

  const handleCopySnippet = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(quickSnippet);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1800);
  };

  return (
    <div 
      className={`group rounded-2xl bg-white border transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-indigo-300 relative overflow-hidden ${
        isCompared 
          ? 'border-indigo-600 ring-2 ring-indigo-500/20' 
          : 'border-slate-200/90'
      }`}
    >
      <div className="p-4 sm:p-5">
        {/* Top meta: Platform + ItemType + Modality + AI Score */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Item type badge */}
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md font-mono border ${
              item.itemType === 'code_repository'
                ? 'text-indigo-700 bg-indigo-50/80 border-indigo-200'
                : 'text-emerald-700 bg-emerald-50/80 border-emerald-200'
            }`}>
              {item.itemType === 'code_repository' ? (
                <>
                  <Code2 className="w-3 h-3 text-indigo-600" />
                  <span>Repo</span>
                </>
              ) : (
                <>
                  <Database className="w-3 h-3 text-emerald-600" />
                  <span>Dataset</span>
                </>
              )}
            </span>

            {/* Platform badge */}
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md font-mono border ${platformInfo.color}`}>
              {platformInfo.label}
            </span>

            {/* Modality badge */}
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md font-mono border ${modBadge.style}`}>
              <ModIcon className="w-3 h-3 shrink-0" />
              <span>{modBadge.label}</span>
            </span>

            {/* Verified badge */}
            {item.isVerified && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded-md border border-cyan-200" title="Live Verified Registry Source">
                <CheckCircle2 className="w-2.5 h-2.5 text-cyan-600" />
                <span>Verified</span>
              </span>
            )}
          </div>

          {/* AI Score Badge */}
          <div className="flex items-center gap-1 text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg font-mono shrink-0 shadow-2xs">
            <span className="text-[10px] text-slate-400 font-normal">Score</span>
            <span className="text-indigo-600">{item.aiScore}</span>
          </div>
        </div>

        {/* Canonical Title */}
        <div className="mb-2">
          <h3 
            onClick={() => onInspect(item)}
            className="text-sm sm:text-[15px] font-bold text-slate-900 hover:text-indigo-600 cursor-pointer line-clamp-1 tracking-tight transition-colors font-mono"
            title={item.sourceId || item.title}
          >
            {item.sourceId || item.title}
          </h3>
          <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
            {item.authorOrOrg} • Updated {item.lastUpdated}
          </p>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {item.description}
        </p>

        {/* Essential Metrics & License */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
          {/* Telemetry Count */}
          <div className="flex items-center gap-1.5 font-bold text-slate-700 font-mono text-[11px]">
            {item.platform === 'github' ? (
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            ) : (
              <Download className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{item.downloadsStr || item.starsOrDownloads.toLocaleString()}</span>
          </div>

          {/* Size or Samples */}
          <div className="text-[11px] font-semibold text-slate-500 font-mono">
            {item.sizeStr || item.sampleCount || item.format || 'Standard'}
          </div>

          {/* License Indicator */}
          <div className="flex items-center gap-1 text-[11px] font-semibold truncate max-w-[130px]" title={`License: ${item.license} (${item.licenseCategory})`}>
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
              <span className="inline-flex items-center gap-1 text-slate-500 font-mono">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{item.license || 'Unknown'}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 rounded-b-2xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* Bookmark */}
          <button
            type="button"
            onClick={() => onToggleBookmark(item)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isBookmarked
                ? 'text-amber-600 bg-amber-100/80 border border-amber-200'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
            }`}
            title={t.bookmarks}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
          </button>

          {/* Compare */}
          <button
            type="button"
            onClick={() => onToggleCompare(item)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
              isCompared
                ? 'bg-indigo-600 text-white border-indigo-700'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title={t.compare}
          >
            <Layers className="w-3 h-3" />
            <span className="text-[11px]">{t.compare}</span>
          </button>

          {/* Quick Copy Loader Code */}
          <button
            type="button"
            onClick={handleCopySnippet}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono text-slate-500 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Copy Python Loader / Git Command"
          >
            {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
            <span className="text-[10px]">{isCopied ? 'Copied' : 'Snippet'}</span>
          </button>
        </div>

        {/* View Details */}
        <button
          type="button"
          onClick={() => onInspect(item)}
          className="flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors"
        >
          <span>Inspect</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
        </button>
      </div>
    </div>
  );
};

