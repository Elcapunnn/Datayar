import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertTriangle, 
  FileCode, 
  Send, 
  Loader2, 
  CheckCircle2, 
  Bookmark,
  Layers,
  BookOpen,
  MessageSquareCode,
  Calendar,
  User,
  Sliders,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { DatasetItem } from '../types';
import { translations } from '../i18n';
import { fetchJson } from '../utils/api';

interface DatasetDetailModalProps {
  item: DatasetItem | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (item: DatasetItem) => void;
  isCompared: boolean;
  onToggleCompare: (item: DatasetItem) => void;
}

export const DatasetDetailModal: React.FC<DatasetDetailModalProps> = ({
  item,
  onClose,
  isBookmarked,
  onToggleBookmark,
  isCompared,
  onToggleCompare,
}) => {
  const t = translations.en;
  const [activeTab, setActiveTab] = useState<'overview' | 'score' | 'code' | 'advisor'>('overview');
  const [activeSnippetIdx, setActiveSnippetIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  // AI Chat state
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);

  if (!item) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isAsking) return;

    const userText = question.trim();
    setQuestion('');
    setChatHistory((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsAsking(true);

    try {
      const res = await fetchJson<{ answer?: string }>('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataset: item,
          question: userText,
          lang: 'en',
        }),
      });

      if (res.ok && res.data) {
        setChatHistory((prev) => [
          ...prev, 
          { sender: 'ai', text: res.data?.answer || 'Analysis completed.' }
        ]);
      } else {
        setChatHistory((prev) => [
          ...prev, 
          { sender: 'ai', text: res.error?.message || 'Failed to reach technical consultant. Please retry.' }
        ]);
      }
    } catch (err: any) {
      setChatHistory((prev) => [...prev, { sender: 'ai', text: `Error: ${err.message}` }]);
    } finally {
      setIsAsking(false);
    }
  };

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'huggingface': return 'Hugging Face';
      case 'github': return 'GitHub';
      case 'kaggle': return 'Kaggle';
      case 'openml': return 'OpenML';
      case 'paperswithcode': return 'PapersWithCode';
      default: return platform;
    }
  };

  const activeSnippet = item.codeSnippets?.[activeSnippetIdx] || {
    title: 'Python Loader',
    code: `from datasets import load_dataset\n\n# Load dataset\ndataset = load_dataset("${item.sourceId || item.title}")\nprint(dataset)`,
    language: 'python'
  };

  const scoreBreakdown = item.scoreBreakdown || {
    relevance: 35,
    exactMatch: 15,
    sourceQuality: 8,
    documentation: 8,
    popularity: 7,
    recency: 5,
    licenseConfidence: item.licenseCategory === 'commercial_friendly' ? 5 : 2,
    penalties: 0,
    finalScore: item.aiScore || 85,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-white border border-zinc-200 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-zinc-900"
        dir="ltr"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 bg-zinc-50/50 flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded-md font-medium font-mono text-[11px] ${
                item.itemType === 'code_repository'
                  ? 'text-indigo-700 bg-indigo-50 border border-indigo-200'
                  : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
              }`}>
                {item.itemType === 'code_repository' ? 'Code Repository' : 'Dataset'}
              </span>
              <span className="px-2 py-0.5 rounded-md font-medium text-zinc-700 bg-zinc-200/80 font-mono text-[11px]">
                {getPlatformLabel(item.platform)}
              </span>
              {item.isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-blue-700 bg-blue-50 border border-blue-200 text-[11px]">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  <span>Verified Canonical Source</span>
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-xl font-bold text-zinc-900 font-mono break-all">
              {item.sourceId || item.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 font-mono">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span>{item.authorOrOrg}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Updated: {item.lastUpdated}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onToggleBookmark(item)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isBookmarked 
                  ? 'bg-amber-50 border-amber-200 text-amber-600' 
                  : 'border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'
              }`}
              title="Bookmark"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
            </button>

            <button
              onClick={() => onToggleCompare(item)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isCompared 
                  ? 'bg-zinc-900 border-zinc-900 text-white' 
                  : 'border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'
              }`}
              title="Compare"
            >
              <Layers className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-5 border-b border-zinc-200 bg-white flex items-center gap-4 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-zinc-900 text-zinc-900 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Overview & License</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'code'
                ? 'border-zinc-900 text-zinc-900 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Python Loaders & Code</span>
          </button>

          <button
            onClick={() => setActiveTab('score')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'score'
                ? 'border-zinc-900 text-zinc-900 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>AI Score Audit</span>
          </button>

          <button
            onClick={() => setActiveTab('advisor')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'advisor'
                ? 'border-zinc-900 text-zinc-900 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <MessageSquareCode className="w-3.5 h-3.5 text-indigo-600" />
            <span>Technical Consultant</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW & LICENSE */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Description
                </h4>
                <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed bg-zinc-50 p-3.5 rounded-xl border border-zinc-200/80">
                  {item.description}
                </p>
              </div>

              {/* License Breakdown Card */}
              <div className={`p-4 rounded-xl border ${
                item.licenseCategory === 'commercial_friendly'
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : item.licenseCategory === 'non_commercial'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-800'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-xs">
                      {item.licenseCategory === 'commercial_friendly' ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <span>License Assessment: <strong>{item.license}</strong> ({item.licenseCategory === 'commercial_friendly' ? 'Commercial Ready' : 'Research / Non-Commercial'})</span>
                    </div>
                    <p className="text-xs opacity-90 leading-relaxed font-sans">
                      {item.licenseDisclaimer || 'SPDX analysis completed. Always verify specific repository terms prior to proprietary model weights compilation.'}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/80 border border-current font-bold uppercase shrink-0">
                    {item.licenseCategory}
                  </span>
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl bg-white border border-zinc-200 space-y-2 shadow-2xs">
                  <h5 className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t.pros}</span>
                  </h5>
                  <ul className="space-y-1 text-xs text-zinc-600 list-disc list-inside">
                    {item.pros.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-zinc-200 space-y-2 shadow-2xs">
                  <h5 className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{t.cons}</span>
                  </h5>
                  <ul className="space-y-1 text-xs text-zinc-600 list-disc list-inside">
                    {item.cons.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Technical Specifications Bar */}
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase">Modality</span>
                  <span className="font-semibold text-zinc-800 uppercase">{item.modality}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase">Telemetry</span>
                  <span className="font-semibold text-zinc-800">{item.downloadsStr || item.starsOrDownloads}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase">Size / Samples</span>
                  <span className="font-semibold text-zinc-800">{item.sizeStr || item.sampleCount || 'Standard'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase">Quality Score</span>
                  <span className="font-semibold text-zinc-800">{item.aiScore}/100</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PYTHON LOADERS & CODE */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {(item.codeSnippets || []).map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSnippetIdx(idx)}
                      className={`px-3 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                        activeSnippetIdx === idx
                          ? 'bg-zinc-900 text-white font-semibold'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleCopy(activeSnippet.code)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              {/* Code display block */}
              <div className="rounded-xl bg-zinc-950 text-zinc-200 p-4 font-mono text-xs overflow-x-auto shadow-inner">
                <pre>{activeSnippet.code}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: SCORE AUDIT */}
          {activeTab === 'score' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 font-sans">Multi-Criteria Score Breakdown</h4>
                  <p className="text-xs text-zinc-500 font-sans mt-0.5">Objective weighting formula</p>
                </div>
                <div className="text-lg font-bold text-zinc-900 bg-white px-3 py-1 rounded-lg border border-zinc-200">
                  {scoreBreakdown.finalScore}/100
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-zinc-200 rounded-lg flex justify-between">
                  <span className="text-zinc-600 font-sans">Query Relevance & Tokens</span>
                  <span className="font-bold text-zinc-900">{scoreBreakdown.relevance}/40</span>
                </div>
                <div className="p-3 bg-white border border-zinc-200 rounded-lg flex justify-between">
                  <span className="text-zinc-600 font-sans">Exact Title & Canonical Match</span>
                  <span className="font-bold text-zinc-900">+{scoreBreakdown.exactMatch}/15</span>
                </div>
                <div className="p-3 bg-white border border-zinc-200 rounded-lg flex justify-between">
                  <span className="text-zinc-600 font-sans">Source Platform Authority</span>
                  <span className="font-bold text-zinc-900">+{scoreBreakdown.sourceQuality}/10</span>
                </div>
                <div className="p-3 bg-white border border-zinc-200 rounded-lg flex justify-between">
                  <span className="text-zinc-600 font-sans">Documentation & Model Cards</span>
                  <span className="font-bold text-zinc-900">+{scoreBreakdown.documentation}/10</span>
                </div>
                <div className="p-3 bg-white border border-zinc-200 rounded-lg flex justify-between">
                  <span className="text-zinc-600 font-sans">Community Stars & Downloads</span>
                  <span className="font-bold text-zinc-900">+{scoreBreakdown.popularity}/10</span>
                </div>
                <div className="p-3 bg-white border border-zinc-200 rounded-lg flex justify-between">
                  <span className="text-zinc-600 font-sans">Commercial License Safety</span>
                  <span className="font-bold text-emerald-600">+{scoreBreakdown.licenseConfidence}/5</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI TECHNICAL CONSULTANT */}
          {activeTab === 'advisor' && (
            <div className="space-y-4 flex flex-col h-[350px]">
              <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                {chatHistory.length === 0 ? (
                  <div className="py-12 text-center text-xs text-zinc-400 space-y-2">
                    <Sparkles className="w-6 h-6 mx-auto text-indigo-500" />
                    <p className="font-medium text-zinc-600">Ask the Technical Consultant</p>
                    <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                      Inquire about preprocessing pipelines, PyTorch / Hugging Face integrations, hardware GPU RAM requirements, or licensing compliance.
                    </p>
                  </div>
                ) : (
                  chatHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl text-xs max-w-[85%] leading-relaxed ${
                        msg.sender === 'user'
                          ? 'ms-auto bg-zinc-900 text-white font-sans'
                          : 'me-auto bg-white border border-zinc-200 text-zinc-800 shadow-2xs whitespace-pre-wrap font-sans'
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))
                )}
                {isAsking && (
                  <div className="flex items-center gap-2 text-xs text-zinc-400 p-2 font-mono">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing technical parameters...</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendQuestion} className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. How do I fine-tune a model with this dataset in PyTorch?"
                  className="flex-1 py-2 px-3 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
                />
                <button
                  type="submit"
                  disabled={isAsking || !question.trim()}
                  className="px-4 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
          <a
            href={item.canonicalUrl || item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900 transition-colors"
          >
            <span>Open Source on {getPlatformLabel(item.platform)}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-black text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
