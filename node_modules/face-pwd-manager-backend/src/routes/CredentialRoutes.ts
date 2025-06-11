// src/routes/credentials.ts
import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticateJWT } from '../middleware/auth';
import { authorizeCredentialAccess, authorizeOwnCredentials } from '../middleware/authorize';
import { CredentialCreateSchema, CredentialUpdateSchema } from '../schemas/CredentialSchema';
import { ServiceError } from '../services/ServiceError';
import {
  createCredential,
  deleteCredential,
  getCredentialById,
  getCredentialsByUserId,
  updateCredential,
} from '../services/credential.service';

const router = Router();

// All credential routes require authentication
router.use(authenticateJWT);

/**
 * GET /credentials
 * Retrieve all credentials for the authenticated user.
 */
router.get(
  '/',
  authorizeOwnCredentials,
  asyncHandler(async (req, res) => {
    const credentials = await getCredentialsByUserId(+req.params.userId);
    res.json(credentials);
  })
);

/**
 * GET /credentials/user/:userId
 * Retrieve all credentials for a specific user (only if it's the authenticated user).
 */
router.get(
  '/user/:userId',
  asyncHandler(async (req, res) => {
    const requestedUserId = +req.params.userId;
    const authenticatedUserId = req.user!.id;

    // Ensure user can only access their own credentials
    if (requestedUserId !== authenticatedUserId) {
      throw ServiceError.forbidden('Access denied. You can only access your own credentials.');
    }

    const credentials = await getCredentialsByUserId(requestedUserId);
    res.json(credentials);
  })
);

/**
 * GET /credentials/:id
 * Retrieve a specific credential by its id (only if it belongs to the authenticated user).
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = +req.params.id;
    const userId = req.user!.id;
    const credential = await getCredentialById(id, userId);
    res.json(credential);
  })
);

/**
 * POST /credentials
 * Create a new credential for the authenticated user.
 */
router.post(
  '/',
  authorizeCredentialAccess,
  asyncHandler(async (req, res) => {
    const validated = CredentialCreateSchema.parse(req.body);
    const newCredential = await createCredential(validated);
    res.status(201).json(newCredential);
  })
);

/**
 * PUT /credentials/:id
 * Update an existing credential (only if it belongs to the authenticated user).
 */
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = +req.params.id;
    const userId = req.user!.id;
    const validated = CredentialUpdateSchema.parse(req.body);
    const updated = await updateCredential(id, validated, userId);
    res.status(200).json(updated);
  })
);

/**
 * DELETE /credentials/:id
 * Delete a credential (only if it belongs to the authenticated user).
 */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = +req.params.id;
    const userId = req.user!.id;
    const deletedCredential = await deleteCredential(id, userId);
    res.status(204).json(deletedCredential);
  })
);

export default router;
