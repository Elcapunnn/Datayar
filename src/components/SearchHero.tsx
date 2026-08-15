import React from 'react';
import { 
  Search, 
  X, 
  Loader2,
  FileText,
  Image as ImageIcon,
  Mic,
  Table,
  Code2,
  Boxes
} from 'lucide-react';
import { translations, quickPresets } from '../i18n';
import { ModalityType, PlatformSource } from '../types';

interface SearchHeroProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onExecuteSearch: (customQuery?: string, customModality?: ModalityType) => void;
  isLoading: boolean;
  selectedModality: ModalityType | 'all';
  onSelectModality: (m: ModalityType | 'all') => void;
  selectedPlatform: PlatformSource | 'all';
  onSelectPlatform: (p: PlatformSource | 'all') => void;
}

export const SearchHero: React.FC<SearchHeroProps> = ({
  searchQuery,
  onSearchChange,
  onExecuteSearch,
  isLoading,
  selectedModality,
  onSelectModality,
}) => {
  const t = translations.en;

  const modalities: { key: ModalityType | 'all'; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: t.modalityAll, icon: <Boxes className="w-3.5 h-3.5" /> },
    { key: 'nlp', label: t.modalityNlp, icon: <FileText className="w-3.5 h-3.5" /> },
    { key: 'vision', label: t.modalityVision, icon: <ImageIcon className="w-3.5 h-3.5" /> },
    { key: 'audio', label: t.modalityAudio, icon: <Mic className="w-3.5 h-3.5" /> },
    { key: 'tabular', label: t.modalityTabular, icon: <Table className="w-3.5 h-3.5" /> },
    { key: 'code', label: t.modalityCode, icon: <Code2 className="w-3.5 h-3.5" /> },
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    onExecuteSearch();
  };

  return (
    <div className="pt-8 pb-5 bg-white border-b border-zinc-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 mb-1 font-sans">
            ML Dataset & Code Repository Explorer
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto">
            Search Hugging Face, GitHub, Kaggle, and OpenML with automated license validation and ready-to-run Python loaders
          </p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleFormSubmit} className="relative mb-3">
          <div className="relative flex items-center bg-white rounded-xl border border-zinc-300 focus-within:border-zinc-900 focus-within:ring-2 focus-within:ring-zinc-900/5 transition-all shadow-2xs">
            <div className="ps-3.5 text-zinc-400">
              <Search className="w-4 h-4" />
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full py-3 px-3 bg-transparent text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              className="m-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-black text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <span>{t.searchButton}</span>
              )}
            </button>
          </div>
        </form>

        {/* Modality Filter Pills */}
        <div className="flex items-center justify-center flex-wrap gap-1.5 py-1">
          {modalities.map((m) => {
            const isActive = selectedModality === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => onSelectModality(m.key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 text-white font-medium shadow-2xs'
                    : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
                }`}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Suggestion Tags */}
        <div className="mt-2.5 text-center">
          <div className="inline-flex items-center flex-wrap justify-center gap-1 text-[11px] text-zinc-500">
            <span className="text-zinc-400 font-medium">Suggested:</span>
            {quickPresets.slice(0, 4).map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onSearchChange(preset.query);
                  onExecuteSearch(preset.query, preset.modality as ModalityType);
                }}
                className="px-2 py-0.5 rounded-md hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
