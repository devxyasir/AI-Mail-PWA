import type { 
  NormalizedEmailMessage, 
  EmailLabel, 
  ListOptions 
} from './types';

/**
 * Interface that all email providers (Gmail, Microsoft, IMAP) must implement.
 */
export interface EmailProviderAdapter {
  /**
   * Fetches a list of messages.
   */
  listMessages(options?: ListOptions): Promise<NormalizedEmailMessage[]>;

  /**
   * Fetches a single message by its ID.
   */
  getMessage(id: string): Promise<NormalizedEmailMessage>;

  /**
   * Fetches all labels/folders for the account.
   */
  listLabels(): Promise<EmailLabel[]>;

  /**
   * Sends a new email or draft.
   */
  sendMessage(message: Partial<NormalizedEmailMessage>): Promise<void>;

  /**
   * Replies to a message.
   */
  replyMessage(id: string, message: Partial<NormalizedEmailMessage>): Promise<void>;

  /**
   * Forwards a message.
   */
  forwardMessage(id: string, message: Partial<NormalizedEmailMessage>): Promise<void>;

  /**
   * Archives a message.
   */
  archiveMessage(id: string): Promise<void>;

  /**
   * Moves a message to trash.
   */
  deleteMessage(id: string): Promise<void>;

  /**
   * Searches for messages.
   */
  searchMessages(query: string): Promise<NormalizedEmailMessage[]>;

  /**
   * Updates labels for a specific message.
   */
  updateMessageLabels(id: string, add?: string[], remove?: string[]): Promise<void>;

  /**
   * Marks a message as read/unread.
   */
  markAsRead(id: string, read: boolean): Promise<void>;

  /**
   * Stars/unstars a message.
   */
  markAsStarred(id: string, starred: boolean): Promise<void>;
}
