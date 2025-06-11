// src/middleware/auth.ts
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/express';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    res.status(401).json({ message: 'Access token missing' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ message: 'JWT secret not configured' });
      return;
    }

    const payload = jwt.verify(token, secret) as JWTPayload;

    // Validate payload structure
    if (!payload.id || !payload.email) {
      res.status(403).json({ message: 'Invalid token payload' });
      return;
    }

    // Attach the decoded payload to the request object
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expired' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ message: 'Invalid token' });
    } else {
      res.status(500).json({ message: 'Token verification failed' });
    }
  }
};
