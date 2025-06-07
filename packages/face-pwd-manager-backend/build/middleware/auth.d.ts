import { NextFunction, Request, Response } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
export declare const authenticateJWT: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map