import { EmailProviderAdapter } from '../../lib/email/provider-adapter';
import type { 
  NormalizedEmailMessage, 
  EmailLabel, 
  ListOptions 
} from '../../lib/email/types';

/**
 * A mock adapter that returns pre-configured static data.
 */
export class MockEmailProvider implements EmailProviderAdapter {
  constructor(
    private messages: NormalizedEmailMessage[] = [],
    private labels: EmailLabel[] = []
  ) {}

  async listMessages(options?: ListOptions): Promise<NormalizedEmailMessage[]> {
    return this.messages;
  }

  async getMessage(id: string): Promise<NormalizedEmailMessage> {
    const msg = this.messages.find(m => m.id === id);
    if (!msg) throw new Error('Message not found');
    return msg;
  }

  async listLabels(): Promise<EmailLabel[]> {
    return this.labels;
  }

  async sendMessage(message: Partial<NormalizedEmailMessage>): Promise<void> {
    return;
  }

  async replyMessage(id: string, message: Partial<NormalizedEmailMessage>): Promise<void> {
    return;
  }

  async forwardMessage(id: string, message: Partial<NormalizedEmailMessage>): Promise<void> {
    return;
  }

  async archiveMessage(id: string): Promise<void> {
    return;
  }

  async deleteMessage(id: string): Promise<void> {
    return;
  }

  async searchMessages(query: string): Promise<NormalizedEmailMessage[]> {
    return this.messages.filter(m => 
      m.subject.includes(query) || m.body?.includes(query)
    );
  }

  async updateMessageLabels(id: string, add?: string[], remove?: string[]): Promise<void> {
    return;
  }

  async markAsRead(id: string, read: boolean): Promise<void> {
    return;
  }

  async markAsStarred(id: string, starred: boolean): Promise<void> {
    return;
  }
}
