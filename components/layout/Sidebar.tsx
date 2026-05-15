'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { AccountSwitcher } from './AccountSwitcher';
import { Sparkles } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLabel = searchParams?.get('labelId');
  const currentPriority = searchParams?.get('priority');

  const { data } = useSWR('/api/email/labels', fetcher);
  const labels = data?.labels || [];

  const handleLabelClick = (labelId: string) => {
    const params = new URLSearchParams();
    params.set('labelId', labelId);
    router.push(`/inbox?${params.toString()}`);
    onClose?.();
  };

  const handlePriorityClick = (priority: string) => {
    const params = new URLSearchParams();
    params.set('priority', priority);
    router.push(`/inbox?${params.toString()}`);
    onClose?.();
  };

  return (
    <nav className="flex h-full flex-col overflow-y-auto border-r border-outline-variant bg-surface" data-testid="sidebar">
      <div className="p-6">
        <AccountSwitcher onAccountSwitch={onClose} />
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-8">
        {/* Priority Filters */}
        <div>
          <p className="px-fib-13 mb-fib-8 text-[11px] font-mono font-bold tracking-[0.2em] text-outline-variant uppercase">Priority</p>
          <ul role="list" className="space-y-fib-1">
            <li>
              <button 
                onClick={() => handlePriorityClick('all')}
                className={`flex w-full items-center gap-fib-13 px-fib-13 py-fib-8 text-[12px] font-mono font-bold transition-all rounded-none ${currentPriority === 'all' ? 'bg-primary text-on-primary border-l-2 border-secondary' : 'text-on-surface hover:bg-surface-container'}`}
              >
                <Sparkles className={`h-4 w-4 ${currentPriority === 'all' ? 'text-on-primary' : 'text-primary'}`} />
                ALL PRIORITY
              </button>
            </li>
            <li>
              <button 
                onClick={() => handlePriorityClick('urgent')}
                className={`flex w-full items-center gap-fib-13 px-fib-13 py-fib-8 text-[12px] font-mono font-bold transition-all rounded-none ${currentPriority === 'urgent' ? 'bg-error text-on-error border-l-2 border-error' : 'text-on-surface hover:bg-surface-container'}`}
              >
                <div className="h-fib-8 w-fib-8 bg-error shadow-none" />
                URGENT
              </button>
            </li>
            <li>
              <button 
                onClick={() => handlePriorityClick('high')}
                className={`flex w-full items-center gap-fib-13 px-fib-13 py-fib-8 text-[12px] font-mono font-bold transition-all rounded-none ${currentPriority === 'high' ? 'bg-secondary text-on-secondary border-l-2 border-secondary' : 'text-on-surface hover:bg-surface-container'}`}
              >
                <div className="h-fib-8 w-fib-8 bg-secondary shadow-none" />
                HIGH
              </button>
            </li>
            <li>
              <button 
                onClick={() => handlePriorityClick('important')}
                className={`flex w-full items-center gap-fib-13 px-fib-13 py-fib-8 text-[12px] font-mono font-bold transition-all rounded-none ${currentPriority === 'important' ? 'bg-primary text-on-primary border-l-2 border-primary' : 'text-on-surface hover:bg-surface-container'}`}
              >
                <div className="h-fib-8 w-fib-8 bg-primary shadow-none" />
                IMPORTANT
              </button>
            </li>
            <li>
              <button 
                onClick={() => handlePriorityClick('direct')}
                className={`flex w-full items-center gap-fib-13 px-fib-13 py-fib-8 text-[12px] font-mono font-bold transition-all rounded-none ${currentPriority === 'direct' ? 'bg-surface-container-highest text-on-surface border-l-2 border-outline' : 'text-on-surface hover:bg-surface-container'}`}
              >
                <div className="h-fib-8 w-fib-8 bg-outline shadow-none" />
                DIRECT
              </button>
            </li>
            <li>
              <button 
                onClick={() => handlePriorityClick('digest')}
                className={`flex w-full items-center gap-fib-13 px-fib-13 py-fib-8 text-[12px] font-mono font-bold transition-all rounded-none ${currentPriority === 'digest' ? 'bg-tertiary text-on-tertiary border-l-2 border-secondary' : 'text-on-surface hover:bg-surface-container'}`}
              >
                <div className="h-fib-8 w-fib-8 bg-tertiary shadow-none" />
                DIGEST
              </button>
            </li>
            <li>
              <button 
                onClick={() => handlePriorityClick('receipt')}
                className={`flex w-full items-center gap-fib-13 px-fib-13 py-fib-8 text-[12px] font-mono font-bold transition-all rounded-none ${currentPriority === 'receipt' ? 'bg-outline text-on-primary border-l-2 border-secondary' : 'text-on-surface hover:bg-surface-container'}`}
              >
                <div className="h-fib-8 w-fib-8 bg-outline shadow-none" />
                RECEIPTS
              </button>
            </li>
            <li>
              <button 
                onClick={() => handlePriorityClick('social')}
                className={`flex w-full items-center gap-fib-13 px-fib-13 py-fib-8 text-[12px] font-mono font-bold transition-all rounded-none ${currentPriority === 'social' ? 'bg-secondary-container text-on-secondary-container border-l-2 border-secondary' : 'text-on-surface hover:bg-surface-container'}`}
              >
                <div className="h-fib-8 w-fib-8 bg-secondary-container shadow-none" />
                SOCIAL
              </button>
            </li>
            <li>
              <button 
                onClick={() => handlePriorityClick('low')}
                className={`flex w-full items-center gap-fib-13 px-fib-13 py-fib-8 text-[12px] font-mono font-bold transition-all rounded-none ${currentPriority === 'low' ? 'bg-outline-variant text-on-primary border-l-2 border-secondary' : 'text-on-surface hover:bg-surface-container'}`}
              >
                <div className="h-fib-8 w-fib-8 bg-outline-variant shadow-none" />
                LOW
              </button>
            </li>
          </ul>
        </div>

        {/* Mailboxes */}
        <div>
          <p className="px-fib-13 mb-fib-8 text-[11px] font-mono font-bold tracking-[0.2em] text-outline-variant uppercase">Mailboxes</p>
          <ul role="list" className="space-y-fib-1">
            {labels.map((label: any) => {
              const displayName = label.name.replace(/^CATEGORY_/, '');
              const isActive = currentLabel === label.id;
              const icon = getLabelIcon(label.id);
              
              return (
                <li key={label.id}>
                  <button 
                    onClick={() => handleLabelClick(label.id)}
                    className={`flex w-full items-center gap-fib-13 px-fib-13 py-fib-5 text-[12px] font-mono font-bold transition-all rounded-none group ${isActive ? 'bg-primary text-on-primary border-l-2 border-secondary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
                  >
                    <span className={`transition-all ${isActive ? 'text-on-primary' : 'text-outline-variant group-hover:text-on-surface'}`}>
                      {icon}
                    </span>
                    <span className="truncate tracking-tight uppercase">{displayName}</span>
                  </button>
                </li>
              );
            })}
            {labels.length === 0 && (
              <div className="px-fib-13 py-fib-13 space-y-fib-5">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-fib-34 w-full bg-surface-container animate-pulse rounded-none" />
                ))}
              </div>
            )}
          </ul>
        </div>
      </div>
 
      <div className="mt-auto p-fib-13 border-t border-outline-variant space-y-fib-2">
        <button 
          onClick={() => router.push('/settings')}
          className="flex w-full items-center gap-fib-13 px-fib-13 py-fib-8 text-[11px] font-mono font-bold tracking-widest text-outline-variant hover:text-primary hover:bg-surface-container rounded-none transition-all group"
        >
          <div className="group-hover:rotate-90 transition-transform duration-500">
            <SettingsIcon />
          </div>
          SETTINGS
        </button>
        <button 
          onClick={() => {
            import('next-auth/react').then(mod => mod.signOut());
          }}
          className="flex w-full items-center gap-fib-13 px-fib-13 py-fib-8 text-[11px] font-mono font-bold tracking-widest text-error hover:text-error hover:bg-error-container/10 rounded-none transition-all group"
        >
          <LogOutIcon />
          LOGOUT
        </button>
      </div>
    </nav>
  );
}

function getLabelIcon(labelId: string) {
  const id = labelId.toUpperCase();
  if (id.includes('INBOX')) return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-8 4-8-4" /></svg>;
  if (id.includes('SENT')) return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
  if (id.includes('TRASH')) return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
  if (id.includes('DRAFT')) return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
  if (id.includes('SPAM')) return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
  if (id.includes('STARRED')) return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
  
  return <div className="h-2 w-2 rounded-full bg-outline-variant group-hover:bg-primary transition-colors ml-1.5 mr-1.5" />;
}

function SettingsIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
