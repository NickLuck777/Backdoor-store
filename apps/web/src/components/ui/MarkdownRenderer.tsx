import * as React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function parseMarkdown(md: string): React.ReactNode[] {
  const lines = md.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let keyCounter = 0;
  const key = () => keyCounter++;

  function parseInline(text: string): React.ReactNode {
    // Process strong, em, code, links in order
    const parts: React.ReactNode[] = [];
    const regex =
      /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)|\[([^\]]+)\]\(([^)]+)\)/g;
    let lastIndex = 0;
    let match;
    let k = 0;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      if (match[1]) {
        // **bold**
        parts.push(<strong key={k++} className="text-white font-semibold">{match[2]}</strong>);
      } else if (match[3]) {
        // *italic*
        parts.push(<em key={k++} className="italic text-[#D0D0E0]">{match[4]}</em>);
      } else if (match[5]) {
        // `code`
        parts.push(
          <code
            key={k++}
            className="bg-[#0D0D1F] text-[#A0C4FF] px-1.5 py-0.5 rounded text-[0.85em] font-mono"
          >
            {match[6]}
          </code>,
        );
      } else if (match[7]) {
        // [link](href)
        parts.push(
          <a
            key={k++}
            href={match[8]}
            className="text-[#003087] hover:text-[#0044CC] underline underline-offset-2 transition-colors"
            target={match[8].startsWith('http') ? '_blank' : undefined}
            rel={match[8].startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            {match[7]}
          </a>,
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{parts}</>;
  }

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines (we'll use margin on elements)
    if (line.trim() === '') {
      i++;
      continue;
    }

    // H1
    if (line.startsWith('# ')) {
      nodes.push(
        <h1
          key={key()}
          className="text-3xl font-extrabold text-white mt-8 mb-4 leading-tight"
        >
          {parseInline(line.slice(2))}
        </h1>,
      );
      i++;
      continue;
    }

    // H2
    if (line.startsWith('## ')) {
      nodes.push(
        <h2
          key={key()}
          className="text-xl font-bold text-white mt-8 mb-3 border-b border-[#3A3A5C] pb-2"
        >
          {parseInline(line.slice(3))}
        </h2>,
      );
      i++;
      continue;
    }

    // H3
    if (line.startsWith('### ')) {
      nodes.push(
        <h3
          key={key()}
          className="text-lg font-semibold text-white mt-6 mb-2"
        >
          {parseInline(line.slice(4))}
        </h3>,
      );
      i++;
      continue;
    }

    // H4
    if (line.startsWith('#### ')) {
      nodes.push(
        <h4
          key={key()}
          className="text-base font-semibold text-[#D0D0E0] mt-4 mb-2"
        >
          {parseInline(line.slice(5))}
        </h4>,
      );
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const bqLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        bqLines.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <blockquote
          key={key()}
          className="border-l-4 border-[#003087] pl-4 py-1 my-4 text-[#B0B0B0] italic bg-[#1E1E38] rounded-r-lg"
        >
          {bqLines.map((bql, bi) => (
            <p key={bi} className="mb-1 last:mb-0">
              {parseInline(bql)}
            </p>
          ))}
        </blockquote>,
      );
      continue;
    }

    // Fenced code block
    if (line.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      nodes.push(
        <pre
          key={key()}
          className="bg-[#0D0D1F] text-[#A0C4FF] font-mono text-sm p-4 rounded-xl my-4 overflow-x-auto border border-[#2A2A4A]"
        >
          <code>{codeLines.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    // Unordered list
    if (line.match(/^[-*] /)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*] /)) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <ul key={key()} className="my-3 space-y-1 pl-5">
          {listItems.map((item, li) => (
            <li key={li} className="text-[#B0B0B0] leading-relaxed list-disc marker:text-[#003087]">
              {parseInline(item)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\. /)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        listItems.push(lines[i].replace(/^\d+\. /, ''));
        i++;
      }
      nodes.push(
        <ol key={key()} className="my-3 space-y-1 pl-5 list-decimal marker:text-[#003087]">
          {listItems.map((item, li) => (
            <li key={li} className="text-[#B0B0B0] leading-relaxed">
              {parseInline(item)}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    // Paragraph
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('>') &&
      !lines[i].startsWith('```') &&
      !lines[i].match(/^[-*] /) &&
      !lines[i].match(/^\d+\. /)
    ) {
      paraLines.push(lines[i]);
      i++;
    }

    if (paraLines.length > 0) {
      nodes.push(
        <p key={key()} className="text-[#B0B0B0] leading-relaxed my-3">
          {parseInline(paraLines.join(' '))}
        </p>,
      );
    }
  }

  return nodes;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const nodes = parseMarkdown(content);

  return (
    <div className={`prose-custom max-w-none ${className}`}>
      {nodes}
    </div>
  );
}

export default MarkdownRenderer;
