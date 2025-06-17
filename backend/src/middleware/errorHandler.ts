
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';

export const logError = (error: Error, req: Request | null = null): void => {
  const timestamp = new Date().toISOString();
  const route = req ? `${req.method} ${req.path}` : 'SYSTEM';
  const logEntry = `[${timestamp}] ${route} - ERROR: ${error.message}\nStack: ${error.stack}\n\n`;
  
  // Criar diretório de logs se não existir
  if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
  }
  
  // Salvar no arquivo de log
  const logFile = `logs/error-${new Date().toISOString().split('T')[0]}.log`;
  fs.appendFileSync(logFile, logEntry);
  
  console.error(`[${timestamp}] ${route} - ERROR:`, error.message);
};

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  logError(err, req);
  
  res.status(500).json({
    sucesso: false,
    mensagem: 'Erro interno do servidor',
    codigo: 'INTERNAL_ERROR'
  });
};
