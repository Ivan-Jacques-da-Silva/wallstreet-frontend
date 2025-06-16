
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticateAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  // Por enquanto, simulando autenticação
  // Pode ser expandido com JWT ou outras estratégias
  const token = req.headers.authorization;
  
  if (!token || token !== 'Bearer admin-token') {
    res.status(401).json({ 
      sucesso: false, 
      mensagem: 'Token de acesso inválido' 
    });
    return;
  }
  
  req.user = { id: 1, role: 'admin' };
  next();
};
