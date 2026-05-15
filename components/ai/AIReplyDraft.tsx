'use client';

import React, { useState } from 'react';
import { Sparkles, Copy, RefreshCw, Check, Send, X, Layers, Eye, Edit3 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Markdown } from '../ui/Markdown';

interface AIReplyDraftProps {
  messageId: string;
  accountId: string;
  onUse?: (content: string) => void;
}

export function AIReplyDraft({ messageId, accountId, onUse }: AIReplyDraftProps) {
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [context, setContext] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const generateDraft = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/reply-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, context })
      });
      const data = await res.json();
      if (data.draft) {
        setDraft(data.draft);
      }
    } catch (err) {
      console.error('[AI] Draft generation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-surface-container-low border border-outline-variant/30 p-fib-21 space-y-fib-21 animate-in">
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-fib-13">
        <div className="flex items-center gap-fib-13">
          <div className="p-fib-8 bg-primary text-on-primary">
            <Sparkles className="h-fib-13 w-fib-13" />
          </div>
          <div>
            <h3 className="text-[11px] font-mono font-bold tracking-[0.2em] text-on-surface uppercase">AI Reply Draft</h3>
            <p className="text-[9px] font-mono text-outline-variant uppercase tracking-widest">Smart suggestions based on this thread</p>
          </div>
        </div>
        {!draft && (
          <Button 
            variant="primary" 
            size="sm" 
            onClick={generateDraft}
            isLoading={isLoading}
            leftIcon={<Sparkles className="h-fib-13 w-fib-13" />}
          >
            GENERATE
          </Button>
        )}
      </div>

      {!draft && !isLoading && (
        <div className="space-y-fib-13">
          <div className="space-y-fib-5">
            <label className="text-[9px] font-mono font-bold text-outline-variant uppercase tracking-widest">Additional Instructions (Optional)</label>
            <textarea 
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g., 'Be polite but decline the request' or 'Ask for more details'..."
              className="w-full bg-surface-container border border-outline-variant p-fib-13 text-[11px] font-mono outline-none focus:border-primary transition-all resize-none min-h-[60px]"
            />
          </div>
          <p className="text-[10px] font-mono font-bold text-outline-variant/50 uppercase tracking-[0.3em] text-center italic">
            Analyze thread context to generate response
          </p>
        </div>
      )}

      {isLoading && (
        <div className="py-fib-34 flex flex-col items-center justify-center gap-fib-13 animate-pulse">
          <div className="h-fib-21 w-fib-21 border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-primary">Thinking...</span>
        </div>
      )}

      {draft && !isLoading && (
        <div className="space-y-fib-13 animate-in fade-in slide-in-from-top-fib-8">
          <div className="relative group">
            <div className="absolute top-0 right-0 p-fib-8 z-10 flex gap-fib-5">
              <button 
                onClick={() => setShowPreview(!showPreview)}
                className="p-fib-8 bg-surface border border-outline-variant hover:border-primary transition-all text-[10px] font-mono font-bold uppercase flex items-center gap-fib-5"
                title={showPreview ? "Switch to Edit" : "Switch to Preview"}
              >
                {showPreview ? <Edit3 className="h-fib-13 w-fib-13" /> : <Eye className="h-fib-13 w-fib-13" />}
                {showPreview ? "Edit" : "Preview"}
              </button>
              <button 
                onClick={copyToClipboard}
                className="p-fib-8 bg-surface border border-outline-variant hover:border-primary transition-all"
              >
                {copied ? <Check className="h-fib-13 w-fib-13 text-green-500" /> : <Copy className="h-fib-13 w-fib-13" />}
              </button>
              <button 
                onClick={() => setDraft('')}
                className="p-fib-8 bg-surface border border-outline-variant hover:border-error transition-all"
              >
                <RefreshCw className="h-fib-13 w-fib-13" />
              </button>
            </div>
            
            {showPreview ? (
              <div className="w-full min-h-[180px] bg-surface-container border border-outline-variant p-fib-21 pt-fib-55">
                <Markdown content={draft} />
              </div>
            ) : (
              <textarea 
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full min-h-[180px] bg-surface-container border border-outline-variant p-fib-21 pt-fib-55 text-[13px] font-sans leading-relaxed outline-none focus:border-primary transition-all resize-none"
              />
            )}
          </div>

          <div className="flex items-center gap-fib-13">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={generateDraft}
              leftIcon={<RefreshCw className="h-fib-13 w-fib-13" />}
              className="flex-1"
            >
              REGENERATE
            </Button>
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => onUse?.(draft)}
              leftIcon={<Layers className="h-fib-13 w-fib-13" />}
              className="flex-1"
            >
              USE THIS DRAFT
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
