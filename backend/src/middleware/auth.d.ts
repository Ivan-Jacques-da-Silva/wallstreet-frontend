import { Request, Response, NextFunction } from 'express';
interface AuthenticatedRequest extends Request {
    user?: any;
}
interface UserData {
    id: number;
    username: string;
    role: string;
    lastLogin?: Date;
}
declare const generateSecureToken: (user: UserData) => string;
declare const validateToken: (token: string) => UserData | null;
export declare const authenticateAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const adminRateLimit: (req: Request, res: Response, next: NextFunction) => void;
export declare const invalidateToken: (token: string) => boolean;
export declare const cleanExpiredTokens: () => void;
export { generateSecureToken, validateToken };
//# sourceMappingURL=auth.d.ts.map