"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/credentials.ts
const express_1 = require("express");
const asyncHandler_1 = require("../middleware/asyncHandler");
const CredentialSchema_1 = require("../schemas/CredentialSchema");
const credential_service_1 = require("../services/credential.service");
const router = (0, express_1.Router)();
// Protect all credential routes with JWT authentication
// router.use(authenticateJWT as any);
/**
 * GET /credentials
 * Retrieve all credentials.
 */
router.get("/", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const credentials = await (0, credential_service_1.getAllCredentials)();
    res.json(credentials);
}));
/**
 * GET /credentials/:id
 * Retrieve a specific credential by its id.
 */
router.get("/:id", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = +req.params.id;
    const credential = await (0, credential_service_1.getCredentialById)(id);
    res.json(credential);
}));
/**
 * GET /credentials/user/:userId
 * Retrieve all credentials for a specific user.
 */
router.get("/user/:userId", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = +req.params.userId;
    const credentials = await (0, credential_service_1.getCredentialsByUserId)(userId);
    res.json(credentials);
}));
/**
 * POST /credentials
 * Create a new credential.
 */
router.post("/", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const validated = CredentialSchema_1.CredentialCreateSchema.parse(req.body);
    const newCredential = await (0, credential_service_1.createCredential)(validated);
    res.status(201).json(newCredential);
}));
/**
 * PUT /credentials/:id
 * Update an existing credential.
 */
router.put("/:id", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = +req.params.id;
    const validated = CredentialSchema_1.CredentialUpdateSchema.parse(req.body);
    const updated = await (0, credential_service_1.updateCredential)(id, validated);
    res.status(200).json(updated);
}));
/**
 * DELETE /credentials/:id
 * Delete a credential.
 */
router.delete("/:id", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = +req.params.id;
    const deletedCredential = await (0, credential_service_1.deleteCredential)(id);
    res.status(204).json(deletedCredential);
}));
exports.default = router;
