'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Sparkles, User, Clock, ChevronRight } from 'lucide-react';
import { AIPriorityBadge, PriorityLabel } from '../ai/AIPriorityBadge';
import { NormalizedEmailMessage } from '@/lib/email/types';

interface InboxItemProps {
  message: NormalizedEmailMessage & { priority?: PriorityLabel; aiScore?: number };
  onClick: (id: string) => void;
  isSelected?: boolean;
}

export function InboxItem({ message, onClick, isSelected }: InboxItemProps) {
  const date = new Date(message.receivedAt);
  const timeStr = formatDistanceToNow(date, { addSuffix: true });

  return (
    <div 
      onClick={() => onClick(message.id)}
      className={`
        group relative flex flex-col gap-fib-8 p-fib-13 rounded-none border transition-all cursor-pointer
        ${isSelected 
          ? 'bg-surface-container-high border-primary' 
          : 'bg-surface border-outline-variant hover:border-outline'
        }
      `}
    >
      {/* Top row: Sender & Time */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-fib-8">
          <div className={`p-fib-5 ${isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'} transition-colors`}>
            <User className="h-fib-13 w-fib-13" />
          </div>
          <span className="text-[13px] font-mono font-bold tracking-tight text-on-surface truncate max-w-[200px] uppercase">
            {message.from.split('<')[0].trim() || message.from}
          </span>
        </div>
        <div className="flex items-center gap-fib-5 text-[10px] font-mono font-bold text-outline-variant uppercase tracking-widest">
          {timeStr}
        </div>
      </div>

      {/* Middle row: Subject & Snippet */}
      <div className="space-y-fib-2">
        <h4 className={`text-[16px] font-serif font-bold tracking-tight leading-tight ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
          {message.subject || '(No Subject)'}
        </h4>
        <p className="text-[13px] font-sans font-medium text-on-surface-variant line-clamp-2 leading-relaxed">
          {message.snippet}
        </p>
      </div>

      {/* Bottom row: Priority */}
      <div className="flex items-center justify-between mt-fib-2 pt-fib-8 border-t border-outline-variant/30">
        <div className="flex items-center gap-fib-8">
          <AIPriorityBadge label={message.priority} score={message.aiScore} />
        </div>

        <ChevronRight className={`h-fib-13 w-fib-13 transition-all ${isSelected ? 'text-primary' : 'text-outline-variant opacity-0 group-hover:opacity-100'}`} />
      </div>

      {/* Unread indicator */}
      {!message.isRead && !isSelected && (
        <div className="absolute top-fib-13 right-fib-13 h-fib-5 w-fib-5 bg-secondary" />
      )}
    </div>
  );
}
