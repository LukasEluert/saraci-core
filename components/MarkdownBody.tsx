"use client";

import ReactMarkdown from "react-markdown";

export function MarkdownBody({ source }: { source: string }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="mb-3 text-xl font-medium tracking-tight text-[var(--text-primary)]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 mt-6 text-sm font-medium tracking-tight text-[var(--text-primary)] first:mt-0">
              {children}
            </h2>
          ),
          p: ({ children }) => (
            <p className="leading-relaxed text-[var(--text-secondary)]">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-medium text-[var(--text-primary)]">{children}</strong>
          ),
          ul: ({ children }) => (
            <ul className="list-disc space-y-1 ps-5 text-[var(--text-secondary)]">{children}</ul>
          ),
          li: ({ children }) => <li>{children}</li>,
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
