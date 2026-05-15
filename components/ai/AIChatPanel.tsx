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
    { role: 'assistant', content: 'Hi! I\'m your Smart Assistant. I can help you summarize emails, find information, or draft replies.' }
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
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error: any) {
      setChat(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, I encountered an error. Please check your connection and try again.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-surface-container-lowest">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-fib-13 lg:p-fib-21 space-y-fib-13 custom-scrollbar scroll-smooth" ref={(el) => {
        if (el) el.scrollTop = el.scrollHeight;
      }}>
        {chat.map((msg, i) => (
          <div key={i} className={`flex gap-fib-8 lg:gap-fib-13 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-fib-5 duration-500`}>
            <div className={`h-fib-21 lg:h-fib-34 w-fib-21 lg:w-fib-34 flex items-center justify-center shrink-0 border border-outline-variant shadow-sm ${msg.role === 'assistant' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}>
              {msg.role === 'assistant' ? <Sparkles className="h-fib-13 w-fib-13 lg:h-fib-18 lg:w-fib-18" /> : <User className="h-fib-13 w-fib-13 lg:h-fib-18 lg:w-fib-18" />}
            </div>
            <div className={`
              max-w-[85%] p-fib-13 lg:p-fib-21 border border-outline-variant tracking-tight shadow-sm transition-all
              ${msg.role === 'assistant' 
                ? 'bg-surface-container-low text-on-surface text-[13px] lg:text-[14px] leading-relaxed' 
                : 'bg-primary text-on-primary text-[10px] lg:text-[11px] font-mono font-bold uppercase tracking-widest'}
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
          <div className="flex gap-fib-8 lg:gap-fib-13 animate-pulse">
            <div className="h-fib-21 lg:h-fib-34 w-fib-21 lg:w-fib-34 bg-surface-container border border-outline-variant" />
            <div className="bg-surface-container-low border border-outline-variant p-fib-8 lg:p-fib-13 text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-outline">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-fib-13 lg:p-fib-21 border-t border-outline-variant bg-surface-container-lowest">
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
            placeholder={isLoading ? "THINKING..." : "ASK ME ANYTHING..."}
            className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:bg-surface rounded-none p-fib-13 lg:p-fib-21 pr-fib-55 lg:pr-fib-55 text-[11px] lg:text-[12px] font-mono min-h-[70px] lg:min-h-[80px] resize-none transition-all outline-none disabled:opacity-50 shadow-inner"
          />
          <button 
            type="submit" 
            disabled={isLoading || !prompt.trim()}
            className={`
              absolute bottom-fib-13 right-fib-13 lg:bottom-fib-21 lg:right-fib-21 p-fib-8 lg:p-fib-13 transition-all duration-300
              ${isLoading || !prompt.trim() ? 'bg-outline-variant text-on-surface/30 cursor-not-allowed' : 'bg-primary text-on-primary hover:bg-primary-container hover:text-primary shadow-lg'}
            `}
          >
            {isLoading ? <div className="h-fib-13 w-fib-13 lg:h-fib-18 lg:w-fib-18 border-2 border-on-primary border-t-transparent animate-spin" /> : <Send className="h-fib-13 w-fib-13 lg:h-fib-18 lg:w-fib-18" />}
          </button>
        </div>
        <p className="mt-fib-8 text-[8px] font-mono font-bold text-outline-variant uppercase tracking-[0.3em] text-center opacity-40">
          Your conversations are private and secure
        </p>
      </form>
    </div>
  );
}
