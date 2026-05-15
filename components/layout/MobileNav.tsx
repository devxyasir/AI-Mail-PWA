'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Mail, Sparkles, User, Settings, Search } from 'lucide-react';

export function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: 'Inbox', icon: Mail, path: '/inbox' },
    { label: 'AI', icon: Sparkles, path: '/ai' },
    { label: 'Search', icon: Search, path: '/search' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <nav className="lg:hidden flex items-center justify-around h-20 bg-surface border-t border-outline-variant px-4 pb-4 sticky bottom-0 z-40">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <button
            key={item.label}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-primary scale-110' : 'text-on-surface-variant opacity-100'}`}
          >
            <item.icon className={`h-6 w-6 ${isActive ? 'fill-primary/10' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
