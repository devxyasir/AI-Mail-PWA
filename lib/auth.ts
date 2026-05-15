import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import AzureADProvider from 'next-auth/providers/azure-ad';
import CredentialsProvider from 'next-auth/providers/credentials';
import { addOrUpdateAccount } from './db/client';
import { ImapFlow } from 'imapflow';
import { randomUUID } from 'crypto';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.labels',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || '',
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || '',
      tenantId: process.env.AZURE_AD_TENANT_ID || 'common',
      authorization: {
        params: {
          scope: 'openid profile email offline_access https://graph.microsoft.com/Mail.ReadWrite https://graph.microsoft.com/Mail.Send',
        },
      },
    }),
    CredentialsProvider({
      id: 'imap',
      name: 'IMAP',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        imapHost: { label: 'IMAP Host', type: 'text' },
        imapPort: { label: 'IMAP Port', type: 'text' },
        smtpHost: { label: 'SMTP Host', type: 'text' },
        smtpPort: { label: 'SMTP Port', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.imapHost || !credentials?.imapPort) {
          throw new Error('Missing required IMAP configuration');
        }

        // Test the IMAP connection
        const client = new ImapFlow({
          host: credentials.imapHost,
          port: parseInt(credentials.imapPort, 10) || 993,
          secure: true,
          auth: {
            user: credentials.email,
            pass: credentials.password
          },
          logger: false
        });

        try {
          await client.connect();
          await client.logout();
          
          // Generate a deterministic or random user ID for IMAP-only users
          // Normally we'd look up the user in a DB, but without one, we just use the email as a seed or randomUUID
          const userId = randomUUID();

          // Connection successful, persist credentials
          await addOrUpdateAccount({
            userId: userId,
            email: credentials.email,
            provider: 'imap',
            providerAccountId: credentials.email, // Use email as provider ID for IMAP
            credentials: {
              username: credentials.email,
              password: credentials.password,
              imapHost: credentials.imapHost,
              imapPort: parseInt(credentials.imapPort, 10) || 993,
              imapSecure: true,
              smtpHost: credentials.smtpHost || credentials.imapHost.replace('imap', 'smtp'),
              smtpPort: parseInt(credentials.smtpPort || '465', 10),
              smtpSecure: true,
            },
            name: credentials.email.split('@')[0],
          });

          return { id: userId, email: credentials.email, name: credentials.email.split('@')[0] };
        } catch (error: any) {
          console.error('[AUTH] IMAP verification failed:', error.message);
          throw new Error('Failed to connect to IMAP server. Please check your credentials.');
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account || !user.email) return false;

      // Persist OAuth tokens to our encrypted account storage
      try {
        if (account.provider === 'google' || account.provider === 'azure-ad') {
          await addOrUpdateAccount({
            userId: user.id,
            email: user.email,
            provider: account.provider === 'google' ? 'gmail' : 'microsoft',
            providerAccountId: account.providerAccountId,
            credentials: {
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              expiresAt: account.expires_at ? account.expires_at * 1000 : undefined,
            },
            name: user.name || user.email,
          });
        }
        return true;
      } catch (error) {
        console.error('[AUTH] Failed to persist account:', error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id; // eslint-disable-line @typescript-eslint/no-explicit-any
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};
