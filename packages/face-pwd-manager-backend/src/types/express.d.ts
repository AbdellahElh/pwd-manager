// src/types/express.d.ts
export interface JWTPayload {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
