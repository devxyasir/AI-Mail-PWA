import { describe, it, expect } from 'vitest';
import { 
  normalizeGmailMessage, 
  normalizeMicrosoftMessage, 
  normalizeImapMessage 
} from '@/lib/email/normalization';

describe('Email Normalization', () => {
  it('should normalize Gmail payload', () => {
    const mockGmail = {
      id: 'msg123',
      threadId: 'thread123',
      snippet: 'Hello world',
      labelIds: ['INBOX', 'UNREAD'],
      payload: {
        headers: [
          { name: 'Subject', value: 'Test Subject' },
          { name: 'From', value: 'sender@test.com' },
          { name: 'To', value: 'recipient@test.com' },
          { name: 'Date', value: 'Fri, 15 May 2026 12:00:00 +0000' }
        ],
        body: { data: Buffer.from('Email Body').toString('base64') }
      }
    };

    const normalized = normalizeGmailMessage(mockGmail);
    expect(normalized.id).toBe('msg123');
    expect(normalized.subject).toBe('Test Subject');
    expect(normalized.isRead).toBe(false);
    expect(normalized.body).toBe('Email Body');
  });

  it('should normalize Microsoft Graph payload', () => {
    const mockMS = {
      id: 'ms123',
      conversationId: 'conv123',
      subject: 'MS Subject',
      from: { emailAddress: { name: 'MS Sender', address: 'ms@test.com' } },
      toRecipients: [{ emailAddress: { address: 'to@test.com' } }],
      bodyPreview: 'MS Snippet',
      body: { content: 'MS Body' },
      receivedDateTime: '2026-05-15T12:00:00Z',
      isRead: true,
      flag: { flagStatus: 'flagged' }
    };

    const normalized = normalizeMicrosoftMessage(mockMS);
    expect(normalized.id).toBe('ms123');
    expect(normalized.subject).toBe('MS Subject');
    expect(normalized.isStarred).toBe(true);
    expect(normalized.from).toContain('MS Sender');
  });

  it('should normalize IMAP payload', () => {
    const mockImap = {
      uid: 456,
      envelope: {
        messageId: 'imap123',
        subject: 'Imap Subject',
        from: [{ name: 'Imap Sender', address: 'imap@test.com' }],
        to: [{ address: 'to@test.com' }]
      },
      flags: new Set(['\\Seen']),
      internalDate: new Date('2026-05-15T12:00:00Z')
    };

    const normalized = normalizeImapMessage(mockImap);
    expect(normalized.id).toBe('456');
    expect(normalized.subject).toBe('Imap Subject');
    expect(normalized.isRead).toBe(true);
  });
});
