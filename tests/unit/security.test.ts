import { describe, it, expect, beforeAll } from 'vitest';
import { encrypt, decrypt, encryptObject, decryptObject } from '../../lib/security/encrypt';

describe('Encryption Security', () => {
  beforeAll(() => {
    process.env.CREDENTIAL_ENCRYPTION_KEY = 'v7K8p2N5m9R1Q4Z6L3X0Y2W5B8A1C4D7';
  });
  const testKey = 'v7K8p2N5m9R1Q4Z6L3X0Y2W5B8A1C4D7'; // 32 chars
  
  it('should encrypt and decrypt a string correctly', () => {
    const original = 'my-secret-password';
    const encrypted = encrypt(original);
    
    expect(encrypted).not.toBe(original);
    expect(encrypted).toContain(':'); // IV:AuthTag:Ciphertext
    
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(original);
  });

  it('should encrypt and decrypt an object correctly', () => {
    const original = {
      accessToken: 'token-123',
      refreshToken: 'refresh-456',
      expiry: 3600
    };
    
    const encrypted = encryptObject(original);
    expect(typeof encrypted).toBe('object');
    expect(encrypted.accessToken).not.toBe('token-123');
    
    const decrypted = decryptObject(encrypted);
    expect(decrypted).toEqual(original);
  });

  it('should throw error for malformed encrypted strings', () => {
    expect(() => decrypt('invalid-format')).toThrow();
    expect(() => decrypt('a:b:c')).toThrow(); // Invalid hex/data
  });
});
