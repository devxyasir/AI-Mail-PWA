/**
 * Factory that selects and instantiates the correct provider adapter
 * based on an account's provider discriminator.
 *
 * @module lib/email/providers/registry
 */

import type { EmailAccount, ProviderType } from '../types';
import type { EmailProviderAdapter } from '../provider-adapter';
import { GmailProvider } from './gmail';
import { MicrosoftGraphProvider } from './microsoft';
import { ImapProvider } from './imap';

/** Mapping from provider discriminator to adapter constructor. */
const providerMap: Record<
  ProviderType,
  (account: EmailAccount) => EmailProviderAdapter
> = {
  gmail: (account) => new GmailProvider(account),
  microsoft: (account) => new MicrosoftGraphProvider(account),
  imap: (account) => new ImapProvider(account),
};

/**
 * Create the correct provider adapter for a given connected account.
 *
 * @param account - A connected account row from Supabase
 *                  (with encrypted credentials already decrypted by the caller).
 * @returns A fully-initialised adapter ready for use.
 * @throws {Error} If the account's provider is unknown.
 */
export function createProvider(account: EmailAccount): EmailProviderAdapter {
  const factory = providerMap[account.provider];
  if (!factory) {
    throw new Error(`Unknown provider: "${account.provider}"`);
  }
  return factory(account);
}
