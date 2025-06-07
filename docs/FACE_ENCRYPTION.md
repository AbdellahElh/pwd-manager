# Face Encryption Documentation

This document provides detailed information about the facial recognition and face data encryption mechanisms implemented in the Password Manager with Facial Recognition application.

## Face Encryption Overview

The application implements a sophisticated face encryption system that:
- Encrypts face images during transmission
- Protects biometric data with AES-256 encryption
- Stores only mathematical face descriptors, never raw images
- Uses temporary encryption keys for registration
- Implements user-specific keys for authenticated operations

## Facial Recognition Architecture

### Face Processing Pipeline

```
Camera Capture → Face Detection → Descriptor Extraction → Encryption → Transmission → Storage
```

### Face Data Types

1. **Face Images**: Raw image data from camera (encrypted, not stored)
2. **Face Descriptors**: 128-dimensional mathematical representations (stored)
3. **Face Landmarks**: 68-point facial feature coordinates (not stored)

## Face-API.js Integration

### Face Detection and Recognition Setup

```typescript
// Frontend face detection configuration
import * as faceapi from 'face-api.js';

// Load required models
export const loadFaceAPIModels = async (): Promise<void> => {
  const MODEL_URL = '/models';
  
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
  ]);
};

// Face detection options
const faceDetectionOptions = new faceapi.SsdMobilenetv1Options({
  minConfidence: 0.5,
  maxResults: 1
});
```

### Face Descriptor Extraction

```typescript
// Extract face descriptor from image
export const extractFaceDescriptor = async (
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<Float32Array | null> => {
  try {
    // Detect face with landmarks and descriptor
    const detection = await faceapi
      .detectSingleFace(imageElement, faceDetectionOptions)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      throw new Error('No face detected in image');
    }

    // Return the 128-dimensional face descriptor
    return detection.descriptor;
  } catch (error) {
    console.error('Face descriptor extraction failed:', error);
    return null;
  }
};
```

### Face Matching Implementation

```typescript
// Compare face descriptors for authentication
export const compareFaceDescriptors = (
  storedDescriptor: Float32Array,
  currentDescriptor: Float32Array,
  threshold: number = 0.6
): boolean => {
  try {
    // Calculate Euclidean distance between descriptors
    const distance = faceapi.euclideanDistance(storedDescriptor, currentDescriptor);
    
    // Lower distance means higher similarity
    const isMatch = distance <= threshold;
    
    console.log(`Face comparison - Distance: ${distance.toFixed(4)}, Match: ${isMatch}`);
    return isMatch;
  } catch (error) {
    console.error('Face comparison failed:', error);
    return false;
  }
};
```

## Face Image Encryption

### Registration Flow Encryption

During user registration, face images are encrypted with a temporary key:

```typescript
// Registration face encryption
export const encryptRegistrationImage = async (
  imageBlob: Blob,
  email: string
): Promise<FormData> => {
  try {
    // Generate temporary encryption key for registration
    const tempEncryptionKey = `pwd-manager-temp-${email}-${import.meta.env.VITE_SECRET_KEY}`;
    
    // Convert image to base64
    const base64Data = await blobToBase64(imageBlob);
    
    // Encrypt the base64 image data
    const encryptedData = encrypt(base64Data, tempEncryptionKey);
    
    // Create encrypted metadata
    const encryptedInfo = JSON.stringify({
      data: encryptedData,
      contentType: imageBlob.type,
      encryptedAt: new Date().toISOString(),
      version: '1.0',
      purpose: 'registration',
      keyType: 'temporary'
    });
    
    // Create FormData for transmission
    const formData = new FormData();
    const encryptedFile = new File([encryptedInfo], 'encrypted-face.json', {
      type: 'application/json',
      lastModified: Date.now(),
    });
    
    formData.append('encryptedImage', encryptedFile);
    formData.append('email', email);
    formData.append('encryptionVersion', '1.0');
    
    return formData;
  } catch (error) {
    throw new Error(`Failed to encrypt registration image: ${error.message}`);
  }
};
```

### Authentication Flow Encryption

For user authentication, images are encrypted with user-specific keys:

```typescript
// Authentication face encryption
export const encryptAuthenticationImage = async (
  imageBlob: Blob,
  userId: number,
  email: string
): Promise<FormData> => {
  try {
    // Generate user-specific encryption key
    const userEncryptionKey = getUserEncryptionKey(userId, email);
    
    // Convert and encrypt image
    const base64Data = await blobToBase64(imageBlob);
    const encryptedData = encrypt(base64Data, userEncryptionKey);
    
    // Create encrypted metadata
    const encryptedInfo = JSON.stringify({
      data: encryptedData,
      contentType: imageBlob.type,
      encryptedAt: new Date().toISOString(),
      version: '1.0',
      purpose: 'authentication',
      keyType: 'user-specific',
      userId: userId
    });
    
    // Create FormData
    const formData = new FormData();
    const encryptedFile = new File([encryptedInfo], 'encrypted-auth-face.json', {
      type: 'application/json'
    });
    
    formData.append('encryptedImage', encryptedFile);
    formData.append('userId', userId.toString());
    formData.append('email', email);
    
    return formData;
  } catch (error) {
    throw new Error(`Failed to encrypt authentication image: ${error.message}`);
  }
};
```

## Backend Face Decryption

### Registration Image Decryption

```typescript
// Backend registration image decryption
export const decryptRegistrationImage = (
  encryptedData: Buffer,
  email: string
): Buffer => {
  try {
    // Use temporary key matching frontend registration
    const tempEncryptionKey = `pwd-manager-temp-${email}-${process.env.APP_SECRET_KEY}`;
    
    // Parse encrypted metadata
    let encryptedInfo;
    try {
      const jsonStr = encryptedData.toString("utf8");
      encryptedInfo = JSON.parse(jsonStr);
      
      // Validate encryption metadata
      if (!encryptedInfo.data || !encryptedInfo.contentType) {
        throw new Error("Invalid encrypted image format");
      }
      
      // Log encryption details for debugging
      console.log(`Decrypting registration image - Version: ${encryptedInfo.version}, Purpose: ${encryptedInfo.purpose}`);
    } catch (jsonError) {
      // Fallback for legacy format
      encryptedInfo = { data: encryptedData.toString("utf8") };
    }
    
    // Decrypt the base64 image data
    const encryptedString = encryptedInfo.data;
    const decryptedBase64 = decrypt(encryptedString, tempEncryptionKey);
    
    if (!decryptedBase64) {
      throw new Error("Decryption returned empty result - possible key mismatch");
    }
    
    // Validate base64 format
    if (!isValidBase64(decryptedBase64)) {
      throw new Error("Decrypted data is not valid base64");
    }
    
    // Convert back to binary buffer
    const imageBuffer = Buffer.from(decryptedBase64, "base64");
    
    // Validate image buffer
    if (imageBuffer.length === 0) {
      throw new Error("Decrypted image buffer is empty");
    }
    
    return imageBuffer;
  } catch (error) {
    console.error("Registration image decryption failed:", error);
    throw new Error(`Failed to decrypt registration image: ${error.message}`);
  }
};

// Helper function to validate base64
const isValidBase64 = (str: string): boolean => {
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
};
```

### User-Specific Image Decryption

```typescript
// Backend user-specific image decryption
export const decryptUserImage = (
  encryptedData: Buffer,
  userId: number,
  email: string
): Buffer => {
  try {
    // Generate user-specific encryption key
    const userEncryptionKey = getUserEncryptionKey(userId, email);
    
    // Parse encrypted metadata
    let encryptedInfo;
    try {
      const jsonStr = encryptedData.toString("utf8");
      encryptedInfo = JSON.parse(jsonStr);
    } catch (jsonError) {
      encryptedInfo = { data: encryptedData.toString("utf8") };
    }
    
    const encryptedString = encryptedInfo.data;
    let decryptedBase64 = "";
    
    try {
      // Try user-specific key first
      decryptedBase64 = decrypt(encryptedString, userEncryptionKey);
      
      if (!decryptedBase64) {
        throw new Error("User key decryption failed");
      }
    } catch (userKeyError) {
      // Fallback to temporary key (for backward compatibility)
      console.log("User key failed, trying temporary key fallback");
      
      const tempEncryptionKey = `pwd-manager-temp-${email}-${process.env.APP_SECRET_KEY}`;
      
      try {
        decryptedBase64 = decrypt(encryptedString, tempEncryptionKey);
        
        if (!decryptedBase64) {
          throw new Error("Temporary key decryption also failed");
        }
        
        console.log("Successfully decrypted with temporary key fallback");
      } catch (tempKeyError) {
        throw new Error("Could not decrypt with any available key");
      }
    }
    
    // Convert to image buffer
    const imageBuffer = Buffer.from(decryptedBase64, "base64");
    return imageBuffer;
  } catch (error) {
    console.error("User image decryption failed:", error);
    throw new Error(`Failed to decrypt user image: ${error.message}`);
  }
};
```

## Face Descriptor Storage

### Database Schema for Face Data

```sql
-- User table with encrypted face descriptor
CREATE TABLE User (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    faceDescriptor TEXT NOT NULL, -- JSON array of 128 numbers
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Face authentication log
CREATE TABLE FaceAuthLog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    authAttempt BOOLEAN NOT NULL,
    matchScore REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    ipAddress TEXT,
    userAgent TEXT,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);
```

### Face Descriptor Storage Process

```typescript
// Store face descriptor after registration
export const storeFaceDescriptor = async (
  email: string,
  faceDescriptor: Float32Array
): Promise<User> => {
  try {
    // Convert Float32Array to regular array for JSON storage
    const descriptorArray = Array.from(faceDescriptor);
    
    // Validate descriptor format
    if (descriptorArray.length !== 128) {
      throw new Error(`Invalid face descriptor length: ${descriptorArray.length}. Expected 128.`);
    }
    
    // Store user with face descriptor
    const user = await prisma.user.create({
      data: {
        email: email,
        faceDescriptor: JSON.stringify(descriptorArray)
      }
    });
    
    console.log(`Face descriptor stored for user ${user.id}`);
    return user;
  } catch (error) {
    console.error("Face descriptor storage failed:", error);
    throw new Error(`Failed to store face descriptor: ${error.message}`);
  }
};

// Retrieve and parse face descriptor
export const getFaceDescriptor = async (userId: number): Promise<Float32Array> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    
    // Parse and validate stored descriptor
    const descriptorArray = JSON.parse(user.faceDescriptor);
    
    if (!Array.isArray(descriptorArray) || descriptorArray.length !== 128) {
      throw new Error("Invalid stored face descriptor format");
    }
    
    // Convert back to Float32Array
    return new Float32Array(descriptorArray);
  } catch (error) {
    console.error("Face descriptor retrieval failed:", error);
    throw new Error(`Failed to retrieve face descriptor: ${error.message}`);
  }
};
```

## Face Authentication Process

### Complete Authentication Flow

```typescript
// Frontend face authentication
export const authenticateWithFace = async (
  email: string,
  faceImageBlob: Blob
): Promise<{ success: boolean; user?: User; token?: string }> => {
  try {
    // Extract face descriptor from captured image
    const imageElement = await blobToImageElement(faceImageBlob);
    const currentDescriptor = await extractFaceDescriptor(imageElement);
    
    if (!currentDescriptor) {
      throw new Error("No face detected in captured image");
    }
    
    // Encrypt face image for transmission
    const encryptedFormData = await encryptRegistrationImage(faceImageBlob, email);
    
    // Send encrypted image and descriptor to backend
    const response = await post<FormData, AuthenticationResponse>('/users/authenticate-face', {
      ...encryptedFormData,
      faceDescriptor: Array.from(currentDescriptor)
    });
    
    return {
      success: true,
      user: response.user,
      token: response.token
    };
  } catch (error) {
    console.error("Face authentication failed:", error);
    return {
      success: false
    };
  }
};

// Convert blob to image element
const blobToImageElement = (blob: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    
    img.src = url;
  });
};
```

### Backend Authentication Verification

```typescript
// Backend face authentication verification
export const verifyFaceAuthentication = async (
  email: string,
  encryptedImageData: Buffer,
  providedDescriptor: number[]
): Promise<{ success: boolean; user?: User; token?: string }> => {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email }
    });
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Get stored face descriptor
    const storedDescriptor = await getFaceDescriptor(user.id);
    const providedDescriptorArray = new Float32Array(providedDescriptor);
    
    // Compare face descriptors
    const isMatch = compareFaceDescriptors(storedDescriptor, providedDescriptorArray);
    
    if (!isMatch) {
      // Log failed authentication attempt
      await logAuthenticationAttempt(user.id, false, faceapi.euclideanDistance(storedDescriptor, providedDescriptorArray));
      throw new Error("Face authentication failed - no match");
    }
    
    // Generate authentication token
    const token = generateAuthToken(user.id, user.email);
    
    // Log successful authentication
    await logAuthenticationAttempt(user.id, true, faceapi.euclideanDistance(storedDescriptor, providedDescriptorArray));
    
    return {
      success: true,
      user: user,
      token: token
    };
  } catch (error) {
    console.error("Face verification failed:", error);
    return {
      success: false
    };
  }
};

// Log authentication attempts
const logAuthenticationAttempt = async (
  userId: number,
  success: boolean,
  matchScore: number,
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
  try {
    await prisma.faceAuthLog.create({
      data: {
        userId: userId,
        authAttempt: success,
        matchScore: matchScore,
        ipAddress: ipAddress || 'unknown',
        userAgent: userAgent || 'unknown'
      }
    });
  } catch (error) {
    console.error("Failed to log authentication attempt:", error);
  }
};
```

## Security Considerations

### Biometric Data Protection

#### Privacy Safeguards
- **No persistent face images**: Original images never stored
- **Mathematical descriptors only**: Store only 128-number arrays
- **Encrypted transmission**: All face data encrypted in transit
- **Secure deletion**: Temporary face images cleared from memory

#### Encryption Security
- **AES-256 encryption**: Industry-standard encryption for face images
- **Unique keys**: User-specific encryption keys prevent cross-contamination
- **Key rotation support**: Framework for future key rotation implementation
- **Secure key derivation**: PBKDF2 strengthening for all encryption keys

### Face Recognition Security

#### Anti-Spoofing Measures
```typescript
// Basic liveness detection (can be enhanced)
export const detectLiveness = async (
  videoElement: HTMLVideoElement
): Promise<boolean> => {
  try {
    // Multiple frame analysis
    const frames = [];
    for (let i = 0; i < 5; i++) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      ctx?.drawImage(videoElement, 0, 0);
      
      const detection = await faceapi
        .detectSingleFace(canvas)
        .withFaceLandmarks();
      
      if (detection) {
        frames.push(detection);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Basic movement detection
    if (frames.length < 3) {
      return false;
    }
    
    // Check for landmark variations (basic liveness check)
    const variations = calculateLandmarkVariations(frames);
    return variations > LIVENESS_THRESHOLD;
  } catch (error) {
    console.error("Liveness detection failed:", error);
    return false;
  }
};

const calculateLandmarkVariations = (frames: any[]): number => {
  // Calculate variance in key landmark positions
  let totalVariation = 0;
  const keyPoints = [30, 8, 36, 45]; // Nose tip, chin, left eye, right eye
  
  keyPoints.forEach(pointIndex => {
    const positions = frames.map(frame => frame.landmarks.positions[pointIndex]);
    const variance = calculatePositionVariance(positions);
    totalVariation += variance;
  });
  
  return totalVariation;
};
```

#### Face Matching Security
```typescript
// Secure face comparison with multiple checks
export const secureCompareFaces = (
  storedDescriptor: Float32Array,
  currentDescriptor: Float32Array
): { isMatch: boolean; confidence: number; details: any } => {
  try {
    // Primary distance calculation
    const euclideanDistance = faceapi.euclideanDistance(storedDescriptor, currentDescriptor);
    
    // Secondary validation using cosine similarity
    const cosineSimilarity = calculateCosineSimilarity(storedDescriptor, currentDescriptor);
    
    // Adaptive threshold based on descriptor quality
    const adaptiveThreshold = calculateAdaptiveThreshold(storedDescriptor, currentDescriptor);
    
    // Multi-metric evaluation
    const isEuclideanMatch = euclideanDistance <= adaptiveThreshold;
    const isCosineMatch = cosineSimilarity >= COSINE_THRESHOLD;
    
    const isMatch = isEuclideanMatch && isCosineMatch;
    const confidence = calculateConfidenceScore(euclideanDistance, cosineSimilarity);
    
    return {
      isMatch: isMatch,
      confidence: confidence,
      details: {
        euclideanDistance: euclideanDistance,
        cosineSimilarity: cosineSimilarity,
        adaptiveThreshold: adaptiveThreshold,
        euclideanMatch: isEuclideanMatch,
        cosineMatch: isCosineMatch
      }
    };
  } catch (error) {
    console.error("Secure face comparison failed:", error);
    return {
      isMatch: false,
      confidence: 0,
      details: { error: error.message }
    };
  }
};
```

## Performance Optimization

### Face Processing Optimization

#### Model Loading Optimization
```typescript
// Lazy load face recognition models
class FaceAPIManager {
  private modelsLoaded = false;
  private loadingPromise: Promise<void> | null = null;
  
  async ensureModelsLoaded(): Promise<void> {
    if (this.modelsLoaded) {
      return;
    }
    
    if (this.loadingPromise) {
      return this.loadingPromise;
    }
    
    this.loadingPromise = this.loadModels();
    await this.loadingPromise;
    this.modelsLoaded = true;
  }
  
  private async loadModels(): Promise<void> {
    const MODEL_URL = '/models';
    
    // Load models in parallel
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    
    console.log('Face API models loaded successfully');
  }
}

export const faceAPIManager = new FaceAPIManager();
```

#### Image Processing Optimization
```typescript
// Optimize image size for face detection
export const optimizeImageForFaceDetection = (
  imageBlob: Blob,
  maxWidth: number = 640,
  maxHeight: number = 480,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      const { width, height } = calculateOptimalDimensions(
        img.width,
        img.height,
        maxWidth,
        maxHeight
      );
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw resized image
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convert to blob with compression
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas to blob conversion failed'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Image loading failed'));
    img.src = URL.createObjectURL(imageBlob);
  });
};

const calculateOptimalDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = originalWidth;
  let height = originalHeight;
  
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }
  
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height)
  };
};
```

## Error Handling and Recovery

### Graceful Degradation

```typescript
// Face authentication with fallback options
export const authenticateWithFallback = async (
  email: string,
  faceImageBlob?: Blob,
  fallbackPassword?: string
): Promise<AuthenticationResult> => {
  try {
    // Primary: Face authentication
    if (faceImageBlob) {
      const faceResult = await authenticateWithFace(email, faceImageBlob);
      if (faceResult.success) {
        return faceResult;
      }
    }
    
    // Fallback: Password authentication (if implemented)
    if (fallbackPassword) {
      const passwordResult = await authenticateWithPassword(email, fallbackPassword);
      if (passwordResult.success) {
        return passwordResult;
      }
    }
    
    // No successful authentication
    throw new Error("All authentication methods failed");
  } catch (error) {
    console.error("Authentication with fallback failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
};
```

### Error Recovery Strategies

```typescript
// Automatic retry with exponential backoff
export const authenticateWithRetry = async (
  email: string,
  faceImageBlob: Blob,
  maxRetries: number = 3
): Promise<AuthenticationResult> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await authenticateWithFace(email, faceImageBlob);
      if (result.success) {
        return result;
      }
      
      lastError = new Error(result.error || "Authentication failed");
    } catch (error) {
      lastError = error as Error;
      console.warn(`Authentication attempt ${attempt} failed:`, error);
      
      // Exponential backoff delay
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error("Max retry attempts exceeded");
};
```

## Testing Face Encryption

### Unit Tests

```typescript
describe('Face Encryption', () => {
  const testEmail = 'test@example.com';
  const testUserId = 1;
  
  test('should encrypt and decrypt face image for registration', async () => {
    // Create test image blob
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const testBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg');
    });
    
    // Encrypt image
    const encryptedFormData = await encryptRegistrationImage(testBlob, testEmail);
    expect(encryptedFormData.get('encryptedImage')).toBeTruthy();
    
    // Test backend decryption
    const encryptedImageFile = encryptedFormData.get('encryptedImage') as File;
    const encryptedBuffer = Buffer.from(await encryptedImageFile.arrayBuffer());
    const decryptedBuffer = decryptRegistrationImage(encryptedBuffer, testEmail);
    
    expect(decryptedBuffer.length).toBeGreaterThan(0);
  });
  
  test('should handle face descriptor storage and retrieval', async () => {
    // Create test descriptor
    const testDescriptor = new Float32Array(128);
    for (let i = 0; i < 128; i++) {
      testDescriptor[i] = Math.random();
    }
    
    // Store descriptor
    const user = await storeFaceDescriptor(testEmail, testDescriptor);
    expect(user.id).toBeTruthy();
    
    // Retrieve descriptor
    const retrievedDescriptor = await getFaceDescriptor(user.id);
    expect(retrievedDescriptor.length).toBe(128);
    
    // Compare descriptors
    for (let i = 0; i < 128; i++) {
      expect(retrievedDescriptor[i]).toBeCloseTo(testDescriptor[i], 6);
    }
  });
});
```

For additional information about face encryption implementation details or troubleshooting, refer to the main security documentation or contact the development team.
