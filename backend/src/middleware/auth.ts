
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logError } from './errorHandler';

interface JwtPayload {
  adminId: number;
  email: string;
}

export const authenticateAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        sucesso: false, 
        mensagem: 'Token de acesso necessário',
        codigo: 'UNAUTHORIZED'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      res.status(401).json({ 
        sucesso: false, 
        mensagem: 'Token de acesso inválido',
        codigo: 'UNAUTHORIZED'
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JwtPayload;
      
      // Adicionar dados do admin ao request para uso nas rotas
      (req as any).admin = decoded;
      
      next();
    } catch (jwtError) {
      res.status(401).json({ 
        sucesso: false, 
        mensagem: 'Token de acesso inválido ou expirado',
        codigo: 'UNAUTHORIZED'
      });
      return;
    }
    
  } catch (error) {
    logError(error as Error, req);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro interno do servidor',
      codigo: 'INTERNAL_ERROR'
    });
    return;
  }
};
