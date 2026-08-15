import React from 'react';
import { 
  ArrowUpDown, 
  ShieldCheck, 
  Globe2, 
  Database,
  Code2,
  Filter,
  Layers
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
  filteredCount,
  datasetCount = 0,
  repoCount = 0,
}) => {
  const t = translations.en;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5 text-xs">
      {/* Item Type Segmented Tabs */}
      <div className="inline-flex items-center p-1 rounded-xl bg-slate-200/70 border border-slate-300/80 shadow-inner">
        <button
          type="button"
          onClick={() => onFilterChange({ ...filters, itemType: 'all' })}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
            filters.itemType === 'all'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span>All Results</span>
          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
            {totalCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onFilterChange({ ...filters, itemType: 'dataset' })}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
            filters.itemType === 'dataset'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>Datasets</span>
          <span className="bg-emerald-100/80 text-emerald-800 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
            {datasetCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onFilterChange({ ...filters, itemType: 'code_repository' })}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
            filters.itemType === 'code_repository'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Code Repos</span>
          <span className="bg-indigo-100/80 text-indigo-800 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
            {repoCount}
          </span>
        </button>
      </div>

      {/* Filter dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Sort By */}
        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 font-medium">Sort:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as any })}
            className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ai_score">{t.sortAiScore}</option>
            <option value="popularity">{t.sortPopularity}</option>
            <option value="recent">{t.sortRecent}</option>
          </select>
        </div>

        {/* License Filter */}
        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-slate-400 font-medium">License:</span>
          <select
            value={filters.license}
            onChange={(e) => onFilterChange({ ...filters, license: e.target.value as any })}
            className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all">{t.licenseAll}</option>
            <option value="commercial_friendly">{t.licenseCommercial}</option>
            <option value="non_commercial">{t.licenseNonCommercial}</option>
          </select>
        </div>

        {/* Language Filter */}
        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <Globe2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 font-medium">Lang:</span>
          <select
            value={filters.language}
            onChange={(e) => onFilterChange({ ...filters, language: e.target.value as any })}
            className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
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

