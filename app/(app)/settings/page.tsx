'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Settings, Shield, User, Bell, Plus, Mail, Trash2, Check, Sparkles, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SettingsPage() {
  const router = useRouter();
  const { data, isLoading } = useSWR('/api/accounts', fetcher);
  const accounts = data?.accounts || [];
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [aiPrefs, setAiPrefs] = useState({
    autoSummarize: true,
    smartPriority: true,
    dataPrivacy: true
  });

  const handleDeleteAccount = async (id: string) => {
    if (!confirm('Are you sure you want to disconnect this account? This will remove all indexed data for this account.')) return;
    
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        mutate('/api/accounts');
      } else {
        alert('Failed to delete account');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8 animate-in pb-24 lg:pb-8">
      <header className="space-y-2">
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-on-surface uppercase">Core Settings</h1>
        <p className="text-[10px] lg:text-xs font-bold text-outline-variant tracking-widest uppercase">Manage your intelligence dashboard preferences.</p>
      </header>

      <div className="grid gap-6">
        {/* Profile Section */}
        <section className="bg-surface-container-low border border-outline-variant/30 p-4 lg:p-6 rounded-none space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-black tracking-widest text-on-surface uppercase">Profile & Accounts</h2>
            </div>
            <button 
              onClick={() => router.push('/auth/signin')}
              className="flex items-center gap-2 px-fib-13 py-fib-5 bg-primary text-on-primary font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all"
            >
              <Plus className="h-3 w-3" />
              Add Account
            </button>
          </div>
          
          <div className="space-y-3">
            {isLoading ? (
              <div className="h-20 w-full bg-surface-container animate-pulse" />
            ) : accounts.length > 0 ? (
              accounts.map((acc: any) => (
                <div key={acc.id} className="flex items-center justify-between p-3 bg-surface border border-outline-variant/20 group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary flex items-center justify-center text-on-primary">
                      {acc.avatarUrl ? <img src={acc.avatarUrl} alt="" className="h-full w-full object-cover" /> : <Mail className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-[12px] font-mono font-bold text-on-surface uppercase">{acc.email}</p>
                      <p className="text-[9px] font-mono font-bold text-outline-variant uppercase tracking-widest">{acc.provider}</p>
                    </div>
                  </div>
                  <button 
                    disabled={isDeleting === acc.id}
                    onClick={() => handleDeleteAccount(acc.id)}
                    className="p-2 text-outline-variant hover:text-error transition-colors disabled:opacity-50"
                  >
                    {isDeleting === acc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              ))
            ) : (
              <div className="py-8 text-center border-2 border-dashed border-outline-variant/20">
                <p className="text-xs text-on-surface-variant font-mono uppercase tracking-widest opacity-60">No connected accounts found.</p>
              </div>
            )}
          </div>
        </section>

        {/* Intelligence Section */}
        <section className="bg-surface-container-low border border-outline-variant/30 p-4 lg:p-6 rounded-none space-y-6">
          <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-black tracking-widest text-on-surface uppercase">AI Intelligence & Privacy</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-black text-on-surface uppercase tracking-tight flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Auto-Summarization
                </p>
                <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-widest opacity-60">Synthesize emails as they arrive</p>
              </div>
              <button 
                onClick={() => setAiPrefs(p => ({ ...p, autoSummarize: !p.autoSummarize }))}
                className={`h-5 w-10 relative inline-flex items-center transition-colors ${aiPrefs.autoSummarize ? 'bg-primary' : 'bg-outline-variant'}`}
              >
                <span className={`h-4 w-4 bg-on-primary transition-transform ${aiPrefs.autoSummarize ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-black text-on-surface uppercase tracking-tight">Smart Priority Engine</p>
                <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-widest opacity-60">Neural classification of incoming stack</p>
              </div>
              <button 
                onClick={() => setAiPrefs(p => ({ ...p, smartPriority: !p.smartPriority }))}
                className={`h-5 w-10 relative inline-flex items-center transition-colors ${aiPrefs.smartPriority ? 'bg-primary' : 'bg-outline-variant'}`}
              >
                <span className={`h-4 w-4 bg-on-primary transition-transform ${aiPrefs.smartPriority ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="bg-surface-container-low border border-outline-variant/30 p-4 lg:p-6 rounded-none space-y-4">
          <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-4">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-black tracking-widest text-on-surface uppercase">Priority Alerts</h2>
          </div>
          <div className="space-y-4">
             <div className="flex items-center justify-between">
              <p className="text-[11px] font-black text-on-surface uppercase tracking-tight">Real-time Synchronization</p>
              <div className="flex items-center gap-2 text-primary font-mono text-[9px] uppercase tracking-[0.2em]">
                <Check className="h-3 w-3" />
                Active
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
