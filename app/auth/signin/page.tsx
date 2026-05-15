'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Mail, Shield, Globe, Lock, Cpu, Server, Layers, ChevronRight, LayoutDashboard } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SignInPage() {
  const router = useRouter();
  const { data } = useSWR('/api/accounts', fetcher);
  const accounts = data?.accounts || [];
  
  const [showImap, setShowImap] = useState(false);
  const [showMicrosoftWarning, setShowMicrosoftWarning] = useState(false);
  const [imapData, setImapData] = useState({
    email: '',
    password: '',
    imapHost: '',
    imapPort: '993',
    smtpHost: '',
    smtpPort: '465'
  });

  const handleImapLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn('imap', { ...imapData, callbackUrl: '/inbox' });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface overflow-hidden">
      {/* Left Side: Branding/Mission */}
      <div className="flex-1 bg-primary p-fib-34 md:p-fib-55 flex flex-col justify-between text-on-primary border-r border-outline-variant/20 relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[size:34px_34px]" />
        </div>

        <div className="relative z-10 space-y-fib-13">
          <div className="flex items-center gap-fib-13">
            <div className="w-fib-34 h-fib-34 bg-on-primary flex items-center justify-center text-primary">
              <Mail className="h-fib-21 w-fib-21" />
            </div>
            <span className="font-mono font-bold tracking-[0.4em] text-[12px] uppercase">Antigravity Core</span>
          </div>
          
          <div className="pt-fib-55">
            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-[1.1] tracking-tighter">
              INDUSTRIAL <br />
              INTELLIGENCE.
            </h1>
            <p className="mt-fib-21 max-w-md text-on-primary/60 font-mono text-[11px] leading-relaxed uppercase tracking-widest">
              Unified communication protocol for high-performance workflows. 
              Zero-latency synchronization. End-to-end neural encryption.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-fib-21 border-t border-on-primary/10 pt-fib-34">
          <div className="space-y-fib-5">
            <div className="flex items-center gap-fib-8 text-on-primary/80">
              <Lock className="h-fib-13 w-fib-13" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Encrypted</span>
            </div>
            <p className="text-[9px] text-on-primary/40 uppercase font-mono">AES-256 GCM Core</p>
          </div>
          <div className="space-y-fib-5">
            <div className="flex items-center gap-fib-8 text-on-primary/80">
              <Cpu className="h-fib-13 w-fib-13" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Neural</span>
            </div>
            <p className="text-[9px] text-on-primary/40 uppercase font-mono">Llama-3 Architecture</p>
          </div>
        </div>
      </div>

      {/* Right Side: Login Module */}
      <div className="w-full md:w-[450px] bg-surface flex flex-col p-fib-34 md:p-fib-55 animate-in relative">
        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-fib-55">
            <h2 className="text-2xl font-serif font-bold tracking-tight uppercase text-on-surface">Authentication</h2>
            <p className="text-[10px] font-mono font-bold text-outline-variant uppercase tracking-widest mt-fib-3">Select communication protocol</p>
          </div>

          {!showImap && !showMicrosoftWarning ? (
            <div className="space-y-fib-13">
              {accounts.length > 0 && (
                <div className="pb-fib-13 mb-fib-13 border-b border-outline-variant/20">
                  <Button 
                    onClick={() => router.push('/inbox')}
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="justify-between group h-fib-55 animate-in fade-in slide-in-from-top-fib-5"
                    leftIcon={<LayoutDashboard className="h-fib-13 w-fib-13" />}
                    rightIcon={<ChevronRight className="h-fib-13 w-fib-13" />}
                  >
                    GO TO DASHBOARD
                  </Button>
                </div>
              )}

              <Button 
                onClick={() => signIn('google', { callbackUrl: '/inbox' })}
                variant="outline"
                size="lg"
                fullWidth
                className="justify-between group h-fib-55"
                leftIcon={<Globe className="h-fib-13 w-fib-13 text-primary" />}
                rightIcon={<ChevronRight className="h-fib-13 w-fib-13 opacity-0 group-hover:opacity-100 transition-all" />}
              >
                Google Workspace
              </Button>

              <Button 
                onClick={() => setShowMicrosoftWarning(true)}
                variant="outline"
                size="lg"
                fullWidth
                className="justify-between group h-fib-55"
                leftIcon={<Layers className="h-fib-13 w-fib-13 text-primary" />}
                rightIcon={<ChevronRight className="h-fib-13 w-fib-13 opacity-0 group-hover:opacity-100 transition-all" />}
              >
                Office 365
              </Button>

              <Button 
                onClick={() => setShowImap(true)}
                variant="outline"
                size="lg"
                fullWidth
                className="justify-between group h-fib-55"
                leftIcon={<Server className="h-fib-13 w-fib-13 text-primary" />}
                rightIcon={<ChevronRight className="h-fib-13 w-fib-13 opacity-0 group-hover:opacity-100 transition-all" />}
              >
                IMAP Protocol
              </Button>
            </div>
          ) : showMicrosoftWarning ? (
            <div className="space-y-fib-21 animate-in slide-in-from-right-fib-13">
              <div className="p-fib-13 bg-error/5 border-l-2 border-error space-y-fib-13">
                <div className="flex items-center gap-fib-8 text-error">
                  <Shield className="h-fib-13 w-fib-13" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest">Protocol Limitation</span>
                </div>
                <p className="text-[11px] font-mono font-bold leading-relaxed text-on-surface/80 uppercase">
                  Due to current account limitations, we are unable to retrieve Microsoft OAuth details at this stage.
                </p>
                <p className="text-[10px] font-mono font-bold text-outline-variant uppercase tracking-tight">
                  Recommendation: Proceed with Google Workspace or IMAP Protocol for high-speed synchronization.
                </p>
              </div>

              <div className="flex flex-col gap-fib-8">
                <Button 
                  onClick={() => setShowMicrosoftWarning(false)}
                  variant="primary"
                  fullWidth
                  className="h-fib-55 font-mono text-[11px] font-bold tracking-widest uppercase"
                >
                  Skip & Return
                </Button>
                <div className="flex gap-fib-8">
                  <Button 
                    onClick={() => {
                      setShowMicrosoftWarning(false);
                      signIn('google', { callbackUrl: '/inbox' });
                    }}
                    variant="outline"
                    fullWidth
                    className="h-fib-34 font-mono text-[9px] font-bold uppercase tracking-widest"
                  >
                    Use Google
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowMicrosoftWarning(false);
                      setShowImap(true);
                    }}
                    variant="outline"
                    fullWidth
                    className="h-fib-34 font-mono text-[9px] font-bold uppercase tracking-widest"
                  >
                    Use IMAP
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleImapLogin} className="space-y-fib-13 animate-in">
              <div className="grid grid-cols-1 gap-fib-13">
                <div className="space-y-fib-5">
                  <label className="text-[9px] font-mono font-bold uppercase text-outline-variant">Email Endpoint</label>
                  <input 
                    type="email" 
                    required
                    className="w-full bg-surface-container-low border border-outline-variant p-fib-8 text-xs font-mono outline-none focus:border-primary transition-colors"
                    value={imapData.email}
                    onChange={(e) => setImapData({...imapData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-fib-5">
                  <label className="text-[9px] font-mono font-bold uppercase text-outline-variant">Secure Token</label>
                  <input 
                    type="password" 
                    required
                    className="w-full bg-surface-container-low border border-outline-variant p-fib-8 text-xs font-mono outline-none focus:border-primary transition-colors"
                    value={imapData.password}
                    onChange={(e) => setImapData({...imapData, password: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-fib-13">
                  <div className="space-y-fib-5">
                    <label className="text-[9px] font-mono font-bold uppercase text-outline-variant">IMAP Host</label>
                    <input 
                      type="text" 
                      placeholder="imap.server.com"
                      required
                      className="w-full bg-surface-container-low border border-outline-variant p-fib-8 text-xs font-mono outline-none focus:border-primary transition-colors"
                      value={imapData.imapHost}
                      onChange={(e) => setImapData({...imapData, imapHost: e.target.value})}
                    />
                  </div>
                  <div className="space-y-fib-5">
                    <label className="text-[9px] font-mono font-bold uppercase text-outline-variant">Port</label>
                    <input 
                      type="text" 
                      className="w-full bg-surface-container-low border border-outline-variant p-fib-8 text-xs font-mono outline-none focus:border-primary transition-colors"
                      value={imapData.imapPort}
                      onChange={(e) => setImapData({...imapData, imapPort: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-fib-13 flex gap-fib-8">
                <Button 
                  type="button"
                  variant="ghost" 
                  onClick={() => setShowImap(false)}
                  className="flex-1"
                >
                  BACK
                </Button>
                <Button 
                  type="submit"
                  variant="primary" 
                  className="flex-[2]"
                >
                  CONNECT
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="pt-fib-34 border-t border-outline-variant/20 mt-auto">
          <div className="flex items-center gap-fib-8 text-outline-variant">
            <Shield className="h-fib-13 w-fib-13" />
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Verified OAuth Connection Layer 7</span>
          </div>
        </div>
      </div>
    </div>
  );
}

