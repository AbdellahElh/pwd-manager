// src/config/faceDetectionConfig.ts
/**
 * Face detection configuration optimized for maximum performance
 */

export interface FaceDetectionConfig {
  // TinyFaceDetector options
  inputSize: number;
  scoreThreshold: number;

  // Image processing options
  maxImageDimension: number;
  imageQuality: number;

  // Comparison options
  faceMatchThreshold: number;
}

// Optimized configuration for best performance
export const OPTIMIZED_FACE_CONFIG: FaceDetectionConfig = {
  inputSize: 96, // Smallest valid size (divisible by 32) for maximum speed
  scoreThreshold: 0.3, // Lower threshold for faster detection
  maxImageDimension: 320, // Aggressive downscaling for speed
  imageQuality: 0.7, // Lower quality for faster processing
  faceMatchThreshold: 0.65, // Slightly more lenient for speed
};

/**
 * Get the optimized face detection configuration
 */
export function getFaceDetectionConfig(): FaceDetectionConfig {
  return OPTIMIZED_FACE_CONFIG;
}

/**
 * Create TinyFaceDetector options from config
 */
export function createDetectorOptions(config: FaceDetectionConfig) {
  return {
    inputSize: config.inputSize,
    scoreThreshold: config.scoreThreshold,
  };
}
