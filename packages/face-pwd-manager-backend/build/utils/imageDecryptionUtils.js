"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptUserSelfieImage = exports.decryptSelfieImage = void 0;
// src/utils/imageDecryptionUtils.ts
const cryptoUtils_1 = require("./cryptoUtils");
/**
 * Decrypts an encrypted selfie image
 *
 * @param encryptedData The encrypted selfie data
 * @param email The user's email address for key derivation
 * @returns Buffer containing the decrypted image data
 */
const decryptSelfieImage = (encryptedData, email) => {
    try {
        // For initial registration, we use a temporary key based on email
        const tempEncryptionKey = `pwd-manager-temp-${email}-${process.env.APP_SECRET_KEY}`;
        // Parse the JSON that contains both encrypted data and content type
        let encryptedInfo;
        try {
            const jsonStr = encryptedData.toString("utf8");
            encryptedInfo = JSON.parse(jsonStr);
        }
        catch (jsonError) {
            // Fallback to treating the buffer as a direct encrypted string
            encryptedInfo = { data: encryptedData.toString("utf8") };
        }
        const encryptedString = encryptedInfo.data; // Decrypt the data
        const decryptedBase64 = (0, cryptoUtils_1.decrypt)(encryptedString, tempEncryptionKey);
        if (!decryptedBase64) {
            throw new Error("Decryption returned empty result");
        }
        // Create proper image buffer from base64
        try {
            // Extract raw binary data from base64 string
            const buffer = Buffer.from(decryptedBase64, "base64");
            return buffer;
        }
        catch (bufferError) {
            throw new Error("Failed to create image buffer from decrypted data");
        }
    }
    catch (error) {
        throw new Error("Failed to decrypt selfie image");
    }
};
exports.decryptSelfieImage = decryptSelfieImage;
/**
 * Decrypts an encrypted selfie image using a user-specific key
 *
 * @param encryptedData The encrypted selfie data
 * @param userId The user's ID for key derivation
 * @param email The user's email address for key derivation
 * @returns Buffer containing the decrypted image data
 */
const decryptUserSelfieImage = (encryptedData, userId, email) => {
    try {
        // Generate user-specific encryption key
        const encryptionKey = (0, cryptoUtils_1.getUserEncryptionKey)(userId, email);
        // Parse the JSON that contains both encrypted data and content type
        let encryptedInfo;
        try {
            const jsonStr = encryptedData.toString("utf8");
            encryptedInfo = JSON.parse(jsonStr);
        }
        catch (jsonError) {
            // Fallback to treating the buffer as a direct encrypted string
            encryptedInfo = { data: encryptedData.toString("utf8") };
        }
        const encryptedString = encryptedInfo.data;
        // Try decryption with both keys
        let decryptedBase64 = "";
        try {
            // First try with the user-specific key
            decryptedBase64 = (0, cryptoUtils_1.decrypt)(encryptedString, encryptionKey);
            if (!decryptedBase64) {
                throw new Error("Decryption returned empty result");
            }
        }
        catch (decryptError) {
            // Try alternative approach with temporary key
            const tempEncryptionKey = `pwd-manager-temp-${email}-${process.env.APP_SECRET_KEY}`;
            try {
                decryptedBase64 = (0, cryptoUtils_1.decrypt)(encryptedString, tempEncryptionKey);
                if (!decryptedBase64) {
                    throw new Error("Decryption with temp key returned empty result");
                }
            }
            catch (tempKeyError) {
                throw new Error("Could not decrypt with any available key");
            }
        }
        // Create proper image buffer from base64
        try {
            // Extract raw binary data from base64 string
            const buffer = Buffer.from(decryptedBase64, "base64");
            return buffer;
        }
        catch (bufferError) {
            throw new Error("Failed to create image buffer from decrypted data");
        }
    }
    catch (error) {
        throw new Error("Failed to decrypt user selfie image");
    }
};
exports.decryptUserSelfieImage = decryptUserSelfieImage;
