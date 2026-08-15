import React from 'react';
import { Layers, X, Play } from 'lucide-react';
import { DatasetItem } from '../types.ts';
import { translations } from '../i18n.ts';

interface ComparisonDrawerProps {
  items: DatasetItem[];
  onOpenCompare: () => void;
  onClearCompare: () => void;
  onRemoveItem: (id: string) => void;
}

export const ComparisonDrawer: React.FC<ComparisonDrawerProps> = ({
  items,
  onOpenCompare,
  onClearCompare,
  onRemoveItem,
}) => {
  const t = translations.en;

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-zinc-900 text-white border border-zinc-800 shadow-2xl rounded-xl p-2.5 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-150" dir="ltr">
      {/* Left info & chips */}
      <div className="flex items-center gap-2 overflow-x-auto">
        <div className="w-7 h-7 rounded-lg bg-white text-zinc-900 flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-2xs">
          {items.length}
        </div>
        <div className="hidden sm:block">
          <span className="text-xs font-bold text-white block">
            {items.length} {t.compareDrawerText}
          </span>
          <span className="text-[10px] text-zinc-400">
            {items.length < 2 ? 'Select at least 1 more item' : 'Ready for matrix comparison'}
          </span>
        </div>

        {/* Mini Item Badges */}
        <div className="flex items-center gap-1.5 ms-2">
          {items.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-[11px] text-zinc-200 font-medium whitespace-nowrap font-mono"
            >
              <span className="max-w-[90px] truncate">{item.title}</span>
              <button
                onClick={() => onRemoveItem(item.id)}
                className="text-zinc-400 hover:text-white p-0.5 cursor-pointer transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onClearCompare}
          className="p-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          title={t.clearCompare}
        >
          <X className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenCompare}
          disabled={items.length < 2}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-zinc-100 text-zinc-900 shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>{t.runCompare}</span>
        </button>
      </div>
    </div>
  );
};
