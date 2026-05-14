# 03 — Email Provider Spec

## Goal

Define a unified adapter interface that all email providers implement, and a normalized
message type that all adapters return.

## NormalizedEmailMessage Type

```typescript
export type NormalizedEmailMessage = {
  id: string                         // Internal app ID
  accountId: string                  // Connected account ID
  provider: 'gmail' | 'microsoft' | 'imap'
  providerMessageId: string          // Raw ID from provider
  from: string                       // Sender email address
  to: string[]                       // Recipient email addresses
  cc?: string[]
  bcc?: string[]
  subject: string
  snippet: string                    // Short preview text (max 200 chars)
  body?: string                      // Full HTML or plain text body
  receivedAt: string                 // ISO 8601 timestamp
  labels: string[]                   // Provider label IDs
  isRead: boolean
  isArchived: boolean
  threadId?: string                  // For thread grouping
  attachments?: EmailAttachment[]
}

export type EmailAttachment = {
  id: string
  filename: string
  mimeType: string
  size: number
}

export type EmailLabel = {
  id: string
  name: string
  color?: string
}

export type EmailDraft = {
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  inReplyTo?: string
  references?: string[]
}
```

## EmailProviderAdapter Interface

```typescript
export interface EmailProviderAdapter {
  listMessages(options: ListOptions): Promise<NormalizedEmailMessage[]>
  getMessage(id: string): Promise<NormalizedEmailMessage>
  sendMessage(draft: EmailDraft): Promise<void>
  replyMessage(id: string, draft: EmailDraft): Promise<void>
  forwardMessage(id: string, draft: EmailDraft): Promise<void>
  archiveMessage(id: string): Promise<void>
  deleteMessage(id: string): Promise<void>
  searchMessages(query: string, options?: ListOptions): Promise<NormalizedEmailMessage[]>
  listLabels(): Promise<EmailLabel[]>
}

export type ListOptions = {
  limit?: number      // Default 20
  offset?: number
  labelId?: string
  after?: string      // ISO date filter
}
```

## Provider Implementation Notes

### Gmail
- Use Google Gmail API v1
- OAuth scopes: `gmail.readonly`, `gmail.send`, `gmail.modify`
- Map `message.labelIds` to `labels`
- Map `message.payload.headers` to from/to/subject
- Decode base64 body from `message.payload.body.data`

### Microsoft Graph
- Use Microsoft Graph API v1.0
- OAuth scopes: `Mail.Read`, `Mail.Send`, `Mail.ReadWrite`
- Map `message.from.emailAddress.address` to `from`
- Map `message.toRecipients[].emailAddress.address` to `to`
- Map `message.categories` to `labels`

### IMAP
- Use imapflow library
- Connect with user-provided host, port, username, password
- Parse headers with mailparser
- Map IMAP flags to `isRead`, `isArchived`

## Edge Cases

- Message with no body → return empty string for `body`
- Message with no snippet → truncate body to 200 chars
- Message with no labels → return empty array
- Provider API rate limit → throw `ProviderRateLimitError`
- Auth failure → throw `AuthError`

## Acceptance Criteria

- [ ] All three adapters implement `EmailProviderAdapter`
- [ ] All adapters return `NormalizedEmailMessage`
- [ ] Edge cases handled with defaults
- [ ] Mock adapters exist for tests
- [ ] Normalization unit tests pass