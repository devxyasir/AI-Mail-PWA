'use client';

import React from 'react';
import { InboxItem } from './InboxItem';
import { Inbox as InboxIcon, Sparkles } from 'lucide-react';
import type { NormalizedEmailMessage } from '@/lib/email/types';

interface InboxListProps {
  messages: NormalizedEmailMessage[];
  isLoading?: boolean;
  selectedId?: string | null;
  onSelectMessage: (message: NormalizedEmailMessage) => void;
}

export function InboxList({ messages, isLoading, selectedId, onSelectMessage }: InboxListProps) {
  if (isLoading && messages.length === 0) {
    return (
      <div className="space-y-fib-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-fib-55 w-full bg-surface-container animate-pulse rounded-none" />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-fib-55 text-center">
        <div className="mb-fib-13">
          <InboxIcon className="h-fib-55 w-fib-55 text-outline-variant/30" />
        </div>
        <h3 className="text-xl font-serif font-bold text-on-surface uppercase tracking-tight mb-fib-5">Inbox Clear</h3>
        <p className="text-[10px] font-mono font-bold text-outline-variant max-w-xs uppercase tracking-widest">
          No messages found in this mailbox.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.filter(msg => msg && msg.id).map((msg) => (
        <InboxItem 
          key={msg.id} 
          message={msg} 
          onClick={() => onSelectMessage(msg)} 
          isSelected={selectedId === msg.id} 
        />
      ))}
    </div>
  );
}
