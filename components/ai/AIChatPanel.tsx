'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, Send, Brain, Bot, User, Zap } from 'lucide-react';
import { Markdown } from '@/components/ui/Markdown';

interface AIChatPanelProps {
  messageId?: string | null;
}

export function AIChatPanel({ messageId }: AIChatPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([
    { role: 'assistant', content: 'Neural context ready. Select an email to analyze or ask me anything about your communications.' }
  ]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || isLoading) return;
    
    const userMessage = prompt.trim();
    setChat(prev => [...prev, { role: 'user', content: userMessage }]);
    setPrompt('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          history: chat.slice(1) // Skip the welcome message
        })
      });
      
      const data = await response.json();
      if (data.message) {
        setChat(prev => [...prev, { role: 'assistant', content: data.message }]);
      } else {
        throw new Error(data.error || 'Failed to connect to Neural Core');
      }
    } catch (error: any) {
      setChat(prev => [...prev, { 
        role: 'assistant', 
        content: `ERR: ${error.message}. Ensure system credentials are active.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-surface-container-lowest">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-fib-13 space-y-fib-13 custom-scrollbar" ref={(el) => el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })}>
        {chat.map((msg, i) => (
          <div key={i} className={`flex gap-fib-8 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-fib-5`}>
            <div className={`h-fib-21 w-fib-21 flex items-center justify-center shrink-0 border border-outline-variant ${msg.role === 'assistant' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}>
              {msg.role === 'assistant' ? <Sparkles className="h-fib-8 w-fib-8" /> : <User className="h-fib-8 w-fib-8" />}
            </div>
            <div className={`
              max-w-[85%] p-fib-13 border border-outline-variant tracking-tight
              ${msg.role === 'assistant' 
                ? 'bg-surface-container-low text-on-surface' 
                : 'bg-primary text-on-primary text-[11px] font-mono font-bold uppercase'}
            `}>
              {msg.role === 'assistant' ? (
                <Markdown content={msg.content} />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-fib-8 animate-pulse">
            <div className="h-fib-21 w-fib-21 bg-surface-container border border-outline-variant" />
            <div className="bg-surface-container-low border border-outline-variant p-fib-8 text-[9px] font-mono font-bold uppercase tracking-widest text-outline">
              Neural Processing...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-fib-13 border-t border-outline-variant bg-surface">
        <div className="relative group">
          <textarea 
            value={prompt}
            disabled={isLoading}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={isLoading ? "Syncing..." : "Neural prompt..."}
            className="w-full bg-surface-container-low text-on-surface placeholder:text-outline-variant border border-outline-variant focus:border-primary rounded-none p-fib-8 pr-fib-34 text-[11px] font-mono min-h-[60px] resize-none transition-all outline-none disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={isLoading || !prompt.trim()}
            className="absolute bottom-fib-8 right-fib-8 p-fib-5 bg-primary text-on-primary rounded-none hover:bg-primary/90 transition-all disabled:bg-outline-variant"
          >
            {isLoading ? <div className="h-fib-13 w-fib-13 border-2 border-on-primary border-t-transparent animate-spin" /> : <Send className="h-fib-13 w-fib-13" />}
          </button>
        </div>
      </form>
    </div>
  );
}
