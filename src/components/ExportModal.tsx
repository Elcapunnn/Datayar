import React, { useState } from 'react';
import { X, Copy, Check, Download, FileText } from 'lucide-react';
import { SearchResponseData, DatasetItem } from '../types';
import { translations } from '../i18n';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchData: SearchResponseData | null;
  filteredResults: DatasetItem[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  searchData,
  filteredResults,
}) => {
  const t = translations.en;
  const [format, setFormat] = useState<'markdown' | 'json'>('markdown');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate Markdown report
  const generateMarkdown = () => {
    if (!searchData) return '# No search data available';

    const timestamp = new Date().toLocaleDateString('en-US');
    let md = `# AI Dataset & Repository Intelligence Report
**Date:** ${timestamp} | **Search Query:** \`${searchData.query}\`

---

## Executive Summary
${searchData.summary.executiveSummary}

### Evaluation Criteria Breakdown:
- **Task Relevance:** ${searchData.summary.criteriaBreakdown?.relevance || 'High correlation with target task'}
- **Commercial Licensing Safety:** ${searchData.summary.criteriaBreakdown?.licenseSafety || 'Audited for commercial usability'}
- **Community Validation:** ${searchData.summary.criteriaBreakdown?.communityValidation || 'Validated via stars and download volume'}
- **Engineering Readiness:** ${searchData.summary.criteriaBreakdown?.engineeringReadiness || 'Ready-to-use dataset loader scripts provided'}

---

## Dataset & Repository Leaderboard (${filteredResults.length} Items)

| Rank | Asset Title | Type | Platform | Quality Score | License | Telemetry | Source Link |
|---|---|---|---|---|---|---|---|
`;

    filteredResults.forEach((item, index) => {
      const isComm = item.licenseCategory === 'commercial_friendly' ? 'Commercial Ready' : 'Research / Non-commercial';
      md += `| #${index + 1} | **${item.title}** | ${item.itemType} | ${item.platform} | ${item.aiScore}/100 | ${item.license} (${isComm}) | ${item.downloadsStr || item.starsOrDownloads} | [Source](${item.canonicalUrl || item.url}) |\n`;
    });

    md += `\n---\n\n## Technical Details & Ready-to-Use Code\n\n`;

    filteredResults.slice(0, 5).forEach((item, index) => {
      md += `### ${index + 1}. ${item.title} (${item.platform})\n`;
      md += `- **Description:** ${item.description}\n`;
      md += `- **Ranking Rationale:** ${item.aiRankReason}\n`;
      md += `- **Pros:** ${item.pros.join(' • ')}\n`;
      md += `- **Caveats:** ${item.cons.join(' • ')}\n\n`;

      if (item.codeSnippets && item.codeSnippets.length > 0) {
        md += `\`\`\`python\n${item.codeSnippets[0].code}\n\`\`\`\n\n`;
      }
    });

    return md;
  };

  const generateJson = () => {
    return JSON.stringify({
      searchQuery: searchData?.query,
      generatedAt: new Date().toISOString(),
      executiveSummary: {
        query: searchData?.query,
        totalFound: searchData?.summary.totalFound,
        executiveSummary: searchData?.summary.executiveSummary,
        criteriaBreakdown: searchData?.summary.criteriaBreakdown,
        suggestedRelatedQueries: searchData?.summary.suggestedRelatedQueries
      },
      results: filteredResults.map(r => ({
        id: r.id,
        title: r.title,
        itemType: r.itemType,
        platform: r.platform,
        url: r.canonicalUrl || r.url,
        description: r.description,
        license: r.license,
        licenseCategory: r.licenseCategory,
        modality: r.modality,
        aiScore: r.aiScore,
        aiRankReason: r.aiRankReason,
        starsOrDownloads: r.starsOrDownloads,
        sizeStr: r.sizeStr
      })),
    }, null, 2);
  };

  const content = format === 'markdown' ? generateMarkdown() : generateJson();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `dataset-report-${(searchData?.query || 'search').replace(/\s+/g, '-')}.${format === 'markdown' ? 'md' : 'json'}`;
    const blob = new Blob([content], { type: format === 'markdown' ? 'text/markdown' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/60 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-3xl max-h-[88vh] bg-white border border-zinc-200 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-150 text-zinc-900"
        dir="ltr"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold shadow-2xs">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 font-sans">
              {t.exportReport}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 font-mono">
            <button
              onClick={() => setFormat('markdown')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                format === 'markdown'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
              }`}
            >
              Markdown (.md)
            </button>
            <button
              onClick={() => setFormat('json')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                format === 'json'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
              }`}
            >
              JSON (.json)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-black text-white transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="p-4 overflow-y-auto flex-1 bg-zinc-950 font-mono text-xs text-zinc-300 leading-relaxed" dir="ltr">
          <pre className="whitespace-pre-wrap">{content}</pre>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-black text-white cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
