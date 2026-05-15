'use client';

import React from 'react';
import Image from 'next/image';
import { DocBlock, DocAnnotation } from '@/lib/docs/content';
import { Info, AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react';

export function DocRenderer({ blocks }: { blocks: DocBlock[] }) {
  return (
    <div className="space-y-fib-34">
      {blocks.map((block, i) => (
        <div key={i} className="animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
          {renderBlock(block)}
        </div>
      ))}
    </div>
  );
}

function renderBlock(block: DocBlock) {
  switch (block.type) {
    case 'text':
      return <p className="text-sm lg:text-base leading-relaxed text-on-surface/80 font-sans">{block.content}</p>;
    
    case 'heading':
      if (block.level === 1) return <h1 className="text-3xl lg:text-4xl font-serif font-bold text-primary mb-fib-21">{block.content}</h1>;
      if (block.level === 2) return <h2 className="text-xl lg:text-2xl font-serif font-bold text-primary border-b border-outline-variant/30 pb-fib-8 mt-fib-55 mb-fib-21">{block.content}</h2>;
      return <h3 className="text-base lg:text-lg font-mono font-bold uppercase tracking-widest text-secondary mt-fib-34 mb-fib-13">{block.content}</h3>;
    
    case 'image':
      return (
        <div className="my-fib-34">
          <div className="relative border border-outline-variant bg-surface-container-low overflow-hidden group">
            {/* Annotation Overlay System */}
            {block.annotations && block.annotations.map((ann, j) => (
              <AnnotationItem key={j} annotation={ann} />
            ))}
            
            <img 
              src={block.src} 
              alt={block.alt}
              className="w-full h-auto object-cover"
            />
          </div>
          {block.caption && (
            <p className="mt-fib-13 text-[11px] font-mono font-bold text-outline-variant uppercase text-center tracking-widest">
              {block.caption}
            </p>
          )}
        </div>
      );
    
    case 'list':
      const ListTag = block.ordered ? 'ol' : 'ul';
      return (
        <ListTag className={`space-y-fib-8 ${block.ordered ? 'list-decimal ml-fib-21' : 'list-none'}`}>
          {block.items.map((item, j) => (
            <li key={j} className="flex items-start gap-fib-13 text-sm lg:text-base text-on-surface/80">
              {!block.ordered && <div className="mt-2 h-fib-5 w-fib-5 bg-secondary shrink-0" />}
              <span>{item}</span>
            </li>
          ))}
        </ListTag>
      );
    
    case 'callout':
      const icons = {
        info: <Info className="h-fib-21 w-fib-21 text-primary" />,
        warning: <AlertTriangle className="h-fib-21 w-fib-21 text-error" />,
        tip: <Lightbulb className="h-fib-21 w-fib-21 text-secondary" />
      };
      const bgColors = {
        info: 'bg-surface-container-highest border-primary/20',
        warning: 'bg-error-container/10 border-error/20',
        tip: 'bg-secondary-container/10 border-secondary/20'
      };
      return (
        <div className={`flex gap-fib-21 p-fib-21 border ${bgColors[block.variant]}`}>
          <div className="shrink-0">{icons[block.variant]}</div>
          <div className="text-sm font-medium leading-relaxed">{block.content}</div>
        </div>
      );
    
    case 'steps':
      return (
        <div className="space-y-fib-21 border-l-2 border-outline-variant/20 ml-fib-8 pl-fib-21">
          {block.items.map((step, j) => (
            <div key={j} className="relative">
              <div className="absolute -left-[35px] top-0 flex items-center justify-center w-fib-21 h-fib-21 bg-surface-container-highest border border-outline-variant text-[10px] font-mono font-bold">
                {j + 1}
              </div>
              <h4 className="text-sm font-mono font-bold uppercase tracking-widest text-primary mb-fib-5">{step.title}</h4>
              <p className="text-[13px] text-on-surface/70 leading-relaxed">{step.content}</p>
            </div>
          ))}
        </div>
      );
    
    default:
      return null;
  }
}

function AnnotationItem({ annotation }: { annotation: DocAnnotation }) {
  const isDot = annotation.type === 'dot';
  const isBox = annotation.type === 'box';
  
  return (
    <div 
      className="absolute z-20 transition-all"
      style={{ 
        left: `${annotation.x}%`, 
        top: `${annotation.y}%`,
        width: isBox ? `${annotation.width}%` : 'auto',
        height: isBox ? `${annotation.height}%` : 'auto'
      }}
    >
      {isDot && (
        <div className="relative group/ann">
          <div className="h-fib-21 w-fib-21 bg-secondary text-on-secondary flex items-center justify-center rounded-full shadow-lg cursor-help animate-pulse">
            <Sparkles className="h-fib-13 w-fib-13" />
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-fib-8 bg-primary text-on-primary px-fib-13 py-fib-5 text-[9px] font-mono font-bold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover/ann:opacity-100 transition-opacity pointer-events-none z-30">
            {annotation.label}
          </div>
        </div>
      )}
      {isBox && (
        <div className="w-full h-full border-2 border-secondary border-dashed animate-pulse relative group/ann">
          <div className="absolute top-0 right-0 bg-secondary text-on-secondary px-fib-5 py-fib-2 text-[8px] font-mono font-bold uppercase tracking-widest opacity-0 group-hover/ann:opacity-100 transition-opacity">
            {annotation.label}
          </div>
        </div>
      )}
    </div>
  );
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}
