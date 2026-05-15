'use client';

import React from 'react';
import { Sparkles, RefreshCw, ChevronRight } from 'lucide-react';

interface AISummaryPanelProps {
  summary?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function AISummaryPanel({ summary, isLoading, onRefresh }: AISummaryPanelProps) {
  return (
    <div className="bg-primary-container/10 border border-primary/20 rounded-3xl p-6 relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-primary/10 blur-[60px] rounded-full group-hover:bg-primary/20 transition-all duration-700" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-xl">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-xs font-black tracking-[0.2em] text-primary uppercase">Neural Summary</h3>
        </div>
        <button 
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 text-primary/60 hover:text-primary transition-all disabled:opacity-30"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="relative z-10">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 w-full bg-primary/5 animate-pulse rounded-full" />
            <div className="h-4 w-[90%] bg-primary/5 animate-pulse rounded-full" />
            <div className="h-4 w-[75%] bg-primary/5 animate-pulse rounded-full" />
          </div>
        ) : (
          <p className="text-sm font-bold text-on-surface leading-relaxed tracking-tight">
            {summary || 'Select a message to generate an intelligence summary of the conversation.'}
          </p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-primary/10 flex items-center justify-between relative z-10">
        <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Powered by LongCat Intelligence</p>
        <ChevronRight className="h-4 w-4 text-primary/40 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
