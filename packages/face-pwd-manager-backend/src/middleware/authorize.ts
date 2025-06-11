// src/middleware/authorize.ts
import { NextFunction, Request, Response } from 'express';

/**
 * Middleware to ensure users can only access their own data
 * Must be used after authenticateJWT middleware
 */
export const authorizeUser = (req: Request, res: Response, next: NextFunction): void => {
  // Get the user ID from the JWT payload (set by authenticateJWT)
  const authenticatedUserId = req.user?.id;

  if (!authenticatedUserId) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  // Get the user ID from the route parameter
  const requestedUserId = req.params.id ? parseInt(req.params.id, 10) : null;

  // If there's a user ID in the route, check if it matches the authenticated user
  if (requestedUserId && requestedUserId !== authenticatedUserId) {
    res.status(403).json({
      message: 'Access denied. You can only access your own data.',
    });
    return;
  }

  next();
};

/**
 * Middleware to get current user profile (no ID parameter needed)
 * Only allows access to the authenticated user's own profile
 */
export const authorizeOwnProfile = (req: Request, res: Response, next: NextFunction): void => {
  const authenticatedUserId = req.user?.id;

  if (!authenticatedUserId) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  // Add the authenticated user's ID to params for service methods
  req.params.id = authenticatedUserId.toString();
  next();
};

/**
 * Middleware for credential operations - ensures users can only access their own credentials
 * Must be used after authenticateJWT middleware
 */
export const authorizeCredentialAccess = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authenticatedUserId = req.user?.id;

  if (!authenticatedUserId) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  // For credential creation, the userId should match the authenticated user
  if (req.method === 'POST' && req.body.userId && req.body.userId !== authenticatedUserId) {
    res.status(403).json({
      message: 'Access denied. You can only create credentials for yourself.',
    });
    return;
  }

  // For credential creation without userId in body, set it to authenticated user
  if (req.method === 'POST' && !req.body.userId) {
    req.body.userId = authenticatedUserId;
  }

  next();
};

/**
 * Middleware to get user's own credentials
 * Sets the userId param to the authenticated user's ID
 */
export const authorizeOwnCredentials = (req: Request, res: Response, next: NextFunction): void => {
  const authenticatedUserId = req.user?.id;

  if (!authenticatedUserId) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  // Set the userId param to the authenticated user's ID
  req.params.userId = authenticatedUserId.toString();
  next();
};
