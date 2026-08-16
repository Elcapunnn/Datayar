import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUp,
  BadgeCheck,
  Bot,
  Check,
  Copy,
  RefreshCw,
  ScrollText,
  ShieldAlert,
  Sparkles,
  Trash2,
  TriangleAlert,
  User,
} from 'lucide-react';
import { ChatMessage, DatasetItem } from '../types';
import { fetchJson } from '../utils/api';
import { MarkdownMessage } from './MarkdownMessage';

interface TechnicalConsultantProps {
  item: DatasetItem;
  messages: ChatMessage[];
  onMessagesChange: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

interface SuggestedPrompt {
  label: string;
  prompt: string;
}

const createId = () =>
  `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

/** Context-aware starter prompts derived from the asset's real metadata. */
function buildSuggestions(item: DatasetItem): SuggestedPrompt[] {
  const suggestions: SuggestedPrompt[] = [];

  if (item.itemType === 'code_repository') {
    suggestions.push({
      label: 'Setup & dependencies',
      prompt: `What are the exact setup steps, dependencies, and hardware requirements to run ${item.sourceId} locally?`,
    });
    suggestions.push({
      label: 'Integrate into a pipeline',
      prompt: `How do I integrate ${item.sourceId} into an existing training or inference pipeline?`,
    });
  } else {
    suggestions.push({
      label: 'Load this dataset',
      prompt: `Show me production-ready code to load ${item.sourceId}, including streaming for low memory.`,
    });
    suggestions.push({
      label: 'Preprocess & split',
      prompt: `What preprocessing and train/validation/test split strategy do you recommend for ${item.sourceId}?`,
    });
  }

  if (item.licenseCategory !== 'commercial_friendly') {
    suggestions.push({
      label: 'Commercial use risk',
      prompt: `The license is ${item.license}. Can I use this in a commercial product, and what obligations apply?`,
    });
  } else {
    suggestions.push({
      label: 'License obligations',
      prompt: `The license is ${item.license}. What attribution or compliance obligations do I have when shipping a model trained on this?`,
    });
  }

  if (item.modality === 'vision') {
    suggestions.push({
      label: 'Augmentation strategy',
      prompt: `What image augmentation and normalization strategy works best for training on ${item.sourceId}?`,
    });
  } else if (item.modality === 'audio') {
    suggestions.push({
      label: 'Audio feature pipeline',
      prompt: `What sample rate, feature extraction, and batching setup should I use for ${item.sourceId}?`,
    });
  } else if (item.modality === 'tabular') {
    suggestions.push({
      label: 'Baseline model',
      prompt: `What baseline model and feature engineering steps should I try first on ${item.sourceId}?`,
    });
  } else {
    suggestions.push({
      label: 'Fine-tune a model',
      prompt: `Which base model and hyperparameters would you recommend for fine-tuning on ${item.sourceId}?`,
    });
  }

  suggestions.push({
    label: 'GPU & memory budget',
    prompt: `Estimate the GPU VRAM, system RAM, and disk footprint needed to train with ${item.sourceId}.`,
  });

  return suggestions.slice(0, 5);
}

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/** Animated three-dot "thinking" indicator. */
const ThinkingIndicator: React.FC = () => (
  <div className="flex items-center gap-2.5">
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-chat-bounce"
          style={{ animationDelay: `${i * 140}ms` }}
        />
      ))}
    </div>
    <span className="text-[11px] text-slate-400 font-medium">
      Analyzing metadata, license terms, and integration path...
    </span>
  </div>
);

export const TechnicalConsultant: React.FC<TechnicalConsultantProps> = ({
  item,
  messages,
  onMessagesChange,
}) => {
  const [draft, setDraft] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const suggestions = useMemo(() => buildSuggestions(item), [item]);

  const isEmpty = messages.length === 0;

  // Keep the newest message in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: isEmpty ? 'auto' : 'smooth' });
  }, [messages, isAsking, isEmpty]);

  // Cancel any in-flight request when the asset changes or the view unmounts.
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, [item.id]);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, []);

  const askConsultant = useCallback(
    async (questionText: string, historyBase: ChatMessage[]) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsAsking(true);

      // Only the trailing turns are sent, to keep the prompt tight.
      const history = historyBase
        .filter((m) => !m.isError)
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const res = await fetchJson<{ answer?: string }>('/api/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dataset: item,
            question: questionText,
            history,
            lang: 'en',
          }),
          signal: controller.signal,
        });

        if (res.error?.code === 'REQUEST_ABORTED') return;

        const answer = res.ok ? res.data?.answer?.trim() : '';

        onMessagesChange((prev) => [
          ...prev,
          answer
            ? {
                id: createId(),
                role: 'assistant',
                content: answer,
                createdAt: Date.now(),
              }
            : {
                id: createId(),
                role: 'assistant',
                content:
                  res.error?.message ||
                  'The consultant service did not return an answer. Please retry in a moment.',
                createdAt: Date.now(),
                isError: true,
              },
        ]);
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        onMessagesChange((prev) => [
          ...prev,
          {
            id: createId(),
            role: 'assistant',
            content: err?.message || 'Unexpected error contacting the technical consultant.',
            createdAt: Date.now(),
            isError: true,
          },
        ]);
      } finally {
        setIsAsking(false);
      }
    },
    [item, onMessagesChange]
  );

  const submitQuestion = useCallback(
    (raw: string) => {
      const questionText = raw.trim();
      if (!questionText || isAsking) return;

      const userMessage: ChatMessage = {
        id: createId(),
        role: 'user',
        content: questionText,
        createdAt: Date.now(),
      };

      const nextHistory = [...messages, userMessage];
      onMessagesChange(nextHistory);
      setDraft('');
      requestAnimationFrame(autoResize);
      void askConsultant(questionText, messages);
    },
    [askConsultant, autoResize, isAsking, messages, onMessagesChange]
  );

  const handleRegenerate = useCallback(() => {
    if (isAsking) return;
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;

    // Drop trailing assistant turns so the new answer replaces them.
    let trimmed = [...messages];
    while (trimmed.length > 0 && trimmed[trimmed.length - 1].role === 'assistant') {
      trimmed.pop();
    }
    onMessagesChange(trimmed);
    void askConsultant(lastUser.content, trimmed.slice(0, -1));
  }, [askConsultant, isAsking, messages, onMessagesChange]);

  const handleCopyAnswer = async (message: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedId(message.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitQuestion(draft);
    }
  };

  const licenseWarning =
    item.licenseCategory === 'non_commercial' || item.licenseCategory === 'unknown';

  return (
    <div className="flex flex-col h-[clamp(360px,52vh,540px)] -m-1">
      {/* Consultant header: identity + active context + session actions */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <Bot className="w-4 h-4" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-[13px] font-bold text-slate-900 truncate">ML Technical Consultant</h4>
              <BadgeCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            </div>
            <p className="text-[11px] text-slate-500 truncate font-mono">
              Context: {item.sourceId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {messages.some((m) => m.role === 'assistant') && (
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={isAsking}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 transition-colors cursor-pointer"
              title="Regenerate the last answer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAsking ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
          )}
          {!isEmpty && (
            <button
              type="button"
              onClick={() => {
                abortRef.current?.abort();
                onMessagesChange([]);
              }}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-colors cursor-pointer"
              title="Clear this conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Transcript */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-4 pr-1 space-y-4 scroll-smooth"
      >
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h5 className="text-sm font-bold text-slate-900">
                Ask about {item.itemType === 'code_repository' ? 'this repository' : 'this dataset'}
              </h5>
              <p className="text-xs text-slate-500 leading-relaxed">
                Grounded in the verified metadata for{' '}
                <span className="font-mono text-slate-700">{item.sourceId}</span> — license terms,
                loading code, preprocessing, and hardware planning. Answers never invent URLs or
                statistics.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => submitQuestion(s.prompt)}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50/60 transition-colors cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {licenseWarning && (
              <div className="flex items-start gap-2 max-w-md text-left p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900">
                <ShieldAlert className="w-3.5 h-3.5 mt-px shrink-0 text-amber-600" />
                <span>
                  This asset is licensed <strong>{item.license}</strong>. Ask about commercial
                  obligations before shipping derived models.
                </span>
              </div>
            )}
          </div>
        ) : (
          messages.map((message) =>
            message.role === 'user' ? (
              /* User turn */
              <div key={message.id} className="flex items-start justify-end gap-2.5 animate-chat-in">
                <div className="flex flex-col items-end gap-1 max-w-[85%] min-w-0">
                  <div className="w-fit max-w-full px-3.5 py-2.5 rounded-2xl rounded-br-md bg-slate-900 text-white text-[13px] leading-relaxed whitespace-pre-wrap break-words shadow-sm">
                    {message.content}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono pr-1">
                    {formatTime(message.createdAt)}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              </div>
            ) : (
              /* Assistant turn */
              <div key={message.id} className="flex items-start gap-2.5 animate-chat-in">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    message.isError
                      ? 'bg-rose-100 border border-rose-200 text-rose-600'
                      : 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-200'
                  }`}
                >
                  {message.isError ? (
                    <TriangleAlert className="w-3.5 h-3.5" />
                  ) : (
                    <Bot className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="flex flex-col gap-1 max-w-[88%] min-w-0 group">
                  <div
                    className={`max-w-full px-3.5 py-2.5 rounded-2xl rounded-bl-md border shadow-2xs ${
                      // Structured answers (code blocks, tables) read better at full width.
                      /```|^\s*\|/m.test(message.content) ? 'w-full' : 'w-fit'
                    } ${
                      message.isError
                        ? 'bg-rose-50 border-rose-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    {message.isError ? (
                      <p className="text-[13px] leading-relaxed text-rose-800">{message.content}</p>
                    ) : (
                      <MarkdownMessage content={message.content} />
                    )}
                  </div>

                  <div className="flex items-center gap-2 pl-1">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatTime(message.createdAt)}
                    </span>
                    {!message.isError && (
                      <button
                        type="button"
                        onClick={() => handleCopyAnswer(message)}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        {copiedId === message.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          )
        )}

        {isAsking && (
          <div className="flex items-start gap-2.5 animate-chat-in">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm shadow-indigo-200">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="px-3.5 py-3 rounded-2xl rounded-bl-md bg-white border border-slate-200 shadow-2xs">
              <ThinkingIndicator />
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        {!isEmpty && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {suggestions.slice(0, 3).map((s) => (
              <button
                key={s.label}
                type="button"
                disabled={isAsking}
                onClick={() => submitQuestion(s.prompt)}
                className="shrink-0 px-2 py-1 rounded-md bg-slate-100 text-[10.5px] font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-40 transition-colors cursor-pointer"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitQuestion(draft);
          }}
          className="relative flex items-end gap-2 p-1.5 rounded-2xl bg-white border border-slate-300 focus-within:border-indigo-400 focus-within:ring-3 focus-within:ring-indigo-100 transition-all shadow-2xs"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              item.itemType === 'code_repository'
                ? 'Ask about setup, dependencies, or integration...'
                : 'Ask about loading, preprocessing, licensing, or fine-tuning...'
            }
            className="flex-1 resize-none bg-transparent px-2.5 py-1.5 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none max-h-[140px] leading-relaxed"
          />
          <button
            type="submit"
            disabled={isAsking || !draft.trim()}
            className="shrink-0 w-8 h-8 rounded-xl bg-slate-900 hover:bg-black text-white flex items-center justify-center disabled:bg-slate-200 disabled:text-slate-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
            title="Send question"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between gap-2 px-1">
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <ScrollText className="w-3 h-3" />
            <span>
              Grounded in verified {item.platform} metadata.{' '}
              <kbd className="px-1 py-px rounded bg-slate-100 border border-slate-200 font-mono text-[9px]">
                Enter
              </kbd>{' '}
              to send,{' '}
              <kbd className="px-1 py-px rounded bg-slate-100 border border-slate-200 font-mono text-[9px]">
                Shift+Enter
              </kbd>{' '}
              for a new line.
            </span>
          </p>
          {!isEmpty && (
            <span className="text-[10px] text-slate-400 font-mono shrink-0">
              {messages.filter((m) => m.role === 'user').length} turn
              {messages.filter((m) => m.role === 'user').length === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnicalConsultant;
