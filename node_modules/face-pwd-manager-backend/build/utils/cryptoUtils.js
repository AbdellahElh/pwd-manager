"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserEncryptionKey = exports.decrypt = exports.encrypt = exports.strengthenKey = void 0;
// src/utils/CryptoUtils.ts
const crypto = __importStar(require("crypto-js"));
// Get the salt and secret key from environment variables
const SALT = process.env.ENCRYPTION_SALT || "default";
if (!process.env.ENCRYPTION_SALT) {
    console.warn("Warning: ENCRYPTION_SALT environment variable is missing. Using default value.");
}
const APP_SECRET_KEY = process.env.APP_SECRET_KEY || "default";
if (!process.env.APP_SECRET_KEY) {
    console.warn("Warning: APP_SECRET_KEY environment variable is missing. Using default value.");
}
const ITERATIONS = 10000; // Must match frontend
const KEY_SIZE = 256; // 256-bit key, must match frontend
/**
 * Strengthens a key using PBKDF2 key derivation function
 * @param baseKey The initial key to strengthen
 * @returns A cryptographically stronger key
 */
const strengthenKey = (baseKey) => {
    return crypto
        .PBKDF2(baseKey, SALT, {
        keySize: KEY_SIZE / 32, // keySize in words (32 bits per word)
        iterations: ITERATIONS,
    })
        .toString();
};
exports.strengthenKey = strengthenKey;
/**
 * Encrypts a string value using AES encryption with a strengthened key
 * @param value The value to encrypt
 * @param secretKey The secret key to use for encryption
 * @returns The encrypted value as a string
 */
const encrypt = (value, secretKey) => {
    if (!value)
        return "";
    const strengthenedKey = (0, exports.strengthenKey)(secretKey);
    return crypto.AES.encrypt(value, strengthenedKey).toString();
};
exports.encrypt = encrypt;
/**
 * Decrypts an encrypted string value using AES encryption with a strengthened key
 * @param encryptedValue The encrypted value to decrypt
 * @param secretKey The secret key used for encryption
 * @returns The decrypted value as a string
 */
const decrypt = (encryptedValue, secretKey) => {
    if (!encryptedValue)
        return "";
    try {
        const strengthenedKey = (0, exports.strengthenKey)(secretKey);
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
    }
    catch (error) {
        // Return empty string instead of throwing to prevent crashes
        return "";
    }
};
exports.decrypt = decrypt;
/**
 * Generates a user-specific encryption key based on their ID and email and a secret key
 * This ensures each user has a unique key
 * @param userId The user's ID
 * @param userEmail The user's email
 * @returns A unique key for the user
 */
const getUserEncryptionKey = (userId, userEmail) => {
    return `pwd-manager-${userId}-${userEmail}-${APP_SECRET_KEY}`;
};
exports.getUserEncryptionKey = getUserEncryptionKey;
