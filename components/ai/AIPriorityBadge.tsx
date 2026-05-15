'use client';

import React from 'react';
import { Sparkles, AlertCircle, Bookmark, MessageSquare, Receipt, Newspaper, Share2, Info } from 'lucide-react';

export type PriorityLabel = 'urgent' | 'high' | 'important' | 'direct' | 'digest' | 'receipt' | 'social' | 'low';
export type PriorityCategory = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

interface AIPriorityBadgeProps {
  label?: PriorityLabel;
  score?: number;
  category?: PriorityCategory;
  className?: string;
}

export function AIPriorityBadge({ label = 'low', score, category, className = '' }: AIPriorityBadgeProps) {
  // Derive category from score if not provided
  const activeCategory = category || (score !== undefined ? (
    score >= 90 ? 'URGENT' : score >= 80 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW'
  ) : undefined);

  const config = getPriorityConfig(label, activeCategory);
  const Icon = config.icon;

  return (
    <div className={`
      inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-[0.1em] border shadow-sm transition-all
      ${config.bg} ${config.text} ${config.border} ${className}
    `}>
      <Icon className={`h-3 w-3 ${activeCategory === 'URGENT' ? 'animate-pulse' : ''}`} />
      <div className="flex items-center gap-1">
        <span className="font-mono">{activeCategory || label}</span>
        {activeCategory && activeCategory !== label.toUpperCase() && (
          <span className="opacity-60 text-[8px] border-l border-current pl-1">{label}</span>
        )}
      </div>
      {score !== undefined && (
        <span className="ml-1 opacity-50 font-bold border-l border-current pl-1">{score}</span>
      )}
    </div>
  );
}

function getPriorityConfig(label: PriorityLabel, category?: PriorityCategory) {
  // Primary styling based on category
  if (category === 'URGENT') {
    return { bg: 'bg-error', text: 'text-on-error', border: 'border-error-container', icon: AlertCircle };
  }
  if (category === 'HIGH') {
    return { bg: 'bg-secondary', text: 'text-on-secondary', border: 'border-secondary-container', icon: Bookmark };
  }
  if (category === 'MEDIUM') {
    // Use a lighter blue with better contrast for the dark theme
    return { bg: 'bg-primary/30', text: 'text-blue-300', border: 'border-primary/40', icon: MessageSquare };
  }

  // Fallback to label-based styling for LOW or unspecified
  switch (label) {
    case 'receipt':
      return { bg: 'bg-surface-container-high', text: 'text-green-300', border: 'border-outline-variant/30', icon: Receipt };
    case 'digest':
      return { bg: 'bg-surface-container-high', text: 'text-purple-300', border: 'border-outline-variant/30', icon: Newspaper };
    case 'social':
      return { bg: 'bg-surface-container-high', text: 'text-orange-300', border: 'border-outline-variant/30', icon: Share2 };
    default:
      return { bg: 'bg-surface-container', text: 'text-outline-variant', border: 'border-outline-variant/30', icon: Info };
  }
}
