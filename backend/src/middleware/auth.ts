
import { Request, Response, NextFunction } from 'express';
import { logError } from './errorHandler';

export const authenticateAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || token !== 'admin-token-123') {
    const error = new Error('Token de acesso inválido ou expirado');
    logError(error, req);
    res.status(401).json({ 
      sucesso: false, 
      mensagem: 'Acesso negado. Token inválido.',
      codigo: 'UNAUTHORIZED'
    });
    return;
  }
  
  next();
};
