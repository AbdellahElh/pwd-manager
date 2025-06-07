// src/utils/imageEncryptionUtils.ts
import { encrypt } from "./cryptoUtils";

/**
 * Converts a Blob to a base64 encoded string
 * @param blob The image blob to convert
 * @returns Promise resolving to a base64 string
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };
    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };
    reader.readAsDataURL(blob);
  });
};

/**
 * Encrypts an image blob using AES encryption
 * @param imageBlob The image blob to encrypt
 * @param encryptionKey The encryption key to use
 * @returns Promise resolving to encrypted data and content type
 */
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

/**
 * Creates a FormData object with the encrypted image and metadata
 * @param imageBlob The image blob to encrypt and include in form data
 * @param encryptionKey The encryption key to use
 * @param fieldName The name of the field in the form data (default: 'image')
 * @param additionalData Additional data to include in the form data
 * @returns Promise resolving to a FormData object
 */
export const createEncryptedImageFormData = async (
  imageBlob: Blob,
  encryptionKey: string,
  fieldName: string = "image",
  additionalData: Record<string, string> = {}
): Promise<FormData> => {
  try {
    // Encrypt the image
    const { encryptedData, contentType } = await encryptImage(
      imageBlob,
      encryptionKey
    ); // Initialize form data
    const formData = new FormData();

    // Convert the encrypted data to a Blob to send it as a file
    // Use the appropriate MIME type to ensure it's processed as a file
    // We combine the encrypted data and content type to create a single file
    const encryptedInfo = JSON.stringify({
      data: encryptedData,
      contentType: contentType,
      encryptedAt: new Date().toISOString(),
      version: "1.0", // Version tracking for future compatibility
    });

    // Convert to a file-like object that multer can properly process
    const encryptedBlob = new Blob([encryptedInfo], {
      type: "application/json",
    });
    const encryptedFile = new File([encryptedBlob], "encrypted.json", {
      type: "application/json",
      lastModified: Date.now(),
    });
    formData.append("encryptedImage", encryptedFile);

    // Also include content type info to help backend process the image
    formData.append("encryptedContentType", contentType); // Include metadata for encryption
    formData.append("encryptionVersion", "1.0");

    // Add any additional data
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    return formData;
  } catch (error) {
    throw new Error("Failed to encrypt image data");
  }
};
