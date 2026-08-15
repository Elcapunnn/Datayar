import React from 'react';
import { 
  Bookmark, 
  Layers, 
  Download, 
  Database,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { translations } from '../i18n.ts';

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
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-zinc-900 flex items-center justify-center rounded-lg text-white shadow-2xs">
            <Database className="w-4 h-4 text-zinc-100" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-semibold tracking-tight text-zinc-900 font-sans">
              Dataset & Code Discovery
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md font-mono">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
              <span>Live APIs</span>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Compare Button */}
          {compareCount > 0 && (
            <button
              onClick={onOpenCompare}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-2xs cursor-pointer"
              title={t.compare}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t.compare}</span>
              <span className="bg-white/20 px-1.5 py-0.2 rounded text-[10px] font-mono">
                {compareCount}
              </span>
            </button>
          )}

          {/* Bookmarks Button */}
          <button
            onClick={onOpenBookmarks}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
            title={t.bookmarks}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarksCount > 0 ? 'text-amber-600 fill-amber-500' : 'text-zinc-500'}`} />
            <span className="hidden sm:inline">{t.bookmarks}</span>
            {bookmarksCount > 0 && (
              <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-semibold">
                {bookmarksCount}
              </span>
            )}
          </button>

          {/* Export Report */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
            title={t.exportReport}
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden sm:inline">{t.exportReport}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
