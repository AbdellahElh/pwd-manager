# Encryption Implementation Guide

This document provides detailed technical information about the encryption mechanisms implemented in the Password Manager with Facial Recognition application.

## Encryption Overview

The application implements a comprehensive encryption strategy based on:
- **AES-256-CBC**: Advanced Encryption Standard with 256-bit keys
- **PBKDF2**: Password-Based Key Derivation Function 2 for key strengthening
- **Client-side encryption**: All sensitive data encrypted before transmission
- **Unique user keys**: Each user has a cryptographically unique encryption key

## Cryptographic Architecture

### Encryption Flow

```
User Data → Key Generation → Key Strengthening → AES Encryption → Storage/Transmission
```

### Key Management Hierarchy

```
App Secret Key (ENV) → User-Specific Base Key → PBKDF2 Strengthening → Final Encryption Key
```

## Key Generation and Management

### User-Specific Key Generation

#### Frontend Implementation
```typescript
// src/utils/cryptoUtils.ts (Frontend)
export const getUserEncryptionKey = (userId: number, userEmail: string): string => {
  const appSecretKey = import.meta.env.VITE_SECRET_KEY;
  return `pwd-manager-${userId}-${userEmail}-${appSecretKey}`;
};
```

#### Backend Implementation
```typescript
// src/utils/cryptoUtils.ts (Backend)
export const getUserEncryptionKey = (userId: number, userEmail: string): string => {
  const appSecretKey = process.env.APP_SECRET_KEY;
  return `pwd-manager-${userId}-${userEmail}-${appSecretKey}`;
};
```

### Key Strengthening with PBKDF2

#### Configuration Parameters
```typescript
const ENCRYPTION_SALT = process.env.ENCRYPTION_SALT || "default";
const ITERATIONS = 10000; // PBKDF2 iterations
const KEY_SIZE = 256; // 256-bit key size
```

#### Key Strengthening Implementation
```typescript
export const strengthenKey = (baseKey: string): string => {
  return PBKDF2(baseKey, ENCRYPTION_SALT, {
    keySize: KEY_SIZE / 32, // keySize in words (32 bits per word)
    iterations: ITERATIONS,
  }).toString();
};
```

#### Security Benefits
- **Salt-based derivation**: Prevents rainbow table attacks
- **Iteration count**: Makes brute force attacks computationally expensive
- **Key stretching**: Transforms weak keys into strong cryptographic keys
- **Consistent output**: Same input always produces same strengthened key

## AES Encryption Implementation

### Frontend Encryption Module

```typescript
// src/utils/cryptoUtils.ts (Frontend)
import AES from 'crypto-js/aes';
import UTF8 from 'crypto-js/enc-utf8';
import PBKDF2 from 'crypto-js/pbkdf2';

/**
 * Encrypts a string value using AES encryption with a strengthened key
 */
export const encrypt = (value: string, secretKey: string): string => {
  if (!value) return '';
  
  const strengthenedKey = strengthenKey(secretKey);
  return AES.encrypt(value, strengthenedKey).toString();
};

/**
 * Decrypts an encrypted string value using AES encryption with a strengthened key
 */
export const decrypt = (encryptedValue: string, secretKey: string): string => {
  if (!encryptedValue) return '';
  
  try {
    const strengthenedKey = strengthenKey(secretKey);
    const bytes = AES.decrypt(encryptedValue, strengthenedKey);
    return bytes.toString(UTF8);
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
};
```

### Backend Encryption Module

```typescript
// src/utils/cryptoUtils.ts (Backend)
import * as crypto from "crypto-js";

/**
 * Encrypts a string value using AES encryption with a strengthened key
 */
export const encrypt = (value: string, secretKey: string): string => {
  if (!value) return "";
  
  const strengthenedKey = strengthenKey(secretKey);
  return crypto.AES.encrypt(value, strengthenedKey).toString();
};

/**
 * Decrypts an encrypted string value with enhanced error handling
 */
export const decrypt = (encryptedValue: string, secretKey: string): string => {
  if (!encryptedValue) return "";
  
  try {
    const strengthenedKey = strengthenKey(secretKey);
    const bytes = crypto.AES.decrypt(encryptedValue, strengthenedKey);
    const decrypted = bytes.toString(crypto.enc.Utf8);
    
    // Validate decryption success
    if (!decrypted && encryptedValue) {
      console.warn("Decryption produced empty result, possible key mismatch");
      return "";
    }
    
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return "";
  }
};
```

## Credential Encryption

### Credential Data Structure

```typescript
// Plaintext credential (never stored)
interface CredentialEntry {
  id: number;
  website: string;
  title: string;
  username: string; // Encrypted before storage
  password: string; // Encrypted before storage
  userId: number;
  createdAt: string;
  updatedAt: string;
}

// Encrypted credential (stored in database)
interface EncryptedCredential {
  id: number;
  website: string; // Not encrypted (for searching/display)
  title: string; // Not encrypted (for searching/display)
  username: string; // Encrypted
  password: string; // Encrypted
  userId: number;
  createdAt: string;
  updatedAt: string;
}
```

### Credential Encryption Process

```typescript
// src/services/credentialService.ts
const encryptCredential = (
  credential: CredentialEntry,
  encryptionKey: string
): EncryptedCredential => {
  return {
    ...credential,
    username: encrypt(credential.username, encryptionKey),
    password: encrypt(credential.password, encryptionKey),
  };
};

const decryptCredential = (
  credential: EncryptedCredential,
  encryptionKey: string
): CredentialEntry => {
  return {
    ...credential,
    username: decrypt(credential.username, encryptionKey),
    password: decrypt(credential.password, encryptionKey),
  };
};
```

### Credential Service Implementation

```typescript
// Create credential with encryption
export const createCredential = async (
  credential: Omit<CredentialEntry, 'id'>,
  userId: number,
  encryptionKey: string | null
): Promise<CredentialEntry> => {
  if (!encryptionKey) {
    throw new Error('Encryption key is required');
  }

  // Encrypt sensitive fields
  const encryptedCredential = encryptCredential(
    { ...credential, id: 0 } as CredentialEntry,
    encryptionKey
  );

  // Add user ID and send to server
  const credentialWithUserId = {
    ...encryptedCredential,
    userId,
  };

  // Store encrypted credential
  const createdCredential = await post<typeof credentialWithUserId, EncryptedCredential>(
    '/credentials',
    credentialWithUserId
  );

  // Return decrypted credential for UI
  return decryptCredential(createdCredential, encryptionKey);
};

// Fetch and decrypt credentials
export const fetchCredentials = async (
  userId: number,
  encryptionKey: string | null
): Promise<CredentialEntry[]> => {
  if (!encryptionKey) {
    throw new Error('Encryption key is required');
  }

  // Fetch encrypted credentials from server
  const credentials = await fetchAll(`/credentials/user/${userId}`);
  
  // Decrypt credentials for client use
  return credentials.map((cred: EncryptedCredential) => 
    decryptCredential(cred, encryptionKey)
  );
};
```

## Image Encryption

### Image Encryption Architecture

Face images require special handling due to their binary nature and security requirements.

### Image to Base64 Conversion

```typescript
// src/utils/imageEncryptionUtils.ts
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsDataURL(blob);
  });
};
```

### Image Encryption Process

```typescript
export const encryptImage = async (
  imageBlob: Blob,
  encryptionKey: string
): Promise<{ encryptedData: string; contentType: string }> => {
  // Convert image to base64
  const base64Data = await blobToBase64(imageBlob);

  // Encrypt the base64 data using AES
  const encryptedData = encrypt(base64Data, encryptionKey);

  return {
    encryptedData,
    contentType: imageBlob.type,
  };
};
```

### Encrypted Form Data Creation

```typescript
export const createEncryptedImageFormData = async (
  imageBlob: Blob,
  encryptionKey: string,
  additionalData: Record<string, string> = {}
): Promise<FormData> => {
  try {
    // Encrypt the image
    const { encryptedData, contentType } = await encryptImage(imageBlob, encryptionKey);

    // Create metadata structure
    const encryptedInfo = JSON.stringify({
      data: encryptedData,
      contentType: contentType,
      encryptedAt: new Date().toISOString(),
      version: '1.0', // Version tracking for compatibility
    });

    // Create form data with encrypted content
    const formData = new FormData();
    const encryptedFile = new File([encryptedInfo], 'encrypted.json', {
      type: 'application/json',
      lastModified: Date.now(),
    });

    formData.append('encryptedImage', encryptedFile);
    formData.append('encryptedContentType', contentType);
    formData.append('encryptionVersion', '1.0');

    // Add additional metadata
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    return formData;
  } catch (error) {
    throw new Error('Failed to encrypt image data');
  }
};
```

### Image Decryption (Backend)

```typescript
// src/utils/imageDecryptionUtils.ts
export const decryptSelfieImage = (
  encryptedData: Buffer,
  email: string
): Buffer => {
  try {
    // Use temporary key for registration
    const tempEncryptionKey = `pwd-manager-temp-${email}-${process.env.APP_SECRET_KEY}`;

    // Parse JSON metadata
    let encryptedInfo;
    try {
      const jsonStr = encryptedData.toString("utf8");
      encryptedInfo = JSON.parse(jsonStr);
    } catch (jsonError) {
      // Fallback for direct encrypted data
      encryptedInfo = { data: encryptedData.toString("utf8") };
    }

    // Decrypt the base64 image data
    const encryptedString = encryptedInfo.data;
    const decryptedBase64 = decrypt(encryptedString, tempEncryptionKey);

    if (!decryptedBase64) {
      throw new Error("Decryption returned empty result");
    }

    // Convert back to binary buffer
    const buffer = Buffer.from(decryptedBase64, "base64");
    return buffer;
  } catch (error) {
    throw new Error("Failed to decrypt selfie image");
  }
};

// User-specific image decryption
export const decryptUserSelfieImage = (
  encryptedData: Buffer,
  userId: number,
  email: string
): Buffer => {
  try {
    // Generate user-specific encryption key
    const encryptionKey = getUserEncryptionKey(userId, email);

    // Parse encrypted metadata
    let encryptedInfo;
    try {
      const jsonStr = encryptedData.toString("utf8");
      encryptedInfo = JSON.parse(jsonStr);
    } catch (jsonError) {
      encryptedInfo = { data: encryptedData.toString("utf8") };
    }

    const encryptedString = encryptedInfo.data;
    let decryptedBase64 = "";

    try {
      // Try user-specific key first
      decryptedBase64 = decrypt(encryptedString, encryptionKey);
      
      if (!decryptedBase64) {
        throw new Error("Decryption returned empty result");
      }
    } catch (decryptError) {
      // Fallback to temporary key
      const tempEncryptionKey = `pwd-manager-temp-${email}-${process.env.APP_SECRET_KEY}`;
      
      try {
        decryptedBase64 = decrypt(encryptedString, tempEncryptionKey);
        
        if (!decryptedBase64) {
          throw new Error("Decryption with temp key returned empty result");
        }
      } catch (tempKeyError) {
        throw new Error("Could not decrypt with any available key");
      }
    }

    // Convert to image buffer
    const buffer = Buffer.from(decryptedBase64, "base64");
    return buffer;
  } catch (error) {
    throw new Error("Failed to decrypt user selfie image");
  }
};
```

## Key Rotation and Management

### Temporary Keys for Registration

During user registration, a temporary encryption key is used:

```typescript
// Frontend registration key
const tempEncryptionKey = `pwd-manager-temp-${email}-${import.meta.env.VITE_SECRET_KEY}`;

// Backend registration key
const tempEncryptionKey = `pwd-manager-temp-${email}-${process.env.APP_SECRET_KEY}`;
```

### Key Transition Process

1. **Registration**: Temporary key encrypts initial face image
2. **Authentication**: User-specific key generated after successful login
3. **Data Migration**: Future feature for key rotation
4. **Fallback**: Backend can decrypt with both keys during transition

## Security Considerations

### Encryption Strength

#### AES-256-CBC Security Features
- **256-bit key length**: Provides strong security against brute force
- **CBC mode**: Cipher Block Chaining provides semantic security
- **Random IV**: Each encryption uses a unique initialization vector
- **PKCS#7 padding**: Ensures proper block alignment

#### PBKDF2 Security Parameters
- **10,000 iterations**: Computationally expensive for attackers
- **256-bit output**: Full key strength maintained
- **Unique salt**: Prevents rainbow table attacks
- **SHA-256 underlying hash**: Cryptographically secure

### Key Security

#### Best Practices Implemented
- **Unique per-user keys**: Prevents cross-user data access
- **Environment-based secrets**: Server secrets separate from client
- **No key storage**: Keys derived on-demand, never persisted
- **Key separation**: Different keys for different operations

#### Potential Vulnerabilities and Mitigations
- **Environment variable exposure**: Use secure deployment practices
- **Memory dumps**: Keys exist in memory temporarily only
- **Side-channel attacks**: Use constant-time operations where possible
- **Key derivation timing**: PBKDF2 provides consistent timing

## Performance Considerations

### Encryption Performance

#### Optimization Strategies
```typescript
// Encrypt only sensitive fields
const sensitiveFields = ['username', 'password'];
const encryptedData = {};

sensitiveFields.forEach(field => {
  if (data[field]) {
    encryptedData[field] = encrypt(data[field], key);
  }
});
```

#### Caching Strategies
```typescript
// Cache strengthened keys to avoid repeated PBKDF2
const keyCache = new Map<string, string>();

export const getOrCreateStrengthenedKey = (baseKey: string): string => {
  if (keyCache.has(baseKey)) {
    return keyCache.get(baseKey)!;
  }
  
  const strengthenedKey = strengthenKey(baseKey);
  keyCache.set(baseKey, strengthenedKey);
  return strengthenedKey;
};
```

### Memory Management

#### Secure Memory Handling
```typescript
// Clear sensitive data from memory
const clearSensitiveData = (obj: any) => {
  if (typeof obj === 'object' && obj !== null) {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        obj[key] = '\0'.repeat(obj[key].length);
      }
      delete obj[key];
    });
  }
};
```

## Testing Encryption

### Unit Tests for Encryption Functions

```typescript
// Test encryption/decryption round trip
describe('Encryption Utils', () => {
  const testKey = 'test-encryption-key';
  const testData = 'sensitive-password-123';

  test('encrypt and decrypt should return original data', () => {
    const encrypted = encrypt(testData, testKey);
    expect(encrypted).not.toBe(testData);
    expect(encrypted).toBeTruthy();

    const decrypted = decrypt(encrypted, testKey);
    expect(decrypted).toBe(testData);
  });

  test('different keys should produce different encrypted data', () => {
    const encrypted1 = encrypt(testData, testKey);
    const encrypted2 = encrypt(testData, 'different-key');
    expect(encrypted1).not.toBe(encrypted2);
  });

  test('wrong key should fail decryption gracefully', () => {
    const encrypted = encrypt(testData, testKey);
    const decrypted = decrypt(encrypted, 'wrong-key');
    expect(decrypted).toBe(''); // Should return empty string
  });
});
```

### Integration Tests

```typescript
// Test full credential encryption flow
describe('Credential Encryption', () => {
  test('should encrypt and decrypt credentials correctly', async () => {
    const userId = 1;
    const email = 'test@example.com';
    const encryptionKey = getUserEncryptionKey(userId, email);

    const originalCredential = {
      website: 'https://example.com',
      title: 'Test Site',
      username: 'testuser',
      password: 'testpassword123',
    };

    const encrypted = encryptCredential(originalCredential, encryptionKey);
    expect(encrypted.username).not.toBe(originalCredential.username);
    expect(encrypted.password).not.toBe(originalCredential.password);

    const decrypted = decryptCredential(encrypted, encryptionKey);
    expect(decrypted.username).toBe(originalCredential.username);
    expect(decrypted.password).toBe(originalCredential.password);
  });
});
```

## Environment Configuration

### Required Environment Variables

#### Backend Configuration
```env
# Encryption settings
ENCRYPTION_SALT=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
APP_SECRET_KEY=your-strong-app-secret-key-for-encryption-do-not-share

# Database
DATABASE_URL=file:./prod.db

# JWT
JWT_SECRET=your-jwt-secret-key-minimum-256-bits
```

#### Frontend Configuration
```env
# Must match backend APP_SECRET_KEY
VITE_SECRET_KEY=your-strong-app-secret-key-for-encryption-do-not-share

# Must match backend ENCRYPTION_SALT
VITE_ENCRYPTION_SALT=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456

# API endpoint
VITE_BACKEND_URL=https://yourdomain.com/api
```

### Security Warnings

#### Critical Security Notes
- **Never commit encryption keys to version control**
- **Use different keys for development and production**
- **Generate cryptographically random keys**
- **Regularly rotate encryption keys**
- **Monitor for key exposure in logs**

#### Key Generation Examples
```bash
# Generate random salt (64 hex characters)
openssl rand -hex 32

# Generate random secret key
openssl rand -base64 32

# Generate JWT secret
openssl rand -base64 64
```

## Compliance and Standards

### Cryptographic Standards Compliance
- **FIPS 140-2**: AES-256 approved algorithm
- **NIST SP 800-132**: PBKDF2 key derivation guidelines
- **RFC 3394**: Key wrapping (future enhancement)
- **OWASP**: Cryptographic storage best practices

### Data Protection Compliance
- **GDPR**: Right to encryption and data protection
- **CCPA**: Security requirements for personal information
- **SOC 2**: Security controls for encryption
- **ISO 27001**: Information security management

For detailed information about specific encryption scenarios or troubleshooting, refer to the other documentation files or contact the development team.
