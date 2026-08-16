import React, { useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';

/**
 * Lightweight, dependency-free Markdown renderer tuned for LLM chat answers.
 *
 * Supported syntax:
 *  - Fenced code blocks (```lang) with copy-to-clipboard
 *  - ATX headings (#, ##, ###, ####)
 *  - Unordered lists (-, *, +) and ordered lists (1.)
 *  - Blockquotes (>)
 *  - Horizontal rules (---)
 *  - Tables (| a | b |)
 *  - Inline: **bold**, *italic*, `code`, ~~strike~~, [text](url), bare URLs
 */

type InlineKey = string | number;

const ESCAPED_INLINE_CODE = /(`[^`]+`)/g;

/** Render inline markdown (bold / italic / code / links / strikethrough). */
function renderInline(text: string, keyPrefix: InlineKey = 'i'): React.ReactNode[] {
  if (!text) return [];

  // Split on inline code first so its contents are never re-parsed as markdown.
  const segments = text.split(ESCAPED_INLINE_CODE);

  return segments.flatMap((segment, segIdx) => {
    const key = `${keyPrefix}-${segIdx}`;

    if (segment.startsWith('`') && segment.endsWith('`') && segment.length > 2) {
      return [
        <code
          key={key}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-100 border border-slate-200 text-[0.92em] text-indigo-700 font-mono break-words"
        >
          {segment.slice(1, -1)}
        </code>,
      ];
    }

    return parseEmphasis(segment, key);
  });
}

/** Handles **bold**, *italic*, ~~strike~~, links and bare URLs. */
function parseEmphasis(text: string, keyPrefix: InlineKey): React.ReactNode[] {
  if (!text) return [];

  const nodes: React.ReactNode[] = [];
  // Ordered by precedence: links, bold, italic, strikethrough, bare urls
  const pattern =
    /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(\*\*([^*]+)\*\*)|(__([^_]+)__)|(\*([^*\n]+)\*)|(~~([^~]+)~~)|(https?:\/\/[^\s<>()[\]]+)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const key = `${keyPrefix}-e${idx++}`;

    if (match[1]) {
      // [label](url)
      nodes.push(
        <a
          key={key}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800 underline decoration-indigo-300 hover:decoration-indigo-500 underline-offset-2 font-medium break-words"
        >
          {match[2]}
        </a>
      );
    } else if (match[4] || match[6]) {
      // **bold** or __bold__
      nodes.push(
        <strong key={key} className="font-semibold text-slate-900">
          {match[5] || match[7]}
        </strong>
      );
    } else if (match[8]) {
      // *italic*
      nodes.push(
        <em key={key} className="italic">
          {match[9]}
        </em>
      );
    } else if (match[10]) {
      // ~~strike~~
      nodes.push(
        <span key={key} className="line-through text-slate-400">
          {match[11]}
        </span>
      );
    } else if (match[12]) {
      // bare URL
      nodes.push(
        <a
          key={key}
          href={match[12]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800 underline underline-offset-2 break-all"
        >
          {match[12]}
        </a>
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-sm">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/80 border-b border-slate-800">
        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-[11.5px] leading-relaxed text-slate-100 font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
};

interface Block {
  type: 'code' | 'heading' | 'ul' | 'ol' | 'quote' | 'hr' | 'table' | 'p';
  content?: string;
  language?: string;
  level?: number;
  items?: string[];
  rows?: string[][];
  headers?: string[];
}

/** Split raw markdown into renderable blocks. */
function parseBlocks(markdown: string): Block[] {
  const lines = (markdown || '').replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];

  let i = 0;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: 'p', content: paragraph.join('\n') });
      paragraph = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    const fence = line.match(/^\s*```+\s*([a-zA-Z0-9+#._-]*)\s*$/);
    if (fence) {
      flushParagraph();
      const language = fence[1] || '';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```+\s*$/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push({ type: 'code', content: codeLines.join('\n'), language });
      continue;
    }

    // Horizontal rule
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      flushParagraph();
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // Heading
    const heading = line.match(/^\s*(#{1,6})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      blocks.push({ type: 'heading', level: heading[1].length, content: heading[2].trim() });
      i++;
      continue;
    }

    // Table
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      flushParagraph();
      const splitRow = (row: string) =>
        row
          .trim()
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((c) => c.trim());

      const headers = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      blocks.push({ type: 'table', headers, rows });
      continue;
    }

    // Blockquote
    if (/^\s*>\s?/.test(line)) {
      flushParagraph();
      const quoteLines: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'quote', content: quoteLines.join('\n') });
      continue;
    }

    // Unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        let itemText = lines[i].replace(/^\s*[-*+]\s+/, '');
        i++;
        // Absorb wrapped continuation lines
        while (
          i < lines.length &&
          lines[i].trim() !== '' &&
          !/^\s*([-*+]|\d+\.)\s+/.test(lines[i]) &&
          !/^\s*#{1,6}\s+/.test(lines[i]) &&
          !/^\s*```/.test(lines[i])
        ) {
          itemText += ' ' + lines[i].trim();
          i++;
        }
        items.push(itemText);
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    // Ordered list
    if (/^\s*\d+[.)]\s+/.test(line)) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        let itemText = lines[i].replace(/^\s*\d+[.)]\s+/, '');
        i++;
        while (
          i < lines.length &&
          lines[i].trim() !== '' &&
          !/^\s*([-*+]|\d+[.)])\s+/.test(lines[i]) &&
          !/^\s*#{1,6}\s+/.test(lines[i]) &&
          !/^\s*```/.test(lines[i])
        ) {
          itemText += ' ' + lines[i].trim();
          i++;
        }
        items.push(itemText);
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    // Blank line ends a paragraph
    if (line.trim() === '') {
      flushParagraph();
      i++;
      continue;
    }

    paragraph.push(line.trim());
    i++;
  }

  flushParagraph();

  // Merge adjacent lists of the same type. LLM output frequently separates
  // bullets with a blank line, which would otherwise split one logical list.
  const merged: Block[] = [];
  for (const block of blocks) {
    const previous = merged[merged.length - 1];
    if (
      previous &&
      (block.type === 'ul' || block.type === 'ol') &&
      previous.type === block.type
    ) {
      previous.items = [...(previous.items || []), ...(block.items || [])];
      continue;
    }
    merged.push(block);
  }

  return merged;
}

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content, className = '' }) => {
  const blocks = useMemo(() => parseBlocks(content), [content]);

  return (
    <div className={`text-[13px] leading-relaxed text-slate-700 ${className}`}>
      {blocks.map((block, idx) => {
        const key = `b${idx}`;

        switch (block.type) {
          case 'code':
            return <CodeBlock key={key} code={block.content || ''} language={block.language} />;

          case 'heading': {
            const level = block.level || 2;
            const styles: Record<number, string> = {
              1: 'text-[15px] font-bold text-slate-900 mt-4 mb-2 first:mt-0',
              2: 'text-[14px] font-bold text-slate-900 mt-4 mb-1.5 first:mt-0',
              3: 'text-[13px] font-semibold text-slate-900 mt-3 mb-1 first:mt-0',
              4: 'text-[12.5px] font-semibold text-slate-700 mt-2.5 mb-1 first:mt-0',
            };
            return (
              <p key={key} className={styles[level] || styles[4]}>
                {renderInline(block.content || '', key)}
              </p>
            );
          }

          case 'ul':
            return (
              <ul key={key} className="my-2 space-y-1.5 pl-1">
                {(block.items || []).map((item, itemIdx) => (
                  <li key={`${key}-${itemIdx}`} className="flex gap-2.5">
                    <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    <span className="flex-1 min-w-0">{renderInline(item, `${key}-${itemIdx}`)}</span>
                  </li>
                ))}
              </ul>
            );

          case 'ol':
            return (
              <ol key={key} className="my-2 space-y-1.5">
                {(block.items || []).map((item, itemIdx) => (
                  <li key={`${key}-${itemIdx}`} className="flex gap-2.5">
                    <span className="shrink-0 w-5 h-5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold font-mono flex items-center justify-center mt-px">
                      {itemIdx + 1}
                    </span>
                    <span className="flex-1 min-w-0">{renderInline(item, `${key}-${itemIdx}`)}</span>
                  </li>
                ))}
              </ol>
            );

          case 'quote':
            return (
              <blockquote
                key={key}
                className="my-2.5 pl-3 border-l-2 border-indigo-300 bg-indigo-50/40 py-1.5 pr-2.5 rounded-r-lg text-slate-600 italic"
              >
                {renderInline(block.content || '', key)}
              </blockquote>
            );

          case 'hr':
            return <hr key={key} className="my-3 border-slate-200" />;

          case 'table':
            return (
              <div key={key} className="my-3 overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-[11.5px] border-collapse">
                  <thead className="bg-slate-50">
                    <tr>
                      {(block.headers || []).map((header, hIdx) => (
                        <th
                          key={`${key}-h${hIdx}`}
                          className="px-2.5 py-2 text-left font-semibold text-slate-700 border-b border-slate-200 whitespace-nowrap"
                        >
                          {renderInline(header, `${key}-h${hIdx}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(block.rows || []).map((row, rIdx) => (
                      <tr key={`${key}-r${rIdx}`} className="even:bg-slate-50/50">
                        {row.map((cell, cIdx) => (
                          <td
                            key={`${key}-r${rIdx}c${cIdx}`}
                            className="px-2.5 py-1.5 border-b border-slate-100 text-slate-600 align-top"
                          >
                            {renderInline(cell, `${key}-r${rIdx}c${cIdx}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case 'p':
          default:
            return (
              <p key={key} className="my-1.5 first:mt-0 last:mb-0 break-words">
                {renderInline(block.content || '', key)}
              </p>
            );
        }
      })}
    </div>
  );
};

export default MarkdownMessage;
