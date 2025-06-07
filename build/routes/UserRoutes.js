"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/users.ts
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const asyncHandler_1 = require("../middleware/asyncHandler");
const UserSchema_1 = require("../schemas/UserSchema");
const ServiceError_1 = require("../services/ServiceError");
const user_service_1 = require("../services/user.service");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.get("/", (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    res.json(await (0, user_service_1.getAllUsers)());
}));
// Get by id
router.get("/:id", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    res.json(await (0, user_service_1.getUserById)(+req.params.id));
}));
// Register → email + selfie (supporting both encrypted and unencrypted images)
router.post("/register", upload.fields([
    { name: "selfie", maxCount: 1 },
    { name: "encryptedImage", maxCount: 1 },
    { name: "originalImage", maxCount: 1 },
]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = UserSchema_1.UserEmailSchema.parse(req.body);
    const files = req.files;
    // Get the encrypted image file if provided
    const encryptedImageFile = files?.encryptedImage?.[0];
    const selfieFile = files?.selfie?.[0];
    // Use the encrypted image file if available, otherwise use the selfie file
    if (encryptedImageFile) {
        // Use the encrypted image file directly
        const virtualFile = {
            ...encryptedImageFile,
            fieldname: "encryptedImage", // Make sure the fieldname is set correctly
        };
        const user = await (0, user_service_1.registerUserWithImage)({ email }, virtualFile);
        res.status(201).json(user);
    }
    else if (selfieFile) {
        // Use the selfie file if no encrypted image
        const user = await (0, user_service_1.registerUserWithImage)({ email }, selfieFile);
        res.status(201).json(user);
    }
    else {
        // Neither encrypted image nor selfie file provided
        throw ServiceError_1.ServiceError.validationFailed("No selfie provided for registration. Please capture a photo to create your account.");
    }
}));
// Login → email + selfie (supporting both encrypted and unencrypted images)
router.post("/login", upload.fields([
    { name: "selfie", maxCount: 1 },
    { name: "encryptedImage", maxCount: 1 },
    { name: "originalImage", maxCount: 1 },
]), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = UserSchema_1.UserEmailSchema.parse(req.body);
    const files = req.files;
    // Get the encrypted image file if provided
    const encryptedImageFile = files?.encryptedImage?.[0];
    const selfieFile = files?.selfie?.[0];
    // Use the encrypted image file if available, otherwise use the selfie file
    if (encryptedImageFile) {
        // Pass the encrypted image file directly to the service
        const virtualFile = {
            ...encryptedImageFile,
            fieldname: "encryptedImage", // Make sure the fieldname is set correctly
        };
        const result = await (0, user_service_1.authenticateWithFace)(email, virtualFile);
        res.json(result);
    }
    else if (selfieFile) {
        // Use the selfie file if no encrypted image
        const result = await (0, user_service_1.authenticateWithFace)(email, selfieFile);
        res.json(result);
    }
    else {
        // Neither encrypted image nor selfie file provided
        throw ServiceError_1.ServiceError.validationFailed("No selfie provided for authentication. Please capture a photo to login.");
    }
}));
// Delete
router.delete("/:id", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    res.json(await (0, user_service_1.deleteUser)(+req.params.id));
}));
exports.default = router;
