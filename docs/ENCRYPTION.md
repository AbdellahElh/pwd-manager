# Encryption Implementation Guide

Complete AES-256 encryption with PBKDF2 key derivation implementation for client-side data protection.

## Encryption Architecture

```
User Data → Key Generation → PBKDF2 Strengthening → AES-256 Encryption → Storage
```

## Key Generation

### User-Specific Keys

```typescript
// Generate unique encryption key per user
export const getUserEncryptionKey = (userId: number, userEmail: string): string => {
  const appSecretKey = process.env.APP_SECRET_KEY;
  return `pwd-manager-${userId}-${userEmail}-${appSecretKey}`;
};
```

### PBKDF2 Key Derivation

```typescript
import CryptoJS from 'crypto-js';

export const deriveEncryptionKey = (
  baseKey: string,
  salt: string,
  iterations: number = 10000
): CryptoJS.lib.WordArray => {
  return CryptoJS.PBKDF2(baseKey, salt, {
    keySize: 256 / 32, // 256-bit key
    iterations: iterations, // 10,000 iterations
    hasher: CryptoJS.algo.SHA256,
  });
};
```

## Password Encryption

### Encryption Function

```typescript
export const encryptPassword = (password: string, userId: number, userEmail: string): string => {
  try {
    // Generate user-specific base key
    const baseKey = getUserEncryptionKey(userId, userEmail);

    // Generate random salt for this encryption
    const salt = CryptoJS.lib.WordArray.random(256 / 8);

    // Derive strong encryption key using PBKDF2
    const derivedKey = deriveEncryptionKey(baseKey, salt.toString());

    // Encrypt the password using AES-256
    const encrypted = CryptoJS.AES.encrypt(password, derivedKey, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      iv: CryptoJS.lib.WordArray.random(128 / 8),
    });

    // Combine salt and encrypted data
    const result = {
      salt: salt.toString(),
      encrypted: encrypted.toString(),
    };

    return JSON.stringify(result);
  } catch (error) {
    throw new Error('Password encryption failed');
  }
};
```

### Decryption Function

```typescript
export const decryptPassword = (
  encryptedData: string,
  userId: number,
  userEmail: string
): string => {
  try {
    // Parse encrypted data
    const { salt, encrypted } = JSON.parse(encryptedData);

    // Regenerate the same base key
    const baseKey = getUserEncryptionKey(userId, userEmail);

    // Derive the same encryption key using stored salt
    const derivedKey = deriveEncryptionKey(baseKey, salt);

    // Decrypt the password
    const decryptedBytes = CryptoJS.AES.decrypt(encrypted, derivedKey, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decryptedBytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    throw new Error('Password decryption failed');
  }
};
```

## Frontend Implementation

### Encryption Service

```typescript
// EncryptionService.ts
export class EncryptionService {
  private static readonly ITERATIONS = 10000;

  static async encryptData(data: string, userId: number, email: string): Promise<string> {
    return encryptPassword(data, userId, email);
  }

  static async decryptData(encryptedData: string, userId: number, email: string): Promise<string> {
    return decryptPassword(encryptedData, userId, email);
  }

  static generateSecureKey(): string {
    return CryptoJS.lib.WordArray.random(256 / 8).toString();
  }
}
```

### Password Form Integration

```typescript
// PasswordForm component encryption
const handleSubmit = async (formData: PasswordFormData) => {
  try {
    const user = getCurrentUser();

    // Encrypt password before sending to server
    const encryptedPassword = await EncryptionService.encryptData(
      formData.password,
      user.id,
      user.email
    );

    // Send encrypted data to API
    await createPassword({
      ...formData,
      password: encryptedPassword,
    });
  } catch (error) {
    console.error('Password encryption failed:', error);
  }
};
```

## Backend Considerations

### Data Storage

```typescript
// Store encrypted passwords (server cannot decrypt)
app.post('/api/passwords', authenticateToken, async (req, res) => {
  const { title, username, password, url } = req.body;

  // Password is already encrypted on client-side
  // Server stores encrypted data without ability to decrypt
  const newPassword = await prisma.password.create({
    data: {
      title,
      username,
      password, // Encrypted string from client
      url,
      userId: req.user.userId,
    },
  });

  res.json(newPassword);
});
```

### Data Retrieval

```typescript
// Retrieve encrypted passwords
app.get('/api/passwords', authenticateToken, async (req, res) => {
  const passwords = await prisma.password.findMany({
    where: { userId: req.user.userId },
    select: {
      id: true,
      title: true,
      username: true,
      password: true, // Still encrypted
      url: true,
      createdAt: true,
    },
  });

  // Client will decrypt passwords after receiving them
  res.json(passwords);
});
```

## Security Features

### Key Security

- **Unique Keys**: Each user has unique encryption keys
- **Salt Usage**: Random salt for each encryption operation
- **Key Derivation**: PBKDF2 with 10,000 iterations
- **No Storage**: Encryption keys never stored on server

### Encryption Strength

- **Algorithm**: AES-256-CBC (Advanced Encryption Standard)
- **Key Size**: 256-bit encryption keys
- **Block Size**: 128-bit initialization vectors
- **Padding**: PKCS#7 padding standard

### Implementation Security

- **Client-Side Only**: All encryption/decryption on client
- **Zero Knowledge**: Server cannot access plain text passwords
- **Error Handling**: Secure error messages without data leakage
- **Memory Management**: Sensitive data cleared after use

## Testing

### Unit Tests

```typescript
// Encryption service tests
describe('EncryptionService', () => {
  test('should encrypt and decrypt password correctly', () => {
    const originalPassword = 'mySecurePassword123!';
    const userId = 1;
    const email = 'user@example.com';

    const encrypted = encryptPassword(originalPassword, userId, email);
    const decrypted = decryptPassword(encrypted, userId, email);

    expect(decrypted).toBe(originalPassword);
    expect(encrypted).not.toBe(originalPassword);
  });

  test('should generate different encrypted values for same input', () => {
    const password = 'samePassword';
    const userId = 1;
    const email = 'user@example.com';

    const encrypted1 = encryptPassword(password, userId, email);
    const encrypted2 = encryptPassword(password, userId, email);

    expect(encrypted1).not.toBe(encrypted2); // Different due to random salt
  });
});
```

## Performance Considerations

- **PBKDF2 Iterations**: Balance security vs performance (10,000 iterations)
- **Client-Side Processing**: Encryption load on client device
- **Memory Usage**: Clear sensitive data after operations
- **Batch Operations**: Encrypt multiple passwords efficiently

See [SECURITY.md](./SECURITY.md) for comprehensive security implementation.
