/**
 * Authenticated app shell layout.
 *
 * Composes: Sidebar + MobileNav + children Outlet.
 * On desktop (>1024px): three-column layout (sidebar + list + detail).
 * On mobile (<768px): bottom navigation bar.
 */
'use client';

import React, { useState, type ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { useUI } from '@/lib/contexts/UIContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen } = useUI();

  // Initialize background sync on app mount (only if authenticated)
  React.useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/email/sync/start', { method: 'POST' }).catch(() => {});
    }
  }, [status]);

  // Protect the route
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-fib-13">
          <div className="h-fib-34 w-fib-34 border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-[10px] font-mono font-bold tracking-[0.3em] text-outline-variant uppercase">
            Verifying Core Session
          </p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="flex h-screen w-full bg-surface overflow-hidden">
      {/* Sidebar — visible on desktop, hidden on mobile */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 transform
          transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:block
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          role="button"
          tabIndex={-1}
          aria-label="Close sidebar"
        />
      )}

      {/* Main content area */}
      <div className="relative flex flex-1 flex-col min-w-0 overflow-hidden bg-surface">
        {children}
        
        {/* Mobile navigation — mobile only */}
        <MobileNav />
      </div>
    </div>
  );
}