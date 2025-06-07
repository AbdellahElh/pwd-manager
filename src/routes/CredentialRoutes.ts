// src/routes/credentials.ts
import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import {
  CredentialCreateSchema,
  CredentialUpdateSchema,
} from "../schemas/CredentialSchema";
import {
  createCredential,
  deleteCredential,
  getAllCredentials,
  getCredentialById,
  getCredentialsByUserId,
  updateCredential,
} from "../services/credential.service";

const router = Router();

// Protect all credential routes with JWT authentication
// router.use(authenticateJWT as any);

/**
 * GET /credentials
 * Retrieve all credentials.
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const credentials = await getAllCredentials();
    res.json(credentials);
  })
);

/**
 * GET /credentials/:id
 * Retrieve a specific credential by its id.
 */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = +req.params.id;
    const credential = await getCredentialById(id);
    res.json(credential);
  })
);

/**
 * GET /credentials/user/:userId
 * Retrieve all credentials for a specific user.
 */
router.get(
  "/user/:userId",
  asyncHandler(async (req, res) => {
    const userId = +req.params.userId;
    const credentials = await getCredentialsByUserId(userId);
    res.json(credentials);
  })
);

/**
 * POST /credentials
 * Create a new credential.
 */
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const validated = CredentialCreateSchema.parse(req.body);
    const newCredential = await createCredential(validated);
    res.status(201).json(newCredential);
  })
);

/**
 * PUT /credentials/:id
 * Update an existing credential.
 */
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = +req.params.id;
    const validated = CredentialUpdateSchema.parse(req.body);
    const updated = await updateCredential(id, validated as any);
    res.status(200).json(updated);
  })
);

/**
 * DELETE /credentials/:id
 * Delete a credential.
 */
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = +req.params.id;
    const deletedCredential = await deleteCredential(id);
    res.status(204).json(deletedCredential);
  })
);

export default router;
