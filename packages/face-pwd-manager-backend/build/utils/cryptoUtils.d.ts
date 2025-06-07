/**
 * Strengthens a key using PBKDF2 key derivation function
 * @param baseKey The initial key to strengthen
 * @returns A cryptographically stronger key
 */
export declare const strengthenKey: (baseKey: string) => string;
/**
 * Encrypts a string value using AES encryption with a strengthened key
 * @param value The value to encrypt
 * @param secretKey The secret key to use for encryption
 * @returns The encrypted value as a string
 */
export declare const encrypt: (value: string, secretKey: string) => string;
/**
 * Decrypts an encrypted string value using AES encryption with a strengthened key
 * @param encryptedValue The encrypted value to decrypt
 * @param secretKey The secret key used for encryption
 * @returns The decrypted value as a string
 */
export declare const decrypt: (encryptedValue: string, secretKey: string) => string;
/**
 * Generates a user-specific encryption key based on their ID and email and a secret key
 * This ensures each user has a unique key
 * @param userId The user's ID
 * @param userEmail The user's email
 * @returns A unique key for the user
 */
export declare const getUserEncryptionKey: (userId: number, userEmail: string) => string;
//# sourceMappingURL=cryptoUtils.d.ts.map