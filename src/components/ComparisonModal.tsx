import React, { useState, useEffect } from 'react';
import { 
  X, 
  Layers, 
  Award, 
  AlertTriangle, 
  Loader2
} from 'lucide-react';
import { DatasetItem } from '../types';
import { translations } from '../i18n';

interface ComparisonModalProps {
  items: DatasetItem[];
  onClose: () => void;
  onRemoveItem: (id: string) => void;
}

interface CompareResult {
  verdictEn: string;
  winnerTitle: string;
  comparisonMatrix: {
    metric: string;
    scores: string[];
    winnerIndex?: number;
  }[];
  tradeoffs: string[];
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  items,
  onClose,
  onRemoveItem,
}) => {
  const t = translations.en;
  const [loading, setLoading] = useState(true);
  const [compareData, setCompareData] = useState<CompareResult | null>(null);

  useEffect(() => {
    if (items.length >= 2) {
      fetchComparison();
    }
  }, [items]);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, lang: 'en' }),
      });
      if (res.ok) {
        const data = await res.json();
        setCompareData(data);
      }
    } catch (err) {
      console.error('Comparison error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] bg-white border border-zinc-200 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-150 text-zinc-900"
        dir="ltr"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold shadow-2xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900">
                {t.compareTitle}
              </h3>
              <p className="text-xs text-zinc-500">
                Comparative Decision Matrix & Engineering Evaluation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-16 text-center space-y-3 font-mono">
              <Loader2 className="w-7 h-7 animate-spin text-zinc-800 mx-auto" />
              <p className="text-xs text-zinc-600 font-medium">
                Generating multi-criteria comparison matrix...
              </p>
            </div>
          ) : (
            <>
              {/* Decision Banner */}
              {compareData && (
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900">
                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{t.winnerChoice} <strong className="text-zinc-900 underline font-bold font-mono">{compareData.winnerTitle}</strong></span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
                    {compareData.verdictEn}
                  </p>
                </div>
              )}

              {/* Selected Items Grid Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((item, idx) => (
                  <div key={item.id} className="p-3.5 rounded-xl bg-white border border-zinc-200 relative shadow-2xs">
                    <div className="flex items-center justify-between gap-1 mb-1.5 font-mono">
                      <span className="text-[11px] font-semibold text-zinc-500 uppercase">Option #{idx + 1}</span>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-zinc-400 hover:text-rose-600 text-xs p-1 cursor-pointer transition-colors"
                        title="Remove from comparison"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h5 className="text-sm font-bold text-zinc-900 truncate font-mono" title={item.title}>
                      {item.title}
                    </h5>
                    <p className="text-xs text-zinc-500 mb-2 font-mono">{item.platform} • {item.authorOrOrg}</p>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-100 font-mono">
                      <span className="text-zinc-500">Score:</span>
                      <span className="font-semibold text-zinc-900">{item.aiScore}/100</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Side-by-Side Comparison Matrix Table */}
              <div className="rounded-xl border border-zinc-200 overflow-hidden bg-white shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-start">
                    <thead className="bg-zinc-50 text-zinc-800 border-b border-zinc-200">
                      <tr>
                        <th className="p-3 text-start font-semibold">Evaluation Metric</th>
                        {items.map((item) => (
                          <th key={item.id} className="p-3 text-start font-semibold text-zinc-900 font-mono">
                            {item.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-zinc-800">
                      {/* Platform */}
                      <tr>
                        <td className="p-3 font-medium text-zinc-500">Platform</td>
                        {items.map((i) => (
                          <td key={i.id} className="p-3 uppercase font-mono text-[11px]">{i.platform}</td>
                        ))}
                      </tr>
                      {/* Modality */}
                      <tr>
                        <td className="p-3 font-medium text-zinc-500">Modality</td>
                        {items.map((i) => (
                          <td key={i.id} className="p-3 uppercase font-mono text-[11px]">{i.modality}</td>
                        ))}
                      </tr>
                      {/* License */}
                      <tr>
                        <td className="p-3 font-medium text-zinc-500">Commercial License</td>
                        {items.map((i) => (
                          <td key={i.id} className="p-3 font-mono text-[11px]">
                            <span className={`inline-flex items-center gap-1 font-semibold ${
                              i.licenseCategory === 'commercial_friendly' ? 'text-emerald-700' : 'text-amber-700'
                            }`}>
                              {i.license}
                            </span>
                          </td>
                        ))}
                      </tr>
                      {/* Downloads / Stars */}
                      <tr>
                        <td className="p-3 font-medium text-zinc-500">Downloads / Stars</td>
                        {items.map((i) => (
                          <td key={i.id} className="p-3 font-semibold font-mono text-[11px]">{i.downloadsStr || i.starsOrDownloads}</td>
                        ))}
                      </tr>
                      {/* Dynamic Matrix from AI */}
                      {compareData?.comparisonMatrix?.map((row, rIdx) => (
                        <tr key={rIdx}>
                          <td className="p-3 font-medium text-zinc-500">{row.metric}</td>
                          {row.scores.map((score, sIdx) => (
                            <td key={sIdx} className="p-3 leading-relaxed text-zinc-700">
                              {score}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tradeoffs and Risks */}
              {compareData?.tradeoffs && compareData.tradeoffs.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-950 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Key Trade-offs & Engineering Considerations:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs text-amber-900">
                    {compareData.tradeoffs.map((to, i) => (
                      <li key={i}>{to}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-black text-white transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
