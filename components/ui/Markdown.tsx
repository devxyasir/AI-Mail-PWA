'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className = '' }: MarkdownProps) {
  return (
    <div className={`prose prose-sm prose-invert max-w-none font-sans ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ node, ...props }) => <p className="mb-fib-8 leading-relaxed text-on-surface-variant" {...props} />,
          h1: ({ node, ...props }) => <h1 className="text-lg font-serif font-bold uppercase tracking-tight mt-fib-13 mb-fib-8 text-primary" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-md font-serif font-bold uppercase tracking-tight mt-fib-13 mb-fib-8 text-secondary" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-sm font-mono font-bold uppercase tracking-widest mt-fib-8 mb-fib-5 text-on-surface" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-fib-21 mb-fib-13 space-y-fib-3" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-fib-21 mb-fib-13 space-y-fib-3" {...props} />,
          li: ({ node, ...props }) => <li className="text-on-surface-variant" {...props} />,
          code: ({ node, ...props }) => (
            <code className="bg-surface-container px-fib-5 py-fib-2 font-mono text-[12px] text-primary border border-outline-variant/30" {...props} />
          ),
          pre: ({ node, ...props }) => (
            <pre className="bg-surface-container-low p-fib-13 border border-outline-variant/30 overflow-x-auto mb-fib-13 custom-scrollbar" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-primary/30 pl-fib-13 italic text-on-surface-variant mb-fib-13" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
