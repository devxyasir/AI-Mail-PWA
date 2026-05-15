'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface px-4">
      <div className="border border-outline-variant p-8 max-w-md w-full bg-surface-container-lowest">
        <h1 className="text-headline-md text-error mb-4">Authentication Error</h1>
        <p className="text-body-md text-on-surface-variant mb-6">
          {error === 'AccessDenied' 
            ? 'Access was denied. Please ensure your credentials are correct and you have authorized the application.'
            : error === 'Configuration'
            ? 'There is a configuration issue with the authentication provider.'
            : error 
            ? `An error occurred during authentication: ${error}`
            : 'An unknown authentication error occurred.'}
        </p>

        <div className="p-4 border border-error bg-error-container text-on-error-container text-sm font-mono mb-8">
          Check your server logs for more details. If you are the developer, ensure your SUPABASE_URL and SUPABASE_ANON_KEY environment variables are correctly configured.
        </div>

        <div className="flex gap-4">
          <Link 
            href="/auth/signin" 
            className="flex-1 text-center py-3 border border-outline-variant hover:border-secondary hover:text-secondary text-label-caps transition-colors"
          >
            TRY AGAIN
          </Link>
          <Link 
            href="/" 
            className="flex-1 text-center py-3 border border-outline-variant hover:bg-surface-container text-label-caps transition-colors"
          >
            GO HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
