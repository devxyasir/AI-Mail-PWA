import React, { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { format } from 'date-fns';
import { User, Clock, Star, Reply, Forward, Trash2, MoreVertical, Paperclip, ChevronLeft, Sparkles, X } from 'lucide-react';
import { AIReplyDraft } from '../ai/AIReplyDraft';
import { Markdown } from '../ui/Markdown';
import { SafeHTML } from '../ui/SafeHTML';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function EmailDetail({ messageId, accountId, onBack, onUseDraft }: { messageId: string | null; accountId?: string; onBack?: () => void; onUseDraft?: (content: string) => void }) {
  const { data, error, isLoading } = useSWR(
    messageId ? `/api/email/${messageId}${accountId ? `?accountId=${accountId}` : ''}` : null, 
    fetcher
  );
  const message = data?.message;
  const [showReplyDraft, setShowReplyDraft] = useState(false);

  // Auto-summarize if missing
  useEffect(() => {
    if (messageId && accountId && message && !message.aiSummary) {
      const triggerSummary = async () => {
        try {
          await fetch('/api/ai/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId, accountId })
          });
          mutate(`/api/email/${messageId}${accountId ? `?accountId=${accountId}` : ''}`);
        } catch (e) {
          console.error('[AI] Auto-summarize failed:', e);
        }
      };
      triggerSummary();
    }
  }, [messageId, accountId, message]);

  if (!messageId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-fib-34 opacity-60 bg-surface">
        <div className="h-fib-55 w-fib-55 bg-surface-container flex items-center justify-center mb-fib-13">
          <ChevronLeft className="h-fib-34 w-fib-34 text-outline-variant/60" />
        </div>
        <h3 className="text-xl font-serif font-bold uppercase tracking-tight mb-fib-5 text-on-surface">No Message Selected</h3>
        <p className="text-[10px] font-mono font-bold uppercase tracking-widest max-w-[200px]">Select a message from the list to view its contents.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-surface">
        <div className="h-fib-34 w-fib-34 animate-spin border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface animate-in">
      {/* Detail Header */}
      <div className="sticky top-0 z-20 bg-surface border-b border-outline-variant px-fib-21 py-fib-13 flex items-center justify-between">
        <div className="flex items-center gap-fib-5">
          {onBack && (
            <button onClick={onBack} className="p-fib-8 hover:bg-surface-container rounded-none lg:hidden">
              <ChevronLeft className="h-fib-21 w-fib-21" />
            </button>
          )}
          <div className="flex items-center gap-fib-5">
            <button className="p-fib-8 text-outline-variant hover:text-primary transition-colors hover:bg-surface-container rounded-none">
              <Star className={`h-fib-13 w-fib-13 ${message.isStarred ? 'fill-primary text-primary' : ''}`} />
            </button>
            <button className="p-fib-8 text-outline-variant hover:text-error transition-colors hover:bg-error/5 rounded-none">
              <Trash2 className="h-fib-13 w-fib-13" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-fib-8">
          <button 
            onClick={() => setShowReplyDraft(!showReplyDraft)}
            className="flex items-center gap-fib-8 px-fib-21 py-fib-8 bg-surface-container text-on-surface hover:bg-primary hover:text-on-primary rounded-none font-mono font-bold text-[10px] uppercase tracking-widest transition-all"
          >
            <Reply className="h-fib-13 w-fib-13" />
            REPLY
          </button>
          <button onClick={onBack} className="p-fib-8 text-outline-variant hover:text-primary transition-colors hover:bg-surface-container rounded-none">
            <X className="h-fib-13 w-fib-13" />
          </button>
          <button className="p-fib-8 text-outline-variant hover:bg-surface-container rounded-none">
            <MoreVertical className="h-fib-13 w-fib-13" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto p-fib-21 sm:p-fib-34 lg:p-fib-55 space-y-fib-34 pb-fib-89">
          {/* Metadata & Summary */}
          <section className="space-y-fib-8">
            <div className="flex items-center gap-fib-8">
              <div className="px-fib-8 py-fib-2 bg-secondary text-on-secondary font-mono text-[9px] uppercase tracking-widest">
                {message.priority || 'NORMAL'}
              </div>
              <div className="h-fib-1 flex-1 bg-outline-variant/20" />
            </div>
            {message.aiSummary ? (
              <div className="p-fib-13 bg-surface-container-low border border-outline-variant/30 text-on-surface-variant">
                <span className="font-mono text-[10px] font-bold text-primary block mb-fib-5 uppercase tracking-widest flex items-center gap-fib-5">
                  <Sparkles className="h-fib-8 w-fib-8" />
                  AI Summary
                </span>
                <Markdown content={message.aiSummary} />
              </div>
            ) : (
              <div className="p-fib-13 border border-outline-variant/30 flex items-center gap-fib-13 animate-pulse">
                <div className="h-fib-8 w-fib-8 border-2 border-primary border-t-transparent animate-spin" />
                <span className="text-[9px] font-mono font-bold text-outline-variant uppercase tracking-[0.2em]">Thinking...</span>
              </div>
            )}
          </section>

          {/* Email Content */}
          <article className="space-y-fib-21">
            <header className="space-y-fib-13">
              <h1 className="text-3xl font-serif font-bold tracking-tight text-on-surface leading-tight">
                {message.subject || '(No Subject)'}
              </h1>
              
              <div className="flex items-center justify-between p-fib-13 bg-surface-container-low border border-outline-variant/30 rounded-none">
                <div className="flex items-center gap-fib-13">
                  <div className="h-fib-34 w-fib-34 bg-primary flex items-center justify-center text-on-primary">
                    <User className="h-fib-21 w-fib-21" />
                  </div>
                  <div>
                    <p className="text-[12px] font-mono font-bold text-on-surface uppercase tracking-tight">{message.from.split('<')[0].trim() || 'Sender'}</p>
                    <p className="text-[10px] font-mono font-bold text-outline-variant truncate">{message.from}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-mono font-bold text-outline-variant uppercase tracking-[0.2em] mb-fib-2">Date</p>
                  <p className="text-[11px] font-mono font-bold text-on-surface">{format(new Date(message.receivedAt), 'MMM d, HH:mm')}</p>
                </div>
              </div>
            </header>

            <div className="text-[15px] font-sans text-on-surface-variant leading-relaxed">
              {((message.body || '').includes('<') && (message.body || '').includes('>')) ? (
                <SafeHTML html={message.body || message.snippet} />
              ) : (
                <div className="whitespace-pre-wrap px-fib-21 font-sans">
                  <Markdown content={message.body || message.snippet} />
                </div>
              )}
            </div>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="pt-fib-21 border-t border-outline-variant/30">
                <h5 className="text-[10px] font-mono font-bold text-outline uppercase tracking-widest mb-fib-8 flex items-center gap-fib-5">
                  <Paperclip className="h-fib-13 w-fib-13" />
                  Attachments ({message.attachments.length})
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-fib-8">
                  {message.attachments.map((att: any) => (
                    <div key={att.id} className="flex items-center justify-between p-fib-8 bg-surface-container border border-outline-variant/20 hover:border-outline transition-colors group cursor-pointer">
                      <div className="flex items-center gap-fib-8 overflow-hidden">
                        <div className="h-fib-21 w-fib-21 bg-surface-container-highest flex items-center justify-center text-outline group-hover:text-primary transition-colors">
                          <Paperclip className="h-fib-8 w-fib-8" />
                        </div>
                        <span className="text-[11px] font-mono font-bold truncate uppercase tracking-tight">{att.filename}</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-outline-variant">{(att.size / 1024).toFixed(0)}KB</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* AI Drafting Section */}
          <section className="pt-fib-34 border-t border-outline-variant/30 space-y-fib-21">
            <div className="flex items-center gap-fib-8">
              <h3 className="text-[11px] font-mono font-bold text-primary uppercase tracking-[0.3em]">AI Reply Helper</h3>
              <div className="h-fib-1 flex-1 bg-outline-variant/20" />
            </div>
            
            <AIReplyDraft 
              messageId={messageId} 
              accountId={accountId || ''} 
              onUse={onUseDraft}
            />
          </section>
        </div>
      </div>
    </div>
  );
}

