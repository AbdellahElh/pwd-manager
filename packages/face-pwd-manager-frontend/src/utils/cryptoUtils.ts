// src/utils/cryptoUtils.ts
import AES from "crypto-js/aes";
import UTF8 from "crypto-js/enc-utf8";
import PBKDF2 from "crypto-js/pbkdf2";
import { showErrorToast } from "./toastUtils";

// Get the salt from environment variables
const SALT = import.meta.env.VITE_ENCRYPTION_SALT;
const ITERATIONS = 10000; // Number of iterations for key derivation
const KEY_SIZE = 256; // 256-bit key

/**
 * Strengthens a key using PBKDF2 key derivation function
 * @param baseKey The initial key to strengthen
 * @returns A cryptographically stronger key
 */
export const strengthenKey = (baseKey: string): string => {
  return PBKDF2(baseKey, SALT, {
    keySize: KEY_SIZE / 32, // keySize in words (32 bits per word)
    iterations: ITERATIONS,
  }).toString();
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
  return AES.encrypt(value, strengthenedKey).toString();
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
    const bytes = AES.decrypt(encryptedValue, strengthenedKey);
    return bytes.toString(UTF8);
  } catch (error) {
    showErrorToast("Decryption failed. Please check your credentials.");
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
  const appSecretKey = import.meta.env.VITE_SECRET_KEY;
  return `pwd-manager-${userId}-${userEmail}-${appSecretKey}`;
};
