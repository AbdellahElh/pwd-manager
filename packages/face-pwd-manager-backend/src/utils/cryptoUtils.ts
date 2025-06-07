// src/utils/CryptoUtils.ts
import * as crypto from "crypto-js";

// Get the salt and secret key from environment variables
const SALT = process.env.ENCRYPTION_SALT || "default"; 
if (!process.env.ENCRYPTION_SALT) {
  console.warn(
    "Warning: ENCRYPTION_SALT environment variable is missing. Using default value."
  );
}

const APP_SECRET_KEY = process.env.APP_SECRET_KEY || "default"; 
if (!process.env.APP_SECRET_KEY) {
  console.warn(
    "Warning: APP_SECRET_KEY environment variable is missing. Using default value."
  );
}

const ITERATIONS = 10000; // Must match frontend
const KEY_SIZE = 256; // 256-bit key, must match frontend

/**
 * Strengthens a key using PBKDF2 key derivation function
 * @param baseKey The initial key to strengthen
 * @returns A cryptographically stronger key
 */
export const strengthenKey = (baseKey: string): string => {
  return crypto
    .PBKDF2(baseKey, SALT, {
      keySize: KEY_SIZE / 32, // keySize in words (32 bits per word)
      iterations: ITERATIONS,
    })
    .toString();
};

/**
 * Encrypts a string value using AES encryption with a strengthened key
 * @param value The value to encrypt
 * @param secretKey The secret key to use for encryption
 * @returns The encrypted value as a string
 */
export const encrypt = (value: string, secretKey: string): string => {
  if (!value) return "";
  const strengthenedKey = strengthenKey(secretKey);
  return crypto.AES.encrypt(value, strengthenedKey).toString();
};

/**
 * Decrypts an encrypted string value using AES encryption with a strengthened key
 * @param encryptedValue The encrypted value to decrypt
 * @param secretKey The secret key used for encryption
 * @returns The decrypted value as a string
 */
export const decrypt = (encryptedValue: string, secretKey: string): string => {
  if (!encryptedValue) return "";
  try {
    const strengthenedKey = strengthenKey(secretKey);

    // Improved error handling for malformed data
    const bytes = crypto.AES.decrypt(encryptedValue, strengthenedKey);

    // Check if decryption was successful before converting to string
    const decrypted = bytes.toString(crypto.enc.Utf8);

    // If decryption resulted in an empty string when input wasn't empty,
    // it's likely due to an invalid key
    if (!decrypted && encryptedValue) {
      console.warn("Decryption produced empty result, possible key mismatch");
      return ""; // Return empty string instead of throwing
    }

    return decrypted;
  } catch (error: any) {
    // Return empty string instead of throwing to prevent crashes
    return "";
  }
};

/**
 * Generates a user-specific encryption key based on their ID and email and a secret key
 * This ensures each user has a unique key
 * @param userId The user's ID
 * @param userEmail The user's email
 * @returns A unique key for the user
 */
export const getUserEncryptionKey = (
  userId: number,
  userEmail: string
): string => {
  return `pwd-manager-${userId}-${userEmail}-${APP_SECRET_KEY}`;
};
