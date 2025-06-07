import { NextFunction, Request, Response } from 'express';
/**
 * Middleware to enforce HTTPS connections
 * Redirects HTTP requests to HTTPS in production environments
 */
export declare const httpsEnforcer: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=httpsEnforcer.d.ts.map