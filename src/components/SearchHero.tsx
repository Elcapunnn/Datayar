import React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { translations } from '../i18n';
import { ModalityType, PlatformSource } from '../types';

interface SearchHeroProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onExecuteSearch: (customQuery?: string, customModality?: ModalityType) => void;
  isLoading: boolean;
  selectedModality?: ModalityType | 'all';
  onSelectModality?: (m: ModalityType | 'all') => void;
  selectedPlatform?: PlatformSource | 'all';
  onSelectPlatform?: (p: PlatformSource | 'all') => void;
}

export const SearchHero: React.FC<SearchHeroProps> = ({
  searchQuery,
  onSearchChange,
  onExecuteSearch,
  isLoading,
}) => {
  const t = translations.en;

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
        <form onSubmit={handleFormSubmit} className="relative mb-1">
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
      </div>
    </div>
  );
};
