import { ImapFlow } from 'imapflow';
import nodemailer from 'nodemailer';
import { EmailProviderAdapter } from '../provider-adapter';
import type { 
  NormalizedEmailMessage, 
  EmailLabel, 
  ListOptions,
  EmailAccount
} from '../types';
import { normalizeImapMessage } from '../normalization';

export class ImapProvider implements EmailProviderAdapter {
  private config: any;
  private account: EmailAccount;

  constructor(account: EmailAccount) {
    this.account = account;
    this.config = {
      host: account.credentials.host,
      port: account.credentials.port || 993,
      secure: account.credentials.secure !== false,
      auth: {
        user: account.credentials.user || account.email,
        pass: account.credentials.password,
      },
      logger: false,
    };
  }

  private async getClient() {
    const client = new ImapFlow(this.config);
    await client.connect();
    return client;
  }

  async listMessages(options?: ListOptions): Promise<NormalizedEmailMessage[]> {
    const client = await this.getClient();
    const lock = await client.getMailboxLock(options?.labelId || 'INBOX');
    
    try {
      const messages: NormalizedEmailMessage[] = [];
      const generator = client.fetch({ seq: '1:50' }, {
        envelope: true,
        source: false,
        bodyStructure: true,
        flags: true,
        internalDate: true,
      });

      for await (const msg of generator) {
        messages.push(normalizeImapMessage(msg));
      }

      return messages.reverse();
    } finally {
      lock.release();
      await client.logout();
    }
  }

  async getMessage(id: string): Promise<NormalizedEmailMessage> {
    const client = await this.getClient();
    const lock = await client.getMailboxLock('INBOX');
    
    try {
      const msg = await client.fetchOne(id, {
        envelope: true,
        source: true,
        bodyStructure: true,
        flags: true,
      });

      if (!msg) throw new Error('Message not found');
      
      return normalizeImapMessage(msg);
    } finally {
      lock.release();
      await client.logout();
    }
  }

  async listLabels(): Promise<EmailLabel[]> {
    const client = await this.getClient();
    try {
      const folders = await client.list();
      return folders.map(f => ({
        id: f.path,
        name: f.name,
        type: f.specialUse ? 'system' : 'user'
      }));
    } finally {
      await client.logout();
    }
  }

  async sendMessage(message: Partial<NormalizedEmailMessage>): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: this.account.credentials.smtpHost || this.config.host.replace('imap', 'smtp'),
      port: this.account.credentials.smtpPort || 465,
      secure: true,
      auth: this.config.auth,
    });

    await transporter.sendMail({
      from: this.account.email,
      to: message.to?.join(', '),
      subject: message.subject,
      text: message.body,
    });
  }

  async replyMessage(id: string, message: Partial<NormalizedEmailMessage>): Promise<void> {
    await this.sendMessage(message);
  }

  async forwardMessage(id: string, message: Partial<NormalizedEmailMessage>): Promise<void> {
    await this.sendMessage(message);
  }

  async archiveMessage(id: string): Promise<void> {
    const client = await this.getClient();
    const lock = await client.getMailboxLock('INBOX');
    try {
      const folders = await client.list();
      const archiveFolder = folders.find(f => f.specialUse === '\\Archive' || f.name.toLowerCase() === 'archive');
      if (archiveFolder) {
        await client.messageMove(id, archiveFolder.path);
      }
    } finally {
      lock.release();
      await client.logout();
    }
  }

  async deleteMessage(id: string): Promise<void> {
    const client = await this.getClient();
    const lock = await client.getMailboxLock('INBOX');
    try {
      await client.messageDelete(id);
    } finally {
      lock.release();
      await client.logout();
    }
  }

  async searchMessages(query: string): Promise<NormalizedEmailMessage[]> {
    const client = await this.getClient();
    const lock = await client.getMailboxLock('INBOX');
    try {
      const uids = await client.search({ text: query });
      if (!uids) return [];
      
      const messages: NormalizedEmailMessage[] = [];
      for (const uid of uids) {
        const msg = await client.fetchOne(uid.toString(), {
          envelope: true,
          flags: true,
          internalDate: true
        });
        if (msg) messages.push(normalizeImapMessage(msg));
      }
      return messages;
    } finally {
      lock.release();
      await client.logout();
    }
  }

  async updateMessageLabels(id: string, add?: string[], remove?: string[]): Promise<void> {
    const client = await this.getClient();
    const lock = await client.getMailboxLock('INBOX');
    try {
      // IMAP uses moves for folders.
      if (add && add.length > 0) {
        await client.messageMove(id, add[0]);
      }
    } finally {
      lock.release();
      await client.logout();
    }
  }

  async markAsRead(id: string, read: boolean): Promise<void> {
    const client = await this.getClient();
    const lock = await client.getMailboxLock('INBOX');
    try {
      if (read) {
        await client.messageFlagsAdd(id, ['\\Seen']);
      } else {
        await client.messageFlagsRemove(id, ['\\Seen']);
      }
    } finally {
      lock.release();
      await client.logout();
    }
  }

  async markAsStarred(id: string, starred: boolean): Promise<void> {
    const client = await this.getClient();
    const lock = await client.getMailboxLock('INBOX');
    try {
      if (starred) {
        await client.messageFlagsAdd(id, ['\\Flagged']);
      } else {
        await client.messageFlagsRemove(id, ['\\Flagged']);
      }
    } finally {
      lock.release();
      await client.logout();
    }
  }
}
