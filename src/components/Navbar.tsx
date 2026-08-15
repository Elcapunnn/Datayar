import React from 'react';
import { 
  Bookmark, 
  Layers, 
  Download, 
  Database,
  Sparkles,
  Activity,
  Cpu
} from 'lucide-react';
import { translations } from '../i18n';

interface NavbarProps {
  bookmarksCount: number;
  onOpenBookmarks: () => void;
  compareCount: number;
  onOpenCompare: () => void;
  onOpenExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  bookmarksCount,
  onOpenBookmarks,
  compareCount,
  onOpenCompare,
  onOpenExport,
}) => {
  const t = translations.en;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-1 ring-white/20">
            <Cpu className="w-4.5 h-4.5 text-white" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-white animate-pulse" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 font-sans">
                DataSet & Git AI <span className="text-indigo-600 font-extrabold">Agent</span>
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full font-mono">
                <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                <span>v2.5 Production</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-500 hidden sm:inline font-mono">
              HuggingFace • GitHub • OpenML • Kaggle
            </span>
          </div>
        </div>

        {/* Live Status Indicators & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Compare Button */}
          {compareCount > 0 && (
            <button
              onClick={onOpenCompare}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-500/25 cursor-pointer ring-1 ring-indigo-700"
              title={t.compare}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t.compare}</span>
              <span className="bg-white/25 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                {compareCount}
              </span>
            </button>
          )}

          {/* Bookmarks Button */}
          <button
            onClick={onOpenBookmarks}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer border ${
              bookmarksCount > 0 
                ? 'bg-amber-50/80 border-amber-200 text-amber-900 hover:bg-amber-100/80' 
                : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
            }`}
            title={t.bookmarks}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarksCount > 0 ? 'text-amber-600 fill-amber-500' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{t.bookmarks}</span>
            {bookmarksCount > 0 && (
              <span className="bg-amber-500 text-white px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold">
                {bookmarksCount}
              </span>
            )}
          </button>

          {/* Export Report */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-50 border border-slate-200/80 hover:bg-slate-100 text-slate-700 transition-all cursor-pointer shadow-2xs"
            title={t.exportReport}
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">{t.exportReport}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

