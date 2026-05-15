import { EmailProviderAdapter } from '../provider-adapter';
import type { 
  NormalizedEmailMessage, 
  EmailLabel, 
  ListOptions,
  EmailAccount
} from '../types';
import { normalizeGmailMessage } from '../normalization';

export class GmailProvider implements EmailProviderAdapter {
  private accountId: string;
  private accessToken: string;
  private refreshToken?: string;
  private clientId: string;
  private clientSecret: string;

  constructor(account: EmailAccount) {
    this.accountId = account.id;
    this.accessToken = account.credentials.accessToken;
    this.refreshToken = account.credentials.refreshToken;
    this.clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
    this.clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
  }

  private async gmailFetch(path: string, options: RequestInit = {}) {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me${path}`;
    
    if (!this.accessToken) {
      console.error('[Gmail] No access token available for request:', path);
    }

    let res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (res.status === 401) {
      if (this.refreshToken) {
        console.log('[Gmail] Access token expired, attempting refresh...');
        await this.refreshAccessToken();
        
        // Retry with new token
        res = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          }
        });
      } else {
        console.warn('[Gmail] 401 Unauthorized but no refresh token available.');
      }
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error(`[Gmail] API Error ${res.status}:`, error);
      throw new Error(`Gmail API error: ${res.status} ${JSON.stringify(error)}`);
    }

    if (res.status === 204) return null;
    return res.json();
  }

  private async refreshAccessToken() {
    try {
      if (!this.refreshToken) return;
      if (!this.clientId || !this.clientSecret) return;

      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }).toString()
      });

      const data = await res.json();
      
      if (data.access_token) {
        this.accessToken = data.access_token;
        if (data.refresh_token) this.refreshToken = data.refresh_token;

        const { updateAccountCredentials } = await import('@/lib/db/client');
        await updateAccountCredentials(this.accountId, {
          accessToken: this.accessToken,
          refreshToken: this.refreshToken,
          expiresAt: data.expires_in ? Date.now() + (data.expires_in * 1000) : undefined,
        });
      }
    } catch (err) {
      console.error('[Gmail] Error during token refresh:', err);
    }
  }

  async listMessages(options?: ListOptions): Promise<NormalizedEmailMessage[]> {
    const params = new URLSearchParams();
    params.set('maxResults', (options?.maxResults || 20).toString());
    if (options?.pageToken) params.set('pageToken', options.pageToken);
    
    if (options?.query) {
      let q = options.query;
      if (options?.labelId) {
        q = `${q} label:${options.labelId}`;
      }
      params.set('q', q);
    } else if (options?.labelId) {
      params.set('labelIds', options.labelId);
    } else {
      params.set('labelIds', 'INBOX');
    }

    if (options?.after) {
      const afterDate = new Date(options.after).getTime() / 1000;
      const currentQ = params.get('q') || '';
      params.set('q', `${currentQ} after:${Math.floor(afterDate)}`.trim());
    }

    const path = `/messages?${params.toString()}`;
    const data = await this.gmailFetch(path);

    if (!data.messages) return [];

    return Promise.all(data.messages.map((m: any) => this.getMessage(m.id)));
  }

  async getMessage(id: string): Promise<NormalizedEmailMessage> {
    const data = await this.gmailFetch(`/messages/${id}`);
    return normalizeGmailMessage(data);
  }

  async listLabels(): Promise<EmailLabel[]> {
    const data = await this.gmailFetch('/labels');
    return data.labels.map((l: any) => ({
      id: l.id,
      name: l.name,
      type: l.type === 'system' ? 'system' : 'user',
    }));
  }

  async sendMessage(message: Partial<NormalizedEmailMessage>): Promise<void> {
    const raw = Buffer.from(
      `To: ${message.to?.join(', ')}\r\n` +
      `Subject: ${message.subject}\r\n` +
      `Content-Type: text/plain; charset="UTF-8"\r\n\r\n` +
      `${message.body}`
    ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    await this.gmailFetch('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ raw })
    });
  }

  async replyMessage(id: string, message: Partial<NormalizedEmailMessage>): Promise<void> {
    const original = await this.getMessage(id);
    const raw = Buffer.from(
      `To: ${message.to?.join(', ')}\r\n` +
      `Subject: ${message.subject}\r\n` +
      `In-Reply-To: ${original.providerMessageId}\r\n` +
      `References: ${original.providerMessageId}\r\n` +
      `Content-Type: text/plain; charset="UTF-8"\r\n\r\n` +
      `${message.body}`
    ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    await this.gmailFetch('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ 
        raw,
        threadId: original.threadId
      })
    });
  }

  async forwardMessage(id: string, message: Partial<NormalizedEmailMessage>): Promise<void> {
    await this.sendMessage(message);
  }

  async archiveMessage(id: string): Promise<void> {
    await this.updateMessageLabels(id, [], ['INBOX']);
  }

  async deleteMessage(id: string): Promise<void> {
    await this.gmailFetch(`/messages/${id}/trash`, { method: 'POST' });
  }

  async searchMessages(query: string): Promise<NormalizedEmailMessage[]> {
    return this.listMessages({ query });
  }

  async updateMessageLabels(id: string, add?: string[], remove?: string[]): Promise<void> {
    await this.gmailFetch(`/messages/${id}/modify`, {
      method: 'POST',
      body: JSON.stringify({
        addLabelIds: add || [],
        removeLabelIds: remove || []
      })
    });
  }

  async markAsRead(id: string, read: boolean): Promise<void> {
    await this.updateMessageLabels(id, read ? [] : ['UNREAD'], read ? ['UNREAD'] : []);
  }

  async markAsStarred(id: string, starred: boolean): Promise<void> {
    await this.updateMessageLabels(id, starred ? ['STARRED'] : [], starred ? [] : ['STARRED']);
  }
}
