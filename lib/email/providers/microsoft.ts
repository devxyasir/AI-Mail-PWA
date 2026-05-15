import { EmailProviderAdapter } from '../provider-adapter';
import type { 
  NormalizedEmailMessage, 
  EmailLabel, 
  ListOptions,
  EmailAccount
} from '../types';
import { normalizeMicrosoftMessage } from '../normalization';

export class MicrosoftGraphProvider implements EmailProviderAdapter {
  private accountId: string;
  private accessToken: string;
  private refreshToken?: string;
  private clientId: string;
  private clientSecret: string;

  constructor(account: EmailAccount) {
    this.accountId = account.id;
    this.accessToken = account.credentials.accessToken;
    this.refreshToken = account.credentials.refreshToken;
    this.clientId = (process.env.AZURE_AD_CLIENT_ID || '').trim();
    this.clientSecret = (process.env.AZURE_AD_CLIENT_SECRET || '').trim();
  }

  private async graphFetch(path: string, options: RequestInit = {}) {
    const url = `https://graph.microsoft.com/v1.0/me${path}`;
    
    let res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (res.status === 401 && this.refreshToken) {
      await this.refreshAccessToken();
      res = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        }
      });
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(`Graph API error: ${res.status} ${JSON.stringify(error)}`);
    }

    if (res.status === 204) return null;
    return res.json();
  }

  private async refreshAccessToken() {
    if (!this.refreshToken || !this.clientId || !this.clientSecret) return;

    const res = await fetch(`https://login.microsoftonline.com/common/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token',
        scope: 'https://graph.microsoft.com/Mail.ReadWrite https://graph.microsoft.com/Mail.Send offline_access'
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
      });
    }
  }

  async listMessages(options?: ListOptions): Promise<NormalizedEmailMessage[]> {
    let path = '/messages';
    const params = new URLSearchParams();
    params.set('$top', (options?.maxResults || 20).toString());
    params.set('$select', 'id,subject,bodyPreview,from,toRecipients,receivedDateTime,isRead,flag,body,conversationId');
    params.set('$orderby', 'receivedDateTime desc');

    if (options?.labelId) {
      const wellKnownFolders: Record<string, string> = {
        'INBOX': 'inbox',
        'SENT': 'sentitems',
        'TRASH': 'deleteditems',
        'DRAFT': 'drafts',
        'ARCHIVE': 'archive',
        'SPAM': 'junkemail'
      };
      
      const folderId = wellKnownFolders[options.labelId.toUpperCase()] || options.labelId;
      path = `/mailFolders/${folderId}/messages`;
    }

    if (options?.query) {
      params.set('$search', `"${options.query}"`);
    }

    const data = await this.graphFetch(`${path}?${params.toString()}`);
    return (data.value || []).map(normalizeMicrosoftMessage);
  }

  async getMessage(id: string): Promise<NormalizedEmailMessage> {
    const data = await this.graphFetch(`/messages/${id}`);
    return normalizeMicrosoftMessage(data);
  }

  async listLabels(): Promise<EmailLabel[]> {
    const data = await this.graphFetch('/mailFolders');
    return (data.value || []).map((f: any) => ({
      id: f.id,
      name: f.displayName,
      type: 'user'
    }));
  }

  async sendMessage(message: Partial<NormalizedEmailMessage>): Promise<void> {
    await this.graphFetch('/sendMail', {
      method: 'POST',
      body: JSON.stringify({
        message: {
          subject: message.subject,
          body: {
            contentType: 'Text',
            content: message.body
          },
          toRecipients: message.to?.map(email => ({
            emailAddress: { address: email }
          }))
        }
      })
    });
  }

  async replyMessage(id: string, message: Partial<NormalizedEmailMessage>): Promise<void> {
    await this.graphFetch(`/messages/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({
        comment: message.body
      })
    });
  }

  async forwardMessage(id: string, message: Partial<NormalizedEmailMessage>): Promise<void> {
    await this.graphFetch(`/messages/${id}/forward`, {
      method: 'POST',
      body: JSON.stringify({
        comment: message.body,
        toRecipients: message.to?.map(email => ({
          emailAddress: { address: email }
        }))
      })
    });
  }

  async archiveMessage(id: string): Promise<void> {
    await this.graphFetch(`/messages/${id}/move`, {
      method: 'POST',
      body: JSON.stringify({ destinationId: 'archive' })
    });
  }

  async deleteMessage(id: string): Promise<void> {
    await this.graphFetch(`/messages/${id}`, { method: 'DELETE' });
  }

  async searchMessages(query: string): Promise<NormalizedEmailMessage[]> {
    return this.listMessages({ query });
  }

  async updateMessageLabels(id: string, add?: string[], remove?: string[]): Promise<void> {
    // Microsoft Graph uses folder moves instead of arbitrary labels.
    // We'll implement a simple move if 'add' contains a folder ID.
    if (add && add.length > 0) {
      await this.graphFetch(`/messages/${id}/move`, {
        method: 'POST',
        body: JSON.stringify({ destinationId: add[0] })
      });
    }
  }

  async markAsRead(id: string, read: boolean): Promise<void> {
    await this.graphFetch(`/messages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isRead: read })
    });
  }

  async markAsStarred(id: string, starred: boolean): Promise<void> {
    await this.graphFetch(`/messages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ flag: { flagStatus: starred ? 'flagged' : 'notFlagged' } })
    });
  }
}
