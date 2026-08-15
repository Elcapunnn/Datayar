import React from 'react';
import { 
  ArrowUpDown, 
  ShieldCheck, 
  Globe2, 
  Database,
  Code2
} from 'lucide-react';
import { SearchFilters } from '../types';
import { translations } from '../i18n';

interface FilterBarProps {
  filters: SearchFilters;
  onFilterChange: (newFilters: SearchFilters) => void;
  totalCount: number;
  filteredCount: number;
  datasetCount?: number;
  repoCount?: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  totalCount,
  datasetCount = 0,
  repoCount = 0,
}) => {
  const t = translations.en;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs">
      {/* Item Type Segmented Tabs */}
      <div className="inline-flex items-center p-0.5 rounded-lg bg-zinc-200/70 border border-zinc-200">
        <button
          type="button"
          onClick={() => onFilterChange({ ...filters, itemType: 'all' })}
          className={`px-3 py-1.5 rounded-md font-medium text-xs transition-colors cursor-pointer ${
            filters.itemType === 'all'
              ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          All ({totalCount})
        </button>

        <button
          type="button"
          onClick={() => onFilterChange({ ...filters, itemType: 'dataset' })}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-colors cursor-pointer ${
            filters.itemType === 'dataset'
              ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Database className="w-3 h-3 text-emerald-600" />
          <span>Datasets ({datasetCount})</span>
        </button>

        <button
          type="button"
          onClick={() => onFilterChange({ ...filters, itemType: 'code_repository' })}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-colors cursor-pointer ${
            filters.itemType === 'code_repository'
              ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Code2 className="w-3 h-3 text-indigo-600" />
          <span>Code Repos ({repoCount})</span>
        </button>
      </div>

      {/* Filter dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Sort By */}
        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-zinc-200 shadow-2xs">
          <ArrowUpDown className="w-3 h-3 text-zinc-400" />
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as any })}
            className="bg-transparent text-zinc-800 text-xs focus:outline-none cursor-pointer"
          >
            <option value="ai_score">{t.sortAiScore}</option>
            <option value="popularity">{t.sortPopularity}</option>
            <option value="recent">{t.sortRecent}</option>
          </select>
        </div>

        {/* License Filter */}
        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-zinc-200 shadow-2xs">
          <ShieldCheck className="w-3 h-3 text-zinc-400" />
          <select
            value={filters.license}
            onChange={(e) => onFilterChange({ ...filters, license: e.target.value as any })}
            className="bg-transparent text-zinc-800 text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">{t.licenseAll}</option>
            <option value="commercial_friendly">{t.licenseCommercial}</option>
            <option value="non_commercial">{t.licenseNonCommercial}</option>
          </select>
        </div>

        {/* Language Filter */}
        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-zinc-200 shadow-2xs">
          <Globe2 className="w-3 h-3 text-zinc-400" />
          <select
            value={filters.language}
            onChange={(e) => onFilterChange({ ...filters, language: e.target.value as any })}
            className="bg-transparent text-zinc-800 text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">{t.langAll}</option>
            <option value="english">{t.langEnglish}</option>
            <option value="multilingual">{t.langMulti}</option>
          </select>
        </div>
      </div>
    </div>
  );
};
