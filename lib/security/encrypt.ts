import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const KEY = crypto.scryptSync(process.env.CREDENTIAL_ENCRYPTION_KEY || process.env.ENCRYPTION_SECRET || 'fallback-secret-for-dev-only-do-not-use-in-prod', 'salt', 32);

/**
 * Encrypts a string using AES-256-GCM.
 */
export function encrypt(text: string): string {
  if (typeof text !== 'string') {
    text = JSON.stringify(text);
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  // Return as IV:Tag:EncryptedData
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a string using AES-256-GCM.
 */
export function decrypt(encryptedData: any): string {
  if (typeof encryptedData !== 'string') {
    return String(encryptedData);
  }

  if (!encryptedData.includes(':')) {
    return encryptedData;
  }

  try {
    const [ivHex, tagHex, encrypted] = encryptedData.split(':');
    
    if (!ivHex || !tagHex || !encrypted) {
      return encryptedData;
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error: any) {
    if (error.message?.includes('bad decrypt') || error.message?.includes('Unsupported state')) {
      console.error('[Encryption] Decryption failed: Likely ENCRYPTION KEY MISMATCH. Your CREDENTIAL_ENCRYPTION_KEY may have changed.');
    } else {
      console.error('[Encryption] Decryption failed:', error.message);
    }
    return encryptedData;
  }
}

/**
 * Helper to encrypt an object.
 */
export function encryptObject(obj: any): string {
  return encrypt(JSON.stringify(obj));
}

/**
 * Helper to decrypt an object.
 */
export function decryptObject(encrypted: any): any {
  if (!encrypted) return null;
  
  // If it's already an object (and not a string), return it
  if (typeof encrypted === 'object' && !Array.isArray(encrypted)) {
    return encrypted;
  }

  // If it's a string, try to decrypt or parse
  if (typeof encrypted === 'string') {
    // 1. Try to decrypt it first
    const decrypted = decrypt(encrypted);
    
    // 2. Try to parse as JSON (whether it was decrypted or was just a raw JSON string)
    try {
      return JSON.parse(decrypted);
    } catch (e) {
      // 3. Not JSON, return as is
      return decrypted;
    }
  }

  return encrypted;
}
