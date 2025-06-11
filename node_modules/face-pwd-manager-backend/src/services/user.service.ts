// src/services/user.service.ts
import { Canvas, Image, createCanvas, loadImage } from 'canvas';
import * as faceapi from 'face-api.js';
import jwt from 'jsonwebtoken';
import path from 'path';

import { getFaceDetectionConfig } from '../config/faceDetectionConfig';
import prisma from '../db';
import { handleDbError } from '../middleware/handleDbError';
import { NewUserEntry } from '../models/User';
import { decryptSelfieImage, decryptUserSelfieImage } from '../utils/imageDecryptionUtils';
import { ServiceError } from './ServiceError';

// Assign the canvas implementations to faceapi
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
faceapi.env.monkeyPatch({ Canvas, Image });

// Get optimized face detection configuration
const faceConfig = getFaceDetectionConfig();
console.log('🔧 Face detection config:', {
  inputSize: faceConfig.inputSize,
  scoreThreshold: faceConfig.scoreThreshold,
  maxImageDimension: faceConfig.maxImageDimension,
  faceMatchThreshold: faceConfig.faceMatchThreshold,
});

// Optimized TinyFaceDetector options for faster authentication
const detectorOptions = new faceapi.TinyFaceDetectorOptions({
  inputSize: faceConfig.inputSize,
  scoreThreshold: faceConfig.scoreThreshold,
});

async function downscaleBuffer(buffer: Buffer, maxDim = faceConfig.maxImageDimension) {
  try {
    // Validate buffer before processing
    if (!buffer || buffer.length === 0) {
      throw new Error('Empty buffer provided to downscaleBuffer');
    }

    // Try to load the image
    const img = await loadImage(buffer);

    // For face detection, we can be more aggressive with downscaling
    const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1);
    const w = Math.round(img.width * ratio);
    const h = Math.round(img.height * ratio);
    const canvas = createCanvas(w, h);

    // Use faster drawing context settings
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false; // Disable antialiasing for speed
    ctx.drawImage(img, 0, 0, w, h);
    return canvas;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to process image: ${errorMessage}`);
  }
}

let modelsLoaded = false;
let modelsLoadingPromise: Promise<void> | null = null;

export async function loadModelsOnce() {
  if (modelsLoaded) return;

  // Prevent multiple concurrent loading attempts
  if (modelsLoadingPromise) {
    return modelsLoadingPromise;
  }

  modelsLoadingPromise = (async () => {
    const modelPath = path.join(__dirname, '../../public/models');
    console.log('🔄 Loading Face API models...');
    const startTime = Date.now();

    // Load models in parallel for faster startup
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath),
      faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath),
      faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath),
    ]);

    modelsLoaded = true;
    const loadTime = Date.now() - startTime;
    console.log(`✅ Face API models loaded in ${loadTime}ms`);
  })();

  return modelsLoadingPromise;
}

async function userExists(id: number): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw ServiceError.notFound(`User with id ${id} not found`);
  }
}

export async function registerUserWithImage(data: NewUserEntry, file: Express.Multer.File) {
  try {
    if (!file) throw ServiceError.validationFailed('Selfie image is required');

    // Check if we received an encrypted image
    let fileBuffer = file.buffer;
    const encryptedImage = file.fieldname === 'encryptedImage';
    if (encryptedImage) {
      try {
        // Decrypt the selfie image
        fileBuffer = decryptSelfieImage(fileBuffer, data.email);
      } catch {
        throw ServiceError.validationFailed('Failed to decrypt image data');
      }
    }

    // Process the face image
    await loadModelsOnce();
    const canvas = await downscaleBuffer(fileBuffer);
    const faceDetection = await faceapi
      .detectSingleFace(canvas as unknown as HTMLCanvasElement, detectorOptions)
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (!faceDetection) {
      throw ServiceError.validationFailed(
        'No face detected in the image. Please ensure your face is clearly visible and well-lit, then try again.'
      );
    }

    // Store only the face descriptor as native JSON array
    const faceDescriptorArray = Array.from(faceDetection.descriptor);

    // Create the user with face descriptor only
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        faceDescriptor: faceDescriptorArray,
      },
    });

    return newUser;
  } catch (err) {
    throw handleDbError(err);
  }
}

export async function authenticateWithFace(email: string, file?: Express.Multer.File) {
  try {
    if (!file) throw ServiceError.validationFailed('Selfie is required');

    // Find user & ensure descriptor exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw ServiceError.notFound(`User ${email} not found`);
    if (!user.faceDescriptor) {
      throw ServiceError.validationFailed(
        'No registered face found for this user. Please contact support to re-register your account.'
      );
    }

    // Check if we received an encrypted image
    let fileBuffer = file.buffer;
    const encryptedImage = file.fieldname === 'encryptedImage';

    if (encryptedImage) {
      try {
        // Try to decrypt using the user-specific key
        if (user && user.id) {
          fileBuffer = decryptUserSelfieImage(fileBuffer, user.id, email);
        } else {
          fileBuffer = decryptSelfieImage(fileBuffer, email);
        }
      } catch {
        throw ServiceError.validationFailed('Failed to decrypt image data');
      }
    }

    // Load models and process image (optimized for performance)
    await loadModelsOnce();
    const selfieCanvas = await downscaleBuffer(fileBuffer);
    const selfieDet = await faceapi
      .detectSingleFace(selfieCanvas as unknown as HTMLCanvasElement, detectorOptions)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!selfieDet)
      throw ServiceError.validationFailed(
        'No face detected in the image. Please ensure your face is clearly visible and well-lit, then try again.'
      );

    // Compare to stored descriptor (native JSON array)
    const stored = user.faceDescriptor as number[];
    const storedDescriptor = new Float32Array(stored);
    const distance = faceapi.euclideanDistance(storedDescriptor, selfieDet.descriptor);

    if (distance > faceConfig.faceMatchThreshold) {
      throw ServiceError.validationFailed(
        "Face verification failed. The face in the image doesn't match your registered face. Please try again or contact support if this continues."
      );
    }

    if (!process.env.JWT_SECRET) {
      throw ServiceError.validationFailed('JWT_SECRET environment variable is not defined');
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '24h',
      algorithm: 'HS256',
    });

    return {
      user: { id: user.id, email: user.email },
      token,
    };
  } catch (err) {
    throw handleDbError(err);
  }
}

export async function getAllUsers() {
  try {
    return await prisma.user.findMany();
  } catch (err) {
    throw handleDbError(err);
  }
}

export async function getUserById(id: number) {
  try {
    await userExists(id);
    return await prisma.user.findUnique({ where: { id } });
  } catch (err) {
    throw handleDbError(err);
  }
}

export async function deleteUser(id: number) {
  try {
    await userExists(id);
    return await prisma.user.delete({ where: { id } });
  } catch (err) {
    throw handleDbError(err);
  }
}
