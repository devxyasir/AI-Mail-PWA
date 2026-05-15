'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Paperclip, MoreHorizontal, User, Mail, Heading, Save, Layers } from 'lucide-react';
import { Button } from '../ui/Button';

interface ComposeModalProps {
  onClose: () => void;
  onSent?: (data: { to: string; subject: string; body: string }) => void;
  initialTo?: string;
  initialSubject?: string;
  initialBody?: string;
}

export function ComposeModal({ onClose, onSent, initialTo = '', initialSubject = '', initialBody = '' }: ComposeModalProps) {
  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [isSending, setIsSending] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  
  const lastSavedRef = useRef({ to, subject, body });

  // Auto-save draft
  useEffect(() => {
    const timer = setInterval(async () => {
      if (to === lastSavedRef.current.to && subject === lastSavedRef.current.subject && body === lastSavedRef.current.body) return;
      if (!to && !subject && !body) return;
      
      try {
        const res = await fetch('/api/email/drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: draftId || undefined,
            to_emails: to.split(',').map(e => e.trim()).filter(e => !!e),
            subject,
            body,
            type: 'new'
          })
        });
        const data = await res.json();
        if (data.draft?.id) setDraftId(data.draft.id);
        lastSavedRef.current = { to, subject, body };
      } catch (err) {
        console.error('[Draft] Auto-save failed:', err);
      }
    }, 10000); // 10s auto-save

    return () => clearInterval(timer);
  }, [to, subject, body, draftId]);

  const handleSend = async () => {
    if (!to || isSending) return;
    setIsSending(true);
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: to.split(',').map(e => e.trim()),
          subject,
          body
        })
      });
      
      if (res.ok) {
        if (draftId) {
          await fetch(`/api/email/drafts?id=${draftId}`, { method: 'DELETE' });
        }
        onSent?.({ to, subject, body });
        onClose();
      } else {
        throw new Error('Failed to transmit');
      }
    } catch (err) {
      console.error('[API] Send error:', err);
      alert('Transmission failure. Check terminal logs.');
    } finally {
      setIsSending(false);
    }
  };

  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [refineInput, setRefineInput] = useState('');

  const handleAIWrite = async (isRefinement = false) => {
    const currentPrompt = isRefinement ? refineInput : prompt;
    if (!currentPrompt.trim() || isDrafting) return;
    
    setIsDrafting(true);
    try {
      const res = await fetch('/api/ai/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subject, 
          prompt: currentPrompt.trim(),
          context: body,
          history: isRefinement ? history : []
        })
      });
      const data = await res.json();
      if (data.body) {
        setBody(data.body);
        if (data.subject) setSubject(data.subject);
        
        // Update history
        const newHistory: any = [...history, { role: 'user', content: currentPrompt.trim() }, { role: 'assistant', content: data.body }];
        setHistory(newHistory);
        
        setShowPrompt(false);
        setPrompt('');
        setRefineInput('');
      }
    } catch (err) {
      console.error('[AI] Neural drafting failed:', err);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSaveManual = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/email/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draftId || undefined,
          to_emails: to.split(',').map(e => e.trim()).filter(e => !!e),
          subject,
          body,
          type: 'new'
        })
      });
      const data = await res.json();
      if (data.draft?.id) setDraftId(data.draft.id);
      lastSavedRef.current = { to, subject, body };
    } catch (err) {
      console.error('[Draft] Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 bg-on-surface/70 backdrop-blur-sm animate-in">
      <div className="w-full max-w-2xl bg-surface shadow-none flex flex-col h-full sm:h-[85vh] overflow-hidden border border-outline-variant border-b-0 sm:border-b animate-in slide-in-from-bottom-fib-34">
        {/* Header */}
        <div className="flex items-center justify-between p-fib-13 border-b border-outline-variant bg-surface-container-low">
          <div className="flex items-center gap-fib-8">
            <div className="p-fib-5 bg-primary text-on-primary">
              <Mail className="h-fib-21 w-fib-21" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-widest text-on-surface uppercase">Comms Terminal / New</h2>
              <p className="text-[9px] font-mono font-bold text-outline-variant uppercase tracking-widest">Protocol: SMTP/Secure</p>
            </div>
          </div>
          <button onClick={onClose} className="p-fib-8 hover:bg-surface-container transition-all">
            <X className="h-fib-21 w-fib-21 text-outline-variant" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="flex-1 overflow-y-auto p-fib-21 space-y-fib-13 custom-scrollbar bg-surface-container-lowest">
          <div className="flex items-center gap-fib-13 group border-b border-outline-variant/30 pb-fib-8">
            <span className="text-[10px] font-mono font-bold text-outline-variant uppercase min-w-[60px]">To:</span>
            <input 
              type="text" 
              placeholder="recipient@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-on-surface placeholder:text-outline-variant/70 tracking-tight"
              spellCheck={false}
            />
          </div>
          
          <div className="flex items-center gap-fib-13 group border-b border-outline-variant/30 pb-fib-8">
            <span className="text-[10px] font-mono font-bold text-outline-variant uppercase min-w-[60px]">Subject:</span>
            <input 
              type="text" 
              placeholder="System Brief..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-on-surface placeholder:text-outline-variant/70 tracking-tight"
              spellCheck={false}
            />
          </div>

          <div className="relative mt-fib-21 flex-1 flex flex-col min-h-[300px]">
            <textarea 
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Begin transmission..."
              className="w-full flex-1 bg-transparent p-0 text-sm font-medium leading-relaxed text-on-surface outline-none transition-all resize-none border-none placeholder:text-outline-variant/60"
              spellCheck={false}
            />
            
            {showPrompt && (
              <div className="absolute inset-0 bg-surface/95 backdrop-blur-md z-30 flex flex-col p-fib-34 border border-primary/20 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between mb-fib-21">
                  <div className="flex items-center gap-fib-8">
                    <Sparkles className="h-fib-21 w-fib-21 text-primary" />
                    <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-on-surface">Neural Expansion Prompt</h3>
                  </div>
                  <button onClick={() => setShowPrompt(false)} className="p-fib-8 hover:bg-surface-container">
                    <X className="h-fib-21 w-fib-21 text-outline-variant" />
                  </button>
                </div>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the email you want to write... (e.g., 'Write a formal apology for missing the meeting')"
                  className="flex-1 bg-surface-container border border-outline-variant p-fib-21 text-sm font-sans outline-none focus:border-primary transition-all resize-none"
                  autoFocus
                />
                <div className="mt-fib-21 flex justify-end gap-fib-13">
                  <Button variant="outline" onClick={() => setShowPrompt(false)}>CANCEL</Button>
                  <Button 
                    variant="primary" 
                    onClick={handleAIWrite} 
                    isLoading={isDrafting}
                    leftIcon={<Layers className="h-fib-13 w-fib-13" />}
                  >
                    SYNTHESIZE CONTENT
                  </Button>
                </div>
              </div>
            )}

            {isDrafting && !showPrompt && (
              <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in z-20">
                <div className="h-fib-34 w-fib-34 border-2 border-primary border-t-transparent animate-spin mb-fib-13" />
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-primary">Neural backfill active...</p>
              </div>
            )}
          </div>

          {/* Mini Refinement Chat */}
          {history.length > 0 && !showPrompt && (
            <div className="mt-fib-13 p-fib-13 bg-surface-container-low border border-outline-variant/50 animate-in slide-in-from-bottom-fib-8">
              <div className="flex items-center gap-fib-8 mb-fib-8">
                <Sparkles className="h-fib-13 w-fib-13 text-secondary" />
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-outline-variant">Neural Refinement Active</span>
              </div>
              <div className="flex gap-fib-8">
                <input 
                  type="text" 
                  value={refineInput}
                  onChange={(e) => setRefineInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAIWrite(true)}
                  placeholder="Ask to modify (e.g., 'make it formal', 'shorter')..."
                  className="flex-1 bg-surface-container border border-outline-variant px-fib-13 py-fib-8 text-[11px] font-mono font-bold focus:outline-none focus:border-secondary transition-all"
                />
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => handleAIWrite(true)}
                  isLoading={isDrafting}
                  className="px-fib-13"
                >
                  REFINE
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-fib-13 border-t border-outline-variant bg-surface-container-low flex items-center justify-between">
          <div className="flex items-center gap-fib-8">
            <Button 
              variant="outline" 
              size="icon" 
              title="Save Draft"
              onClick={handleSaveManual}
              isLoading={isSaving}
              className="border-outline-variant/50"
            >
              <Save className="h-fib-21 w-fib-21" />
            </Button>
            <Button 
              variant="outline" 
              size="md" 
              onClick={() => setShowPrompt(true)}
              leftIcon={<Sparkles className="h-fib-13 w-fib-13" />}
              className="border-secondary/20 text-secondary hover:bg-secondary/5"
            >
              AI WRITE
            </Button>
          </div>

          <div className="flex items-center gap-fib-8">
            <div className="text-[9px] font-mono font-bold text-outline-variant uppercase mr-fib-13 hidden sm:block">
              {draftId ? 'Encrypted Sync Active' : 'Drafting...'}
            </div>
            <Button 
              onClick={handleSend}
              isLoading={isSending}
              rightIcon={<Send className="h-fib-13 w-fib-13" />}
              className="px-fib-34 py-fib-13"
            >
              TRANSMIT
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
