// src/middleware/auth.ts
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

// Extend Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access token missing" });
  }
  try {
    const secret = process.env.JWT_SECRET || "your-secret-key";
    const payload = jwt.verify(token, secret);
    // Attach the decoded payload to the request object
    req.user = payload;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
};
