'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DOC_ARTICLES, DOC_CATEGORIES } from '@/lib/docs/content';
import { ChevronRight, Book, ArrowLeft } from 'lucide-react';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-full bg-surface overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 lg:w-72 hidden md:flex flex-col border-r border-outline-variant bg-surface-container-low shrink-0 overflow-y-auto custom-scrollbar">
        <div className="p-fib-21 border-b border-outline-variant">
          <Link href="/inbox" className="flex items-center gap-fib-8 text-outline-variant hover:text-primary transition-colors mb-fib-13">
            <ArrowLeft className="h-fib-13 w-fib-13" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Back to App</span>
          </Link>
          <div className="flex items-center gap-fib-8">
            <Book className="h-fib-21 w-fib-21 text-primary" />
            <h1 className="text-sm font-mono font-bold uppercase tracking-widest">SmartMail Docs</h1>
          </div>
        </div>

        <nav className="flex-1 p-fib-13 space-y-fib-21">
          {DOC_CATEGORIES.map((cat) => (
            <div key={cat.id}>
              <h3 className="px-fib-8 mb-fib-8 text-[10px] font-mono font-bold text-outline-variant uppercase tracking-widest">
                {cat.title}
              </h3>
              <ul className="space-y-fib-2">
                {DOC_ARTICLES.filter(a => a.category === cat.id).map(art => {
                  const isActive = pathname === `/docs/${art.slug}` || (art.slug === 'introduction' && pathname === '/docs');
                  return (
                    <li key={art.id}>
                      <Link 
                        href={`/docs/${art.slug}`}
                        className={`
                          flex items-center justify-between px-fib-8 py-fib-5 text-[12px] font-medium transition-all
                          ${isActive 
                            ? 'bg-primary text-on-primary border-l-2 border-secondary' 
                            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}
                        `}
                      >
                        <span className="truncate">{art.title}</span>
                        {isActive && <ChevronRight className="h-fib-13 w-fib-13 text-secondary" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-fib-21 border-t border-outline-variant bg-surface-container">
          <p className="text-[9px] font-mono font-bold text-outline-variant uppercase">
            Protocol: documentation v1.0
          </p>
          <p className="text-[9px] font-mono font-bold text-outline-variant uppercase">
            State: Secure/Encrypted
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-surface relative overflow-y-auto custom-scrollbar">
        {/* Mobile Header (simplified) */}
        <div className="md:hidden flex items-center justify-between p-fib-13 border-b border-outline-variant bg-surface-container-low sticky top-0 z-10">
          <div className="flex items-center gap-fib-8">
            <Book className="h-fib-13 w-fib-13 text-primary" />
            <h2 className="text-[10px] font-mono font-bold uppercase tracking-widest">Docs Center</h2>
          </div>
          <Link href="/inbox" className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
            Exit
          </Link>
        </div>

        <div className="flex-1 w-full max-w-4xl mx-auto px-fib-21 py-fib-34 lg:px-fib-55 lg:py-fib-55">
          {children}
        </div>
      </main>
    </div>
  );
}
