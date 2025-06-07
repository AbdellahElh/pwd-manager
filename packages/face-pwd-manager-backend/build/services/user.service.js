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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadModelsOnce = loadModelsOnce;
exports.registerUserWithImage = registerUserWithImage;
exports.authenticateWithFace = authenticateWithFace;
exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.deleteUser = deleteUser;
// src/services/user.service.ts
const canvas_1 = require("canvas");
const faceapi = __importStar(require("face-api.js"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
const db_1 = __importDefault(require("../db"));
const handleDbError_1 = require("../middleware/handleDbError");
const imageDecryptionUtils_1 = require("../utils/imageDecryptionUtils");
const ServiceError_1 = require("./ServiceError");
// Assign the canvas implementations to faceapi
// @ts-ignore
faceapi.env.monkeyPatch({ Canvas: canvas_1.Canvas, Image: canvas_1.Image });
// TinyFaceDetector options (faster)
const detectorOptions = new faceapi.TinyFaceDetectorOptions({
    inputSize: 160,
    scoreThreshold: 0.5,
});
async function downscaleBuffer(buffer, maxDim = 600) {
    try {
        // Validate buffer before processing
        if (!buffer || buffer.length === 0) {
            throw new Error("Empty buffer provided to downscaleBuffer");
        } // Attempt to determine image format by examining buffer headers
        let format = "unknown";
        if (buffer[0] === 0xff && buffer[1] === 0xd8) {
            format = "jpeg";
        }
        else if (buffer[0] === 0x89 &&
            buffer[1] === 0x50 &&
            buffer[2] === 0x4e &&
            buffer[3] === 0x47) {
            format = "png";
        }
        // Try to load the image
        const img = await (0, canvas_1.loadImage)(buffer);
        const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = (0, canvas_1.createCanvas)(w, h);
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        return canvas;
    }
    catch (error) {
        throw new Error(`Failed to process image: ${error.message}`);
    }
}
let modelsLoaded = false;
async function loadModelsOnce() {
    if (modelsLoaded)
        return;
    const modelPath = path_1.default.join(__dirname, "../../public/models");
    await faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
    modelsLoaded = true;
    console.log("✅ Face API models loaded");
}
async function userExists(id) {
    const user = await db_1.default.user.findUnique({ where: { id } });
    if (!user) {
        throw ServiceError_1.ServiceError.notFound(`User with id ${id} not found`);
    }
}
async function registerUserWithImage(data, file) {
    try {
        if (!file)
            throw ServiceError_1.ServiceError.validationFailed("Selfie image is required");
        // Check if we received an encrypted image
        let fileBuffer = file.buffer;
        const encryptedImage = file.fieldname === "encryptedImage";
        if (encryptedImage) {
            try {
                // Decrypt the selfie image
                fileBuffer = (0, imageDecryptionUtils_1.decryptSelfieImage)(fileBuffer, data.email);
            }
            catch (decryptError) {
                throw ServiceError_1.ServiceError.validationFailed("Failed to decrypt image data");
            }
        }
        // Process the face image
        await loadModelsOnce();
        const canvas = await downscaleBuffer(fileBuffer);
        const faceDetection = await faceapi
            .detectSingleFace(canvas, detectorOptions)
            .withFaceLandmarks()
            .withFaceDescriptor();
        if (!faceDetection) {
            throw ServiceError_1.ServiceError.validationFailed("No face detected in the image. Please ensure your face is clearly visible and well-lit, then try again.");
        }
        // Store only the face descriptor as native JSON array
        const faceDescriptorArray = Array.from(faceDetection.descriptor);
        // Create the user with face descriptor only
        const newUser = await db_1.default.user.create({
            data: {
                email: data.email,
                faceDescriptor: faceDescriptorArray,
            },
        });
        return newUser;
    }
    catch (err) {
        throw (0, handleDbError_1.handleDbError)(err);
    }
}
async function authenticateWithFace(email, file) {
    try {
        if (!file)
            throw ServiceError_1.ServiceError.validationFailed("Selfie is required");
        // Find user & ensure descriptor exists
        const user = await db_1.default.user.findUnique({ where: { email } });
        if (!user)
            throw ServiceError_1.ServiceError.notFound(`User ${email} not found`);
        if (!user.faceDescriptor) {
            throw ServiceError_1.ServiceError.validationFailed("No registered face found for this user. Please contact support to re-register your account.");
        }
        // Check if we received an encrypted image
        let fileBuffer = file.buffer;
        const encryptedImage = file.fieldname === "encryptedImage";
        if (encryptedImage) {
            try {
                // Try to decrypt using the user-specific key
                if (user && user.id) {
                    fileBuffer = (0, imageDecryptionUtils_1.decryptUserSelfieImage)(fileBuffer, user.id, email);
                }
                else {
                    fileBuffer = (0, imageDecryptionUtils_1.decryptSelfieImage)(fileBuffer, email);
                }
            }
            catch (decryptError) {
                throw ServiceError_1.ServiceError.validationFailed("Failed to decrypt image data");
            }
        }
        // Downscale selfie & detect
        await loadModelsOnce();
        const selfieCanvas = await downscaleBuffer(fileBuffer);
        const selfieDet = await faceapi
            .detectSingleFace(selfieCanvas, detectorOptions)
            .withFaceLandmarks()
            .withFaceDescriptor();
        if (!selfieDet)
            throw ServiceError_1.ServiceError.validationFailed("No face detected in the image. Please ensure your face is clearly visible and well-lit, then try again.");
        // Compare to stored descriptor (native JSON array)
        const stored = user.faceDescriptor;
        const storedDescriptor = new Float32Array(stored);
        const distance = faceapi.euclideanDistance(storedDescriptor, selfieDet.descriptor);
        if (distance > 0.6) {
            throw ServiceError_1.ServiceError.validationFailed("Face verification failed. The face in the image doesn't match your registered face. Please try again or contact support if this continues.");
        }
        if (!process.env.JWT_SECRET) {
            throw ServiceError_1.ServiceError.validationFailed("JWT_SECRET environment variable is not defined");
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);
        return {
            user: { id: user.id, email: user.email },
            token,
        };
    }
    catch (err) {
        throw (0, handleDbError_1.handleDbError)(err);
    }
}
async function getAllUsers() {
    try {
        return await db_1.default.user.findMany();
    }
    catch (err) {
        throw (0, handleDbError_1.handleDbError)(err);
    }
}
async function getUserById(id) {
    try {
        await userExists(id);
        return await db_1.default.user.findUnique({ where: { id } });
    }
    catch (err) {
        throw (0, handleDbError_1.handleDbError)(err);
    }
}
async function deleteUser(id) {
    try {
        await userExists(id);
        return await db_1.default.user.delete({ where: { id } });
    }
    catch (err) {
        throw (0, handleDbError_1.handleDbError)(err);
    }
}
