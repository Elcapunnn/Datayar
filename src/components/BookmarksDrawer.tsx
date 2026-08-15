import React from 'react';
import { Bookmark, X, Trash2, ArrowUpRight } from 'lucide-react';
import { DatasetItem } from '../types.ts';
import { translations } from '../i18n.ts';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: DatasetItem[];
  onInspect: (item: DatasetItem) => void;
  onRemoveBookmark: (id: string) => void;
  onClearAll: () => void;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onInspect,
  onRemoveBookmark,
  onClearAll,
}) => {
  const t = translations.en;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-zinc-950/50 backdrop-blur-xs animate-in fade-in duration-150"
      dir="ltr"
    >
      <div className="w-full max-w-md bg-white border-s border-zinc-200 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 text-zinc-900">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
            <h3 className="text-base font-bold text-zinc-900">
              {t.bookmarks} ({bookmarks.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {bookmarks.length === 0 ? (
            <div className="py-20 text-center text-xs text-zinc-400">
              <Bookmark className="w-8 h-8 mx-auto mb-2 text-zinc-300 stroke-1" />
              <p>{t.emptyBookmarks}</p>
            </div>
          ) : (
            bookmarks.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 transition-all space-y-2 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5
                      onClick={() => onInspect(item)}
                      className="text-sm font-semibold text-zinc-900 hover:text-blue-600 transition-colors cursor-pointer line-clamp-1 font-mono"
                    >
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5 uppercase">
                      {item.platform} • {item.modality}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-zinc-700 px-2 py-0.5 rounded-md bg-zinc-100">
                    {item.aiScore}
                  </span>
                </div>

                <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-[11px]">
                  <span className="text-zinc-500 font-mono">
                    {item.license}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onInspect(item)}
                      className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                      title={t.inspect}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRemoveBookmark(item.id)}
                      className="p-1 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {bookmarks.length > 0 && (
          <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
            <button
              onClick={onClearAll}
              className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-black text-white cursor-pointer transition-colors"
            >
              {t.close}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
