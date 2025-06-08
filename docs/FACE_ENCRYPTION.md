# Face Encryption Documentation

Complete guide to facial recognition and biometric data encryption implementation.

## Overview

The application implements secure face recognition with:

- AES-256 encryption for biometric data transmission
- Mathematical descriptors storage (no raw images)
- User-specific encryption keys
- Temporary keys for registration process

## Face Processing Pipeline

```
Camera → Face Detection → Descriptor Extraction → Encryption → Storage
```

## Face-API.js Integration

### Model Loading and Detection

```typescript
import * as faceapi from 'face-api.js';

// Load required models
export const loadFaceAPIModels = async (): Promise<void> => {
  const MODEL_URL = '/models';
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
};

// Face detection
const faceDetectionOptions = new faceapi.SsdMobilenetv1Options({
  minConfidence: 0.5,
  maxResults: 1,
});
```

### Face Descriptor Extraction

```typescript
export const extractFaceDescriptor = async (
  imageElement: HTMLVideoElement | HTMLImageElement
): Promise<Float32Array | null> => {
  const detection = await faceapi
    .detectSingleFace(imageElement, faceDetectionOptions)
    .withFaceLandmarks()
    .withFaceDescriptor();

  return detection?.descriptor || null;
};
```

## Face Data Encryption

### Registration Process

```typescript
// Encrypt face image for registration
export const encryptFaceForRegistration = (faceImageBase64: string, email: string): string => {
  const tempKey = generateTempEncryptionKey(email);
  return CryptoJS.AES.encrypt(faceImageBase64, tempKey).toString();
};

const generateTempEncryptionKey = (email: string): string => {
  return CryptoJS.SHA256(`temp-face-key-${email}-${Date.now()}`).toString();
};
```

### Authenticated Operations

```typescript
// User-specific face encryption
export const encryptFaceForUser = (
  faceDescriptor: Float32Array,
  userId: number,
  email: string
): string => {
  const key = getUserFaceEncryptionKey(userId, email);
  const descriptorString = Array.from(faceDescriptor).join(',');
  return CryptoJS.AES.encrypt(descriptorString, key).toString();
};

const getUserFaceEncryptionKey = (userId: number, email: string): string => {
  const appSecret = process.env.APP_SECRET_KEY;
  return CryptoJS.SHA256(`face-${userId}-${email}-${appSecret}`).toString();
};
```

## Face Comparison and Authentication

### Descriptor Comparison

```typescript
export const compareFaceDescriptors = (
  descriptor1: Float32Array,
  descriptor2: Float32Array,
  threshold: number = 0.6
): boolean => {
  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
  return distance <= threshold;
};
```

### Authentication Flow

```typescript
export const authenticateWithFace = async (
  videoElement: HTMLVideoElement,
  storedDescriptor: string,
  userId: number,
  email: string
): Promise<boolean> => {
  // Extract current face descriptor
  const currentDescriptor = await extractFaceDescriptor(videoElement);
  if (!currentDescriptor) return false;

  // Decrypt stored descriptor
  const key = getUserFaceEncryptionKey(userId, email);
  const decryptedData = CryptoJS.AES.decrypt(storedDescriptor, key).toString(CryptoJS.enc.Utf8);
  const storedArray = new Float32Array(decryptedData.split(',').map(Number));

  // Compare descriptors
  return compareFaceDescriptors(currentDescriptor, storedArray);
};
```

## Security Considerations

### Data Protection

- **No Image Storage**: Only mathematical descriptors are stored
- **Encryption at Rest**: All biometric data encrypted in database
- **Transmission Security**: Encrypted data transfer over HTTPS
- **Key Rotation**: Support for encryption key updates

### Privacy Features

- **Temporary Data**: Face images discarded after processing
- **User Control**: Users can delete biometric data anytime
- **Minimal Data**: Only essential biometric features stored
- **Local Processing**: Face detection happens client-side

## Frontend Implementation

### Face Capture Component

```typescript
export const FaceCapture: React.FC<FaceCaptureProps> = ({
  onFaceDetected,
  onError
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const captureFrame = useCallback(async () => {
    if (!videoRef.current) return;

    setIsProcessing(true);
    try {
      const descriptor = await extractFaceDescriptor(videoRef.current);
      if (descriptor) {
        onFaceDetected(descriptor);
      }
    } catch (error) {
      onError(error);
    } finally {
      setIsProcessing(false);
    }
  }, [onFaceDetected, onError]);

  return (
    <div className="face-capture">
      <video ref={videoRef} autoPlay muted />
      <button onClick={captureFrame} disabled={isProcessing}>
        {isProcessing ? 'Processing...' : 'Capture Face'}
      </button>
    </div>
  );
};
```

## Backend API Integration

### Face Registration Endpoint

```typescript
app.post('/api/auth/register-face', async (req, res) => {
  const { email, encryptedFaceData } = req.body;

  try {
    // Decrypt face data with temporary key
    const tempKey = generateTempEncryptionKey(email);
    const faceData = CryptoJS.AES.decrypt(encryptedFaceData, tempKey).toString(CryptoJS.enc.Utf8);

    // Process and store descriptor
    const user = await prisma.user.update({
      where: { email },
      data: { faceDescriptor: faceData },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Face registration failed' });
  }
});
```

## Performance Optimizations

- **Model Caching**: Face detection models loaded once
- **Worker Threads**: Heavy processing in web workers
- **Descriptor Compression**: Optimized storage format
- **Batch Processing**: Multiple face operations grouped

## Error Handling

- **No Face Detected**: Graceful fallback to manual entry
- **Poor Lighting**: Quality feedback to user
- **Multiple Faces**: Clear single-face requirement
- **Model Loading**: Progressive loading with indicators

See [SECURITY.md](./SECURITY.md) for additional security details.
