/**
 * Decrypts an encrypted selfie image
 *
 * @param encryptedData The encrypted selfie data
 * @param email The user's email address for key derivation
 * @returns Buffer containing the decrypted image data
 */
export declare const decryptSelfieImage: (encryptedData: Buffer, email: string) => Buffer;
/**
 * Decrypts an encrypted selfie image using a user-specific key
 *
 * @param encryptedData The encrypted selfie data
 * @param userId The user's ID for key derivation
 * @param email The user's email address for key derivation
 * @returns Buffer containing the decrypted image data
 */
export declare const decryptUserSelfieImage: (encryptedData: Buffer, userId: number, email: string) => Buffer;
//# sourceMappingURL=imageDecryptionUtils.d.ts.map