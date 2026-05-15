'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function ImapSignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    imapHost: '',
    imapPort: '993',
    smtpHost: '',
    smtpPort: '465',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Auto-guess hosts if not provided
    const domain = formData.email.split('@')[1];
    let submitData = { ...formData };
    
    if (!submitData.imapHost && domain) {
      submitData.imapHost = `imap.${domain}`;
    }
    if (!submitData.smtpHost && domain) {
      submitData.smtpHost = `smtp.${domain}`;
    }

    try {
      const res = await signIn('imap', {
        redirect: false,
        email: submitData.email,
        password: submitData.password,
        imapHost: submitData.imapHost,
        imapPort: submitData.imapPort,
        smtpHost: submitData.smtpHost,
        smtpPort: submitData.smtpPort,
      });

      if (res?.error) {
        setError(res.error);
      } else if (res?.ok) {
        router.push('/inbox');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md border border-outline-variant bg-surface-container-lowest p-8 md:p-12">
          
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-headline-sm text-on-surface mb-2 font-mono uppercase tracking-tight">Connect via IMAP</h1>
              <p className="text-body-md text-on-surface-variant">Enter your mail server credentials.</p>
            </div>
            <Link href="/" className="text-outline hover:text-on-surface transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 border border-error bg-error-container text-error text-body-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-label-caps text-on-surface mb-2">EMAIL ADDRESS</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-outline-variant text-body-md text-on-surface focus:outline-none focus:border-secondary transition-colors"
                placeholder="you@domain.com"
              />
            </div>

            <div>
              <label className="block text-label-caps text-on-surface mb-2">PASSWORD (OR APP PASSWORD)</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-outline-variant text-body-md text-on-surface focus:outline-none focus:border-secondary transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-label-caps text-outline hover:text-on-surface transition-colors flex items-center gap-2"
              >
                <span>{showAdvanced ? 'HIDE' : 'SHOW'} ADVANCED SETTINGS</span>
                <svg 
                  className={`w-4 h-4 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {showAdvanced && (
              <div className="space-y-4 pt-4 border-t border-outline-variant">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-label-caps text-on-surface mb-2">IMAP HOST</label>
                    <input
                      type="text"
                      value={formData.imapHost}
                      onChange={e => setFormData({ ...formData, imapHost: e.target.value })}
                      className="w-full px-4 py-3 bg-surface border border-outline-variant text-body-md text-on-surface focus:outline-none focus:border-secondary transition-colors"
                      placeholder="imap.domain.com"
                    />
                  </div>
                  <div>
                    <label className="block text-label-caps text-on-surface mb-2">PORT</label>
                    <input
                      type="text"
                      value={formData.imapPort}
                      onChange={e => setFormData({ ...formData, imapPort: e.target.value })}
                      className="w-full px-4 py-3 bg-surface border border-outline-variant text-body-md text-on-surface focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-label-caps text-on-surface mb-2">SMTP HOST</label>
                    <input
                      type="text"
                      value={formData.smtpHost}
                      onChange={e => setFormData({ ...formData, smtpHost: e.target.value })}
                      className="w-full px-4 py-3 bg-surface border border-outline-variant text-body-md text-on-surface focus:outline-none focus:border-secondary transition-colors"
                      placeholder="smtp.domain.com"
                    />
                  </div>
                  <div>
                    <label className="block text-label-caps text-on-surface mb-2">PORT</label>
                    <input
                      type="text"
                      value={formData.smtpPort}
                      onChange={e => setFormData({ ...formData, smtpPort: e.target.value })}
                      className="w-full px-4 py-3 bg-surface border border-outline-variant text-body-md text-on-surface focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
                className="py-4 font-mono tracking-wider"
              >
                {loading ? 'CONNECTING...' : 'CONNECT ACCOUNT'}
              </Button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
