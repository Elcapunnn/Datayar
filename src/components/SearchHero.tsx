import React, { useRef, useEffect } from 'react';
import { 
  Search, 
  X, 
  Loader2, 
  Sparkles,
  FileText,
  Image,
  Mic,
  Table,
  Code2,
  Layers,
  Zap,
  Command
} from 'lucide-react';
import { translations } from '../i18n';
import { ModalityType, PlatformSource } from '../types';

interface SearchHeroProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onExecuteSearch: (customQuery?: string, customModality?: ModalityType) => void;
  isLoading: boolean;
  selectedModality: ModalityType | 'all';
  onSelectModality: (m: ModalityType | 'all') => void;
  selectedPlatform?: PlatformSource | 'all';
  onSelectPlatform?: (p: PlatformSource | 'all') => void;
}

const QUICK_SUGGESTIONS = [
  { label: 'YOLO Object Detection', query: 'yolo object detection', modality: 'vision' as ModalityType, icon: Image },
  { label: 'Whisper Audio Speech', query: 'openai whisper speech recognition', modality: 'audio' as ModalityType, icon: Mic },
  { label: 'Sentiment Transformer', query: 'sentiment analysis transformer', modality: 'nlp' as ModalityType, icon: FileText },
  { label: 'Medical Chest X-Ray', query: 'chest x-ray pneumonia classification', modality: 'vision' as ModalityType, icon: Zap },
  { label: 'Credit Fraud Tabular', query: 'fraud detection credit card tabular', modality: 'tabular' as ModalityType, icon: Table },
];

const MODALITY_TABS: Array<{ id: ModalityType | 'all'; label: string; icon: React.FC<{ className?: string }> }> = [
  { id: 'all', label: 'All Modalities', icon: Layers },
  { id: 'nlp', label: 'NLP & Text', icon: FileText },
  { id: 'vision', label: 'Computer Vision', icon: Image },
  { id: 'audio', label: 'Audio & Speech', icon: Mic },
  { id: 'tabular', label: 'Tabular & ML', icon: Table },
  { id: 'code', label: 'Code & Repos', icon: Code2 },
  { id: 'multimodal', label: 'Multimodal', icon: Sparkles },
];

export const SearchHero: React.FC<SearchHeroProps> = ({
  searchQuery,
  onSearchChange,
  onExecuteSearch,
  isLoading,
  selectedModality,
  onSelectModality,
}) => {
  const t = translations.en;
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl+K / Cmd+K shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    onExecuteSearch(searchQuery, selectedModality !== 'all' ? selectedModality : undefined);
  };

  const handleSuggestionClick = (query: string, modality: ModalityType) => {
    onSearchChange(query);
    onSelectModality(modality);
    onExecuteSearch(query, modality);
  };

  return (
    <div className="relative pt-8 pb-6 border-b border-slate-200/80 bg-white/70 backdrop-blur-md">
      {/* Subtle background glow element */}
      <div className="absolute inset-0 -z-10 bg-radial from-indigo-500/5 via-transparent to-transparent opacity-70 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Headline & Description */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50/80 border border-indigo-200/60 text-indigo-700 text-xs font-semibold mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" style={{ animationDuration: '6s' }} />
            <span>AI-Powered Multi-Registry Discovery Engine</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-2 font-sans">
            Find High-Quality <span className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">Datasets & Repositories</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Search verified benchmarks, pre-trained weights, and pipelines across Hugging Face, GitHub, OpenML, and Kaggle with automated licensing verification.
          </p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleFormSubmit} className="relative mb-4">
          <div className="relative flex items-center bg-white rounded-2xl border border-slate-300/90 hover:border-indigo-400 focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-md shadow-slate-200/50">
            <div className="ps-4 text-slate-400">
              <Search className="w-5 h-5 text-indigo-600" />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search datasets, models, or repos (e.g. sentiment analysis, yolo, whisper, squad)..."
              className="w-full py-3.5 px-3.5 bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
            />

            {/* Keyboard shortcut hint */}
            {!searchQuery && (
              <div className="hidden sm:flex items-center gap-1 me-2 px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-400">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            )}

            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="p-1.5 me-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer rounded-md hover:bg-slate-100"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              className="m-1.5 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 shrink-0 shadow-sm shadow-indigo-500/30 ring-1 ring-indigo-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>{t.searchButton}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 no-scrollbar text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono shrink-0 me-1">
            Popular:
          </span>
          {QUICK_SUGGESTIONS.map((sug) => {
            const Icon = sug.icon;
            return (
              <button
                key={sug.label}
                type="button"
                onClick={() => handleSuggestionClick(sug.query, sug.modality)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100/80 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200/80 text-slate-600 text-xs transition-all shrink-0 cursor-pointer shadow-2xs"
              >
                <Icon className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
                <span>{sug.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modality Filter Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-slate-100 no-scrollbar">
          {MODALITY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedModality === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onSelectModality(tab.id);
                  onExecuteSearch(searchQuery, tab.id !== 'all' ? tab.id : undefined);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white/80 hover:bg-slate-100 text-slate-600 border border-slate-200/80 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

