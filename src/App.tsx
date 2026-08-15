import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { SearchHero } from './components/SearchHero.tsx';
import { AiAgentSummary } from './components/AiAgentSummary.tsx';
import { FilterBar } from './components/FilterBar.tsx';
import { DatasetCard } from './components/DatasetCard.tsx';
import { DatasetDetailModal } from './components/DatasetDetailModal.tsx';
import { ComparisonModal } from './components/ComparisonModal.tsx';
import { ComparisonDrawer } from './components/ComparisonDrawer.tsx';
import { BookmarksDrawer } from './components/BookmarksDrawer.tsx';
import { ExportModal } from './components/ExportModal.tsx';
import { 
  DatasetItem, 
  SearchResponseData, 
  SearchFilters, 
  ModalityType, 
  PlatformSource
} from './types.ts';
import { translations } from './i18n.ts';
import { fetchJson } from './utils/api.ts';
import { 
  Loader2, 
  Database, 
  Code2,
  AlertCircle, 
  RefreshCw,
  Search
} from 'lucide-react';

export default function App() {
  const t = translations.en;

  // Search States
  const [searchQuery, setSearchQuery] = useState('sentiment analysis transformer');
  const [selectedModality, setSelectedModality] = useState<ModalityType | 'all'>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformSource | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchData, setSearchData] = useState<SearchResponseData | null>(null);

  // Active Search Request Cancellation Ref
  const searchAbortControllerRef = useRef<AbortController | null>(null);

  // Filters State
  const [filters, setFilters] = useState<SearchFilters>({
    platform: 'all',
    modality: 'all',
    license: 'all',
    language: 'all',
    sortBy: 'ai_score',
    minScore: 0,
    itemType: 'all',
  });

  // Modal / Drawer States
  const [inspectingItem, setInspectingItem] = useState<DatasetItem | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Bookmarks State (persisted to localStorage)
  const [bookmarks, setBookmarks] = useState<DatasetItem[]>(() => {
    try {
      const saved = localStorage.getItem('dataset_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Comparison items list (up to 4 items)
  const [comparisonItems, setComparisonItems] = useState<DatasetItem[]>([]);

  // Persist bookmarks
  useEffect(() => {
    try {
      localStorage.setItem('dataset_bookmarks', JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Failed to save bookmarks', e);
    }
  }, [bookmarks]);

  // Initial automatic search on startup
  useEffect(() => {
    handleSearch('sentiment analysis transformer', 'nlp');
  }, []);

  // Main search handler with query cancellation
  const handleSearch = async (customQuery?: string, customModality?: ModalityType) => {
    const q = customQuery !== undefined ? customQuery : searchQuery;
    const mod = customModality !== undefined ? customModality : selectedModality;

    if (!q.trim()) return;

    // CANCEL PREVIOUS PENDING SEARCH REQUEST IMMEDIATELY
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    searchAbortControllerRef.current = abortController;

    setIsLoading(true);
    setSearchError(null);

    try {
      const result = await fetchJson<SearchResponseData>('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          modality: mod !== 'all' ? mod : undefined,
          platform: selectedPlatform !== 'all' ? selectedPlatform : undefined,
          languageFilter: filters.language !== 'all' ? filters.language : undefined,
        }),
        signal: abortController.signal,
      });

      if (!result.ok) {
        if (result.error?.code === 'REQUEST_ABORTED') {
          return;
        }
        throw new Error(result.error?.message || 'Search request failed');
      }

      if (result.data) {
        setSearchData(result.data);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
      console.error('Search error:', err);
      setSearchError(err.message || 'Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle bookmark handler
  const handleToggleBookmark = (item: DatasetItem) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === item.id);
      if (exists) {
        return prev.filter((b) => b.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  // Toggle compare handler
  const handleToggleCompare = (item: DatasetItem) => {
    setComparisonItems((prev) => {
      const exists = prev.some((c) => c.id === item.id);
      if (exists) {
        return prev.filter((c) => c.id !== item.id);
      } else {
        if (prev.length >= 4) {
          return [...prev.slice(1), item];
        }
        return [...prev, item];
      }
    });
  };

  const handleRemoveCompareItem = (id: string) => {
    setComparisonItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Filter & Sort results in memory
  const { allFiltered, datasetItems, repoItems, totalCount } = useMemo(() => {
    if (!searchData?.results) {
      return { allFiltered: [], datasetItems: [], repoItems: [], totalCount: 0 };
    }

    let list = [...searchData.results];

    // Item Type Filter
    if (filters.itemType && filters.itemType !== 'all') {
      list = list.filter((item) => item.itemType === filters.itemType);
    }

    // Modality filter
    if (selectedModality !== 'all') {
      list = list.filter((item) => item.modality === selectedModality);
    }

    // Platform filter
    if (selectedPlatform !== 'all') {
      list = list.filter((item) => item.platform === selectedPlatform);
    }

    // License filter
    if (filters.license !== 'all') {
      list = list.filter((item) => item.licenseCategory === filters.license);
    }

    // Sorting
    list.sort((a, b) => {
      if (filters.sortBy === 'ai_score') {
        return b.aiScore - a.aiScore;
      }
      if (filters.sortBy === 'popularity') {
        return (b.starsOrDownloads || 0) - (a.starsOrDownloads || 0);
      }
      if (filters.sortBy === 'recent') {
        return (b.lastUpdated || '').localeCompare(a.lastUpdated || '');
      }
      return 0;
    });

    const datasets = list.filter((i) => (i.itemType || 'dataset') === 'dataset');
    const repos = list.filter((i) => i.itemType === 'code_repository');

    return {
      allFiltered: list,
      datasetItems: datasets,
      repoItems: repos,
      totalCount: searchData.results.length,
    };
  }, [searchData, selectedModality, selectedPlatform, filters]);

  return (
    <div className="min-h-screen bg-zinc-50/60 text-zinc-900 flex flex-col selection:bg-zinc-900 selection:text-white font-sans" dir="ltr">
      {/* Top Navigation */}
      <Navbar
        bookmarksCount={bookmarks.length}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        compareCount={comparisonItems.length}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Main Search Hero Header */}
      <SearchHero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onExecuteSearch={handleSearch}
        isLoading={isLoading}
        selectedModality={selectedModality}
        onSelectModality={(m) => {
          setSelectedModality(m);
        }}
        selectedPlatform={selectedPlatform}
        onSelectPlatform={(p) => {
          setSelectedPlatform(p);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Loading Overlay State */}
        {isLoading && !searchData && (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center mx-auto text-zinc-800 shadow-xs">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-800">
                Querying live Hugging Face, GitHub & OpenML APIs...
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Auditing metadata, validating licensing categories, and ranking assets
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {searchError && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{searchError}</span>
            </div>
            <button
              onClick={() => handleSearch()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Search Results Display */}
        {searchData && (
          <div>
            {/* Top AI Agent Briefing Card */}
            <AiAgentSummary
              summary={searchData.summary}
              onSelectQuery={(q) => {
                setSearchQuery(q);
                handleSearch(q);
              }}
            />

            {/* Filter & Sorting Controls */}
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              totalCount={totalCount}
              filteredCount={allFiltered.length}
              datasetCount={datasetItems.length}
              repoCount={repoItems.length}
            />

            {/* Results Display */}
            {allFiltered.length === 0 ? (
              <div className="py-16 text-center rounded-xl bg-white border border-zinc-200/80 space-y-2">
                <Search className="w-6 h-6 mx-auto text-zinc-400" />
                <h4 className="text-sm font-medium text-zinc-700">
                  No datasets or repositories match the current filters.
                </h4>
                <p className="text-xs text-zinc-400">
                  Try changing your license or modality filters.
                </p>
              </div>
            ) : filters.itemType === 'all' && datasetItems.length > 0 && repoItems.length > 0 ? (
              /* Grouped View: Datasets and Code Repositories separated cleanly */
              <div className="space-y-8">
                {/* SECTION 1: DATASETS */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Database className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-zinc-900">
                        Verified Datasets
                      </h3>
                      <span className="text-xs font-mono font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                        {datasetItems.length}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {datasetItems.map((item, index) => (
                      <DatasetCard
                        key={item.id}
                        item={item}
                        rank={index + 1}
                        onInspect={setInspectingItem}
                        isBookmarked={bookmarks.some((b) => b.id === item.id)}
                        onToggleBookmark={handleToggleBookmark}
                        isCompared={comparisonItems.some((c) => c.id === item.id)}
                        onToggleCompare={handleToggleCompare}
                      />
                    ))}
                  </div>
                </section>

                {/* SECTION 2: CODE REPOSITORIES */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Code2 className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-zinc-900">
                        Verified Code Repositories & Implementations
                      </h3>
                      <span className="text-xs font-mono font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                        {repoItems.length}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {repoItems.map((item, index) => (
                      <DatasetCard
                        key={item.id}
                        item={item}
                        rank={index + 1}
                        onInspect={setInspectingItem}
                        isBookmarked={bookmarks.some((b) => b.id === item.id)}
                        onToggleBookmark={handleToggleBookmark}
                        isCompared={comparisonItems.some((c) => c.id === item.id)}
                        onToggleCompare={handleToggleCompare}
                      />
                    ))}
                  </div>
                </section>
              </div>
            ) : (
              /* Standard Single Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {allFiltered.map((item, index) => (
                  <DatasetCard
                    key={item.id}
                    item={item}
                    rank={index + 1}
                    onInspect={setInspectingItem}
                    isBookmarked={bookmarks.some((b) => b.id === item.id)}
                    onToggleBookmark={handleToggleBookmark}
                    isCompared={comparisonItems.some((c) => c.id === item.id)}
                    onToggleCompare={handleToggleCompare}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Comparison Drawer */}
      <ComparisonDrawer
        items={comparisonItems}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onClearCompare={() => setComparisonItems([])}
        onRemoveItem={handleRemoveCompareItem}
      />

      {/* Dataset Detail Modal */}
      <DatasetDetailModal
        item={inspectingItem}
        onClose={() => setInspectingItem(null)}
        isBookmarked={inspectingItem ? bookmarks.some((b) => b.id === inspectingItem.id) : false}
        onToggleBookmark={handleToggleBookmark}
        isCompared={inspectingItem ? comparisonItems.some((c) => c.id === inspectingItem.id) : false}
        onToggleCompare={handleToggleCompare}
      />

      {/* Comparison Modal */}
      {isCompareModalOpen && (
        <ComparisonModal
          items={comparisonItems}
          onClose={() => setIsCompareModalOpen(false)}
          onRemoveItem={handleRemoveCompareItem}
        />
      )}

      {/* Bookmarks Drawer */}
      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarks}
        onInspect={setInspectingItem}
        onRemoveBookmark={(id) => setBookmarks((prev) => prev.filter((b) => b.id !== id))}
        onClearAll={() => setBookmarks([])}
      />

      {/* Export Report Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        searchData={searchData}
        filteredResults={allFiltered}
      />

      {/* Minimal Footer */}
      <footer className="mt-auto border-t border-zinc-200 bg-white py-4 text-center text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium text-zinc-700">
            <span>AI Dataset & Code Discovery Platform</span>
          </div>
          <div className="text-zinc-400 text-[11px] font-mono">
            Hugging Face • GitHub • OpenML • Kaggle • PapersWithCode
          </div>
        </div>
      </footer>
    </div>
  );
}
