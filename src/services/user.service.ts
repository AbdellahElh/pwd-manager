// src/services/user.service.ts
import { Canvas, Image, createCanvas, loadImage } from "canvas";
import * as faceapi from "face-api.js";
import jwt from "jsonwebtoken";
import path from "path";

import prisma from "../db";
import { handleDbError } from "../middleware/handleDbError";
import { NewUserEntry } from "../models/User";
import {
  decryptSelfieImage,
  decryptUserSelfieImage,
} from "../utils/imageDecryptionUtils";
import { ServiceError } from "./ServiceError";

// Assign the canvas implementations to faceapi
// @ts-ignore
faceapi.env.monkeyPatch({ Canvas, Image });

// TinyFaceDetector options (faster)
const detectorOptions = new faceapi.TinyFaceDetectorOptions({
  inputSize: 160,
  scoreThreshold: 0.5,
});

async function downscaleBuffer(buffer: Buffer, maxDim = 600) {
  try {
    // Validate buffer before processing
    if (!buffer || buffer.length === 0) {
      throw new Error("Empty buffer provided to downscaleBuffer");
    } // Attempt to determine image format by examining buffer headers
    let format = "unknown";
    if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      format = "jpeg";
    } else if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      format = "png";
    }

    // Try to load the image
    const img = await loadImage(buffer);

    const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1);
    const w = Math.round(img.width * ratio);
    const h = Math.round(img.height * ratio);
    const canvas = createCanvas(w, h);
    canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
    return canvas;
  } catch (error: any) {
    throw new Error(`Failed to process image: ${error.message}`);
  }
}

let modelsLoaded = false;
export async function loadModelsOnce() {
  if (modelsLoaded) return;
  const modelPath = path.join(__dirname, "../../public/models");
  await faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
  modelsLoaded = true;
  console.log("✅ Face API models loaded");
}

async function userExists(id: number): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw ServiceError.notFound(`User with id ${id} not found`);
  }
}

export async function registerUserWithImage(
  data: NewUserEntry,
  file: Express.Multer.File
) {
  try {
    if (!file) throw ServiceError.validationFailed("Selfie image is required");

    // Check if we received an encrypted image
    let fileBuffer = file.buffer;
    const encryptedImage = file.fieldname === "encryptedImage";
    if (encryptedImage) {
      try {
        // Decrypt the selfie image
        fileBuffer = decryptSelfieImage(fileBuffer, data.email);
      } catch (decryptError) {
        throw ServiceError.validationFailed("Failed to decrypt image data");
      }
    }

    // Process the face image
    await loadModelsOnce();
    const canvas = await downscaleBuffer(fileBuffer);
    const faceDetection = await faceapi
      .detectSingleFace(canvas as any, detectorOptions)
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (!faceDetection) {
      throw ServiceError.validationFailed(
        "No face detected in the image. Please ensure your face is clearly visible and well-lit, then try again."
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

export async function authenticateWithFace(
  email: string,
  file?: Express.Multer.File
) {
  try {
    if (!file) throw ServiceError.validationFailed("Selfie is required");

    // Find user & ensure descriptor exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw ServiceError.notFound(`User ${email} not found`);
    if (!user.faceDescriptor) {
      throw ServiceError.validationFailed(
        "No registered face found for this user. Please contact support to re-register your account."
      );
    }

    // Check if we received an encrypted image
    let fileBuffer = file.buffer;
    const encryptedImage = file.fieldname === "encryptedImage";

    if (encryptedImage) {
      try {
        // Try to decrypt using the user-specific key
        if (user && user.id) {
          fileBuffer = decryptUserSelfieImage(fileBuffer, user.id, email);
        } else {
          fileBuffer = decryptSelfieImage(fileBuffer, email);
        }
      } catch (decryptError) {
        throw ServiceError.validationFailed("Failed to decrypt image data");
      }
    }

    // Downscale selfie & detect
    await loadModelsOnce();
    const selfieCanvas = await downscaleBuffer(fileBuffer);
    const selfieDet = await faceapi
      .detectSingleFace(selfieCanvas as any, detectorOptions)
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (!selfieDet)
      throw ServiceError.validationFailed(
        "No face detected in the image. Please ensure your face is clearly visible and well-lit, then try again."
      );

    // Compare to stored descriptor (native JSON array)
    const stored = user.faceDescriptor as number[];
    const storedDescriptor = new Float32Array(stored);
    const distance = faceapi.euclideanDistance(
      storedDescriptor,
      selfieDet.descriptor
    );
    if (distance > 0.6) {
      throw ServiceError.validationFailed(
        "Face verification failed. The face in the image doesn't match your registered face. Please try again or contact support if this continues."
      );
    }

    if (!process.env.JWT_SECRET) {
      throw ServiceError.validationFailed(
        "JWT_SECRET environment variable is not defined"
      );
    }
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET
    );
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
