// src/utils/imageCompressionUtils.ts
/**
 * Image compression utilities for faster authentication
 */

/**
 * Compress an image blob for faster transmission and processing
 * @param blob The original image blob
 * @param quality Compression quality (0.1 to 1.0)
 * @param maxDimension Maximum width or height in pixels
 * @returns Compressed image blob
 */
export async function compressImage(
  blob: Blob,
  quality: number = 0.8,
  maxDimension: number = 800
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      if (width > height) {
        if (width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Optimize canvas context for speed
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        compressedBlob => {
          if (compressedBlob) {
            resolve(compressedBlob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Get optimal compression settings based on image size
 * @param originalSize Original file size in bytes
 * @returns Recommended quality and max dimension settings
 */
export function getOptimalCompressionSettings(originalSize: number): {
  quality: number;
  maxDimension: number;
} {
  if (originalSize > 2 * 1024 * 1024) {
    // > 2MB
    return { quality: 0.6, maxDimension: 640 };
  } else if (originalSize > 1 * 1024 * 1024) {
    // > 1MB
    return { quality: 0.7, maxDimension: 720 };
  } else if (originalSize > 500 * 1024) {
    // > 500KB
    return { quality: 0.8, maxDimension: 800 };
  } else {
    return { quality: 0.85, maxDimension: 900 };
  }
}

/**
 * Resize image to specific dimensions for consistent face detection
 * @param blob The original image blob
 * @param targetWidth Target width in pixels
 * @param targetHeight Target height in pixels
 * @returns Resized image blob
 */
export async function resizeImage(
  blob: Blob,
  targetWidth: number,
  targetHeight: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Use faster drawing settings for face detection preprocessing
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        resizedBlob => {
          if (resizedBlob) {
            resolve(resizedBlob);
          } else {
            reject(new Error('Failed to resize image'));
          }
        },
        'image/jpeg',
        0.8 // Good quality for face detection
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for resizing'));
    };

    img.src = URL.createObjectURL(blob);
  });
}
