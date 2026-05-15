'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export function AuthButtons() {
  return (
    <div className="space-y-4 w-full max-w-md">
      <Button
        variant="outline"
        fullWidth
        onClick={() => signIn('google', { callbackUrl: '/inbox' })}
        className="py-4 justify-start px-6 bg-surface hover:bg-surface-container transition-colors"
      >
        <img src="https://authjs.dev/img/providers/google.svg" alt="Google" className="h-6 w-6 mr-4" />
        <span>CONTINUE WITH GOOGLE</span>
      </Button>

      <Button
        variant="outline"
        fullWidth
        onClick={() => signIn('azure-ad', { callbackUrl: '/inbox' })}
        className="py-4 justify-start px-6 bg-surface hover:bg-surface-container transition-colors"
      >
        <img src="https://authjs.dev/img/providers/azure.svg" alt="Microsoft" className="h-6 w-6 mr-4" />
        <span>CONTINUE WITH MICROSOFT</span>
      </Button>

      <Link href="/auth/imap" className="block w-full">
        <Button
          variant="outline"
          fullWidth
          className="py-4 justify-start px-6 text-on-surface-variant hover:text-on-surface bg-surface hover:bg-surface-container transition-colors"
        >
          <svg className="h-6 w-6 mr-4 opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2" />
            <polyline points="3 7 12 13 21 7" strokeWidth="2" />
          </svg>
          <span>CONTINUE WITH IMAP</span>
        </Button>
      </Link>
    </div>
  );
}
