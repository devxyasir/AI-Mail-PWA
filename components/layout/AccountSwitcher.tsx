'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { User, ChevronDown, Check, Plus, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Spinner } from '../ui/Spinner';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function AccountSwitcher({ onAccountSwitch }: { onAccountSwitch?: () => void }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { data, error, isLoading } = useSWR('/api/accounts', fetcher);
  
  const accounts = data?.accounts || [];
  const currentAccount = accounts.find((a: any) => a.isCurrent) || accounts[0];

  if (isLoading) return <div className="h-14 w-full bg-surface-container animate-pulse rounded-2xl" />;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-fib-8 p-fib-5 pr-fib-13 bg-surface-container-high hover:bg-surface-container-highest transition-all rounded-none border border-outline-variant group shadow-none"
      >
        <div className="h-fib-34 w-fib-34 bg-primary flex items-center justify-center text-on-primary shadow-none">
          {currentAccount?.avatarUrl ? (
            <img src={currentAccount.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <User className="h-fib-13 w-fib-13" />
          )}
        </div>
        <div className="flex-1 text-left truncate">
          <p className="text-[12px] font-mono font-bold tracking-tight text-on-surface truncate uppercase">
            {currentAccount?.displayName || 'Personal Inbox'}
          </p>
          <p className="text-[10px] font-mono font-bold text-outline-variant truncate uppercase">
            {currentAccount?.email || 'Syncing...'}
          </p>
        </div>
        <ChevronDown className={`h-fib-8 w-fib-8 text-outline-variant transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
 
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-fib-5 z-50 bg-surface p-fib-5 rounded-none animate-in shadow-none border border-outline-variant">
          <div className="space-y-1">
            {accounts.map((acc: any) => (
              <button
                key={acc.id}
                onClick={() => {
                  setIsOpen(false);
                  onAccountSwitch?.();
                }}
                className="flex w-full items-center gap-fib-8 p-fib-8 hover:bg-surface-container transition-all group rounded-none"
              >
                <div className="h-fib-21 w-fib-21 bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <User className="h-fib-8 w-fib-8" />
                </div>
                <div className="flex-1 text-left truncate">
                  <p className="text-[11px] font-mono font-bold text-on-surface truncate uppercase">{acc.email}</p>
                </div>
                {acc.isCurrent && <Check className="h-fib-8 w-fib-8 text-primary" />}
              </button>
            ))}
            
            <div className="h-fib-1 bg-outline-variant/30 my-fib-5 mx-fib-5" />
            
            <button 
              onClick={() => {
                setIsOpen(false);
                router.push('/auth/signin');
              }}
              className="flex w-full items-center gap-fib-8 p-fib-8 hover:bg-surface-container transition-all text-primary rounded-none"
            >
              <Plus className="h-fib-8 w-fib-8" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Add Account</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
