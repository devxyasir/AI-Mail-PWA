import type { NormalizedEmailMessage } from './types';

/**
 * Normalizes a Gmail API message payload into our standard internal format.
 */
export function normalizeGmailMessage(data: any): NormalizedEmailMessage {
  const headers = data.payload.headers;
  const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  const subject = getHeader('subject');
  const from = getHeader('from');
  const to = getHeader('to').split(',').map((s: string) => s.trim());
  const date = getHeader('date');

  const getBody = (payload: any): string => {
    if (payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64').toString();
    }
    
    if (payload.parts) {
      // Prioritize HTML
      const htmlPart = payload.parts.find((p: any) => p.mimeType === 'text/html');
      if (htmlPart) return getBody(htmlPart);
      
      // Fallback to Plain Text
      const textPart = payload.parts.find((p: any) => p.mimeType === 'text/plain');
      if (textPart) return getBody(textPart);
      
      // Recurse into other parts (like multipart/alternative)
      for (const part of payload.parts) {
        const body = getBody(part);
        if (body) return body;
      }
    }
    
    return '';
  };

  const body = getBody(data.payload);

  return {
    id: data.id,
    providerMessageId: data.id,
    threadId: data.threadId,
    from,
    to,
    subject,
    snippet: data.snippet,
    body,
    receivedAt: new Date(date).toISOString(),
    isRead: !data.labelIds.includes('UNREAD'),
    isStarred: data.labelIds.includes('STARRED'),
    labels: data.labelIds,
  };
}

/**
 * Normalizes a Microsoft Graph API message payload.
 */
export function normalizeMicrosoftMessage(m: any): NormalizedEmailMessage {
  return {
    id: m.id,
    providerMessageId: m.id,
    threadId: m.conversationId,
    from: `${m.from?.emailAddress?.name || ''} <${m.from?.emailAddress?.address || ''}>`,
    to: (m.toRecipients || []).map((r: any) => r.emailAddress?.address),
    subject: m.subject,
    snippet: m.bodyPreview,
    body: m.body?.content || '',
    receivedAt: m.receivedDateTime,
    isRead: m.isRead,
    isStarred: m.flag?.flagStatus === 'flagged',
    labels: m.categories || [],
  };
}

/**
 * Normalizes an IMAP (imapflow) message payload.
 */
export function normalizeImapMessage(msg: any): NormalizedEmailMessage {
  const flags = Array.from(msg.flags || []);
  
  return {
    id: msg.uid.toString(),
    providerMessageId: msg.uid.toString(),
    threadId: msg.envelope.messageId,
    from: `${msg.envelope.from?.[0]?.name || ''} <${msg.envelope.from?.[0]?.address || ''}>`,
    to: (msg.envelope.to || []).map((r: any) => r.address),
    subject: msg.envelope.subject,
    snippet: '',
    body: '',
    receivedAt: msg.internalDate.toISOString(),
    isRead: flags.includes('\\Seen'),
    isStarred: flags.includes('\\Flagged'),
    labels: flags as string[],
  };
}
