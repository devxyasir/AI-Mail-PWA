'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import useSWRInfinite from 'swr/infinite';
import { Mail, Search, Filter, MessageSquare, Sparkles, X, Menu } from 'lucide-react';
import { InboxList } from '@/components/inbox/InboxList';
import { EmailDetail } from '@/components/inbox/EmailDetail';
import { AIChatPanel } from '@/components/ai/AIChatPanel';
import { ComposeModal } from '@/components/compose/ComposeModal';
import { NotificationToast } from '@/components/ui/NotificationToast';
import { useUI } from '@/lib/contexts/UIContext';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const PAGE_SIZE = 20;

export default function InboxPage() {
  const searchParams = useSearchParams();
  const labelId = searchParams?.get('labelId') || 'INBOX';
  const priority = searchParams?.get('priority');
  const query = searchParams?.get('q');
  const triggerAi = searchParams?.get('ai') === 'true';
  const triggerSearch = searchParams?.get('search') === 'true';

  const { toggleSidebar } = useUI();
  const [selected, setSelected] = useState<{ id: string; accountId: string } | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeInitial, setComposeInitial] = useState<{ to?: string; subject?: string; body?: string; accountId?: string }>({});

  // Handle mobile triggers from nav
  React.useEffect(() => {
    if (triggerAi) setIsChatOpen(true);
    if (triggerSearch) setIsSearchVisible(true);
  }, [triggerAi, triggerSearch]);

  const openCompose = (to = '', subject = '', body = '', accountId?: string) => {
    setComposeInitial({ to, subject, body, accountId });
    setIsComposeOpen(true);
  };

  const handleUseDraft = (content: string) => {
    // Determine subject for the reply
    const msg = messages.find(m => m.id === selected?.id);
    const subject = msg?.subject || '';
    const replySubject = subject.toLowerCase().startsWith('re:') ? subject : `Re: ${subject}`;
    const to = msg?.from || '';
    const accountId = msg?.accountId;

    openCompose(to, replySubject, content, accountId);
  };

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.messages.length) return null;

    const params = new URLSearchParams();
    params.set('labelId', labelId);
    if (priority) params.set('priority', priority);
    if (query) params.set('q', query);
    params.set('limit', PAGE_SIZE.toString());

    if (pageIndex > 0 && previousPageData?.nextPageToken) {
      params.set('pageToken', previousPageData.nextPageToken);
    }

    return `/api/email/list?${params.toString()}`;
  };

  const { data, size, setSize, isValidating, error } = useSWRInfinite(getKey, fetcher, {
    revalidateFirstPage: false,
    persistSize: true,
  });

  const messages = data ? data.flatMap((page) => page.messages || []) : [];
  const isLoadingInitialData = !data && !error;
  const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.messages?.length === 0;
  const isReachingEnd = isEmpty || (data && (data[data.length - 1]?.messages?.length || 0) < PAGE_SIZE);

  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [searchInput, setSearchInput] = useState(query || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (searchInput) {
      params.set('q', searchInput);
    } else {
      params.delete('q');
    }
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  const setPriority = (p: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (p) {
      params.set('priority', p);
    } else {
      params.delete('priority');
    }
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
    setIsFilterVisible(false);
  };

  const [notification, setNotification] = useState<{
    message: string;
    show: boolean;
    undoData?: { to: string; subject: string; body: string };
  }>({ message: '', show: false });

  const handleSent = (data: { to: string; subject: string; body: string }) => {
    setNotification({
      message: 'Message Sent Success',
      show: true,
      undoData: data
    });
  };

  const handleUndo = () => {
    if (notification.undoData) {
      openCompose(notification.undoData.to, notification.undoData.subject, notification.undoData.body);
    }
  };

  return (
    <div className="flex h-full flex-col bg-surface relative">
      <NotificationToast
        show={notification.show}
        message={notification.message}
        onUndo={notification.undoData ? handleUndo : undefined}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />

      {/* Header */}
      <header className="flex h-fib-55 items-center justify-between border-b border-outline-variant px-fib-13 lg:px-fib-21 bg-surface-container-lowest sticky top-0 z-20">
        <div className="flex items-center gap-fib-8 lg:gap-fib-13 overflow-hidden mr-2">
          <button 
            onClick={toggleSidebar}
            className="lg:hidden p-fib-8 text-on-surface-variant hover:bg-surface-container transition-colors shrink-0"
          >
            <Menu className="h-fib-21 w-fib-21" />
          </button>
          
          <div className="p-fib-5 bg-primary text-on-primary shrink-0 hidden sm:block">
            <Mail className="h-fib-18 lg:h-fib-21 w-fib-18 lg:h-fib-21" />
          </div>
          
          <div className="overflow-hidden min-w-0">
            <h1 className="text-sm lg:text-lg font-serif font-bold tracking-tight text-on-surface uppercase truncate">
              {priority ? priority : labelId.replace(/^CATEGORY_/, '')}
            </h1>
            <p className="text-[8px] lg:text-[9px] font-mono font-bold tracking-widest text-outline-variant uppercase truncate">
              {messages.length} Units in Stack
            </p>
          </div>
        </div>

        <div className="flex items-center gap-fib-2 lg:gap-fib-8 shrink-0">
          {/* Search Input (Conditional) */}
          {isSearchVisible && (
            <form 
              onSubmit={handleSearch} 
              className="absolute inset-x-0 top-0 h-full bg-surface-container-lowest z-30 px-fib-13 flex items-center gap-2 lg:relative lg:inset-auto lg:h-auto lg:bg-transparent lg:px-0 animate-in fade-in slide-in-from-top-fib-5 lg:animate-none"
            >
              <input
                autoFocus
                type="text"
                placeholder="SEARCH..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 bg-surface-container border border-outline-variant px-fib-8 lg:px-fib-13 py-fib-5 text-[10px] lg:text-[11px] font-mono font-bold focus:outline-none focus:border-primary lg:w-48 transition-all uppercase"
              />
              <button 
                type="button" 
                onClick={() => setIsSearchVisible(false)}
                className="p-fib-8 text-on-surface-variant lg:hidden"
              >
                <X className="h-fib-21 w-fib-21" />
              </button>
            </form>
          )}

          <button
            onClick={() => setIsSearchVisible(!isSearchVisible)}
            className={`p-fib-8 transition-colors ${isSearchVisible ? 'text-primary bg-surface-container' : 'text-on-surface-variant hover:bg-surface-container'}`}
          >
            <Search className="h-fib-18 lg:h-fib-21 w-fib-18 lg:h-fib-21" />
          </button>

          <div className="relative">
            <button
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              className={`p-fib-8 transition-colors ${isFilterVisible ? 'text-primary bg-surface-container' : 'text-on-surface-variant hover:bg-surface-container'}`}
            >
              <Filter className="h-fib-18 lg:h-fib-21 w-fib-18 lg:h-fib-21" />
            </button>

            {isFilterVisible && (
              <div className="absolute right-0 mt-fib-8 w-48 bg-surface border border-outline-variant shadow-lg z-50 animate-in fade-in zoom-in-95">
                <div className="p-fib-8 border-b border-outline-variant bg-surface-container-low">
                  <span className="text-[9px] font-mono font-bold text-outline-variant uppercase tracking-widest">Filter by Priority</span>
                </div>
                <button onClick={() => setPriority(null)} className="w-full text-left px-fib-13 py-fib-8 text-[11px] font-mono font-bold hover:bg-surface-container transition-colors uppercase">All Priority</button>
                <button onClick={() => setPriority('urgent')} className="w-full text-left px-fib-13 py-fib-8 text-[11px] font-mono font-bold hover:bg-surface-container transition-colors uppercase text-error">Urgent Only</button>
                <button onClick={() => setPriority('high')} className="w-full text-left px-fib-13 py-fib-8 text-[11px] font-mono font-bold hover:bg-surface-container transition-colors uppercase">High Priority</button>
                <button onClick={() => setPriority('medium')} className="w-full text-left px-fib-13 py-fib-8 text-[11px] font-mono font-bold hover:bg-surface-container transition-colors uppercase">Medium Priority</button>
                <button onClick={() => setPriority('low')} className="w-full text-left px-fib-13 py-fib-8 text-[11px] font-mono font-bold hover:bg-surface-container transition-colors uppercase opacity-60">Low Priority</button>
              </div>
            )}
          </div>

          <div className="h-fib-21 w-fib-1 bg-outline-variant/30 hidden sm:block" />
          <button
            onClick={() => openCompose('', '', '', messages[0]?.accountId)}
            className="flex items-center justify-center gap-2 px-fib-13 lg:px-fib-21 py-fib-8 bg-secondary text-on-secondary font-mono font-bold text-[10px] lg:text-[11px] uppercase tracking-widest hover:bg-secondary/90 transition-all whitespace-nowrap"
          >
            <span>Compose</span>
          </button>
        </div>
      </header>

      {/* Content Area - Split View */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* List Pane */}
        <main className={`
          overflow-y-auto custom-scrollbar border-r border-outline-variant transition-all duration-300
          ${selected ? 'hidden lg:block lg:w-[400px]' : 'flex-1'}
        `}>
          <div className="p-fib-8 lg:p-fib-13 space-y-fib-8 lg:space-y-fib-13">
            <InboxList
              messages={messages}
              isLoading={isLoadingInitialData}
              selectedId={selected?.id}
              onSelectMessage={(msg) => setSelected({ id: msg.id, accountId: msg.accountId })}
            />

            {!isReachingEnd && (
              <div className="flex justify-center py-fib-21 pb-fib-89 lg:pb-fib-21">
                <button
                  onClick={() => setSize(size + 1)}
                  disabled={isLoadingMore}
                  className="px-fib-21 py-fib-8 bg-surface-container text-on-surface font-mono font-bold text-[10px] uppercase tracking-widest border border-outline-variant hover:bg-primary hover:text-on-primary transition-all disabled:opacity-50"
                >
                  {isLoadingMore ? 'Syncing...' : 'Fetch More'}
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Detail Pane - Only shown when selected */}
        {selected && (
          <aside className="flex-1 overflow-hidden bg-surface-container-lowest animate-in fade-in slide-in-from-right-fib-21 duration-300 absolute inset-0 lg:relative z-10 lg:z-0">
            <EmailDetail
              messageId={selected.id}
              accountId={selected.accountId}
              onBack={() => setSelected(null)}
              onUseDraft={handleUseDraft}
            />
          </aside>
        )}
      </div>

      {/* Floating AI Assistant */}
      <div className="fixed bottom-0 right-0 lg:bottom-fib-21 lg:right-fib-21 z-50 flex flex-col items-end pointer-events-none">
        {isChatOpen && (
          <div className={`
            bg-surface border-x lg:border border-outline-variant shadow-2xl animate-in slide-in-from-bottom-fib-21 flex flex-col pointer-events-auto
            w-screen h-[calc(100vh-80px)] lg:w-[380px] lg:h-[500px]
          `}>
            <div className="p-fib-13 border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-fib-8 text-primary">
                <Sparkles className="h-fib-13 w-fib-13" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Smart Assistant</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-outline-variant hover:text-on-surface p-1">
                <X className="h-fib-21 w-fib-21 lg:h-fib-13 lg:w-fib-13" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AIChatPanel messageId={selected?.id} />
            </div>
          </div>
        )}
        <div className="p-fib-21 pointer-events-auto hidden lg:block">
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`
              h-fib-55 w-fib-55 flex items-center justify-center transition-all duration-300
              ${isChatOpen ? 'bg-primary text-on-primary' : 'bg-secondary text-on-secondary shadow-lg'}
            `}
          >
            {isChatOpen ? <MessageSquare className="h-fib-21 w-fib-21" /> : <Sparkles className="h-fib-21 w-fib-21" />}
          </button>
        </div>
      </div>

      {/* Compose Modal */}
      {isComposeOpen && (
        <ComposeModal
          onClose={() => setIsComposeOpen(false)}
          onSent={handleSent}
          initialTo={composeInitial.to}
          initialSubject={composeInitial.subject}
          initialBody={composeInitial.body}
          initialAccountId={composeInitial.accountId}
        />
      )}
    </div>
  );
}
