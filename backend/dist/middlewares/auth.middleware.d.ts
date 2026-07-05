import type { Request, Response, NextFunction } from "express";
declare global {
    namespace Express {
        interface Request {
            userId?: string;
            user?: {
                id: string;
                role: string;
                email: string;
                name: string;
            };
        }
    }
}
export declare const verifyJWT: (req: Request, res: Response, next: NextFunction) => void;
export declare const verifyAdmin: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map