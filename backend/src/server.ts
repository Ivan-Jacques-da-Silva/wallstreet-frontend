
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Importar middleware e rotas
import { auditarOperacao } from './middleware/auditoria';
import apiRoutes from './routes/index';

dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '3001');

// Interfaces para tratamento de erros
interface CustomError extends Error {
  code?: string;
  errno?: number;
  syscall?: string;
  address?: string;
  port?: number;
}

// Sistema de Logs Melhorado
const logError = (error: CustomError, req: Request | null = null, additionalData: any = {}): void => {
  const timestamp = new Date().toISOString();
  const route = req ? `${req.method} ${req.path}` : 'SYSTEM';
  const ip = req ? (req.ip || req.socket.remoteAddress) : 'UNKNOWN';
  const userAgent = req ? req.headers['user-agent'] : 'UNKNOWN';
  
  const logEntry = `
[${timestamp}] ${route}
IP: ${ip}
User-Agent: ${userAgent}
ERROR: ${error.message}
Stack: ${error.stack}
Additional Data: ${JSON.stringify(additionalData, null, 2)}
${'='.repeat(80)}
`;

  // Criar diretório de logs se não existir
  if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
  }

  // Salvar no arquivo de log
  const logFile = `logs/error-${new Date().toISOString().split('T')[0]}.log`;
  fs.appendFileSync(logFile, logEntry);

  console.error(`[${timestamp}] ${route} - ERROR:`, error.message);
};

// Log de operações (sucessos)
const logOperation = (operation: string, req: Request, data: any = {}): void => {
  const timestamp = new Date().toISOString();
  const route = req ? `${req.method} ${req.path}` : 'SYSTEM';
  const ip = req ? (req.ip || req.socket.remoteAddress) : 'UNKNOWN';
  
  const logEntry = `[${timestamp}] ${route} - ${operation} - IP: ${ip} - Data: ${JSON.stringify(data)}\n`;

  if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
  }

  const logFile = `logs/operations-${new Date().toISOString().split('T')[0]}.log`;
  fs.appendFileSync(logFile, logEntry);

  console.log(`[${timestamp}] ${route} - ${operation}`);
};

// Middleware global de tratamento de erros
const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction): void => {
  // Log detalhado do erro
  logError(err, req, {
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Resposta amigável para o frontend
  let mensagem = 'Erro interno do servidor';
  let codigo = 'INTERNAL_ERROR';

  // Tratar diferentes tipos de erro
  if (err.code === 'P2002') {
    mensagem = 'Dados duplicados encontrados';
    codigo = 'DUPLICATE_DATA';
  } else if (err.code === 'P2025') {
    mensagem = 'Registro não encontrado';
    codigo = 'NOT_FOUND';
  } else if (err.message.includes('Unknown argument')) {
    mensagem = 'Erro de validação dos dados';
    codigo = 'VALIDATION_ERROR';
  }

  res.status(500).json({
    sucesso: false,
    mensagem,
    codigo,
    timestamp: new Date().toISOString()
  });
};

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Middleware de auditoria
app.use(auditarOperacao);

// Configurar todas as rotas através do router principal
app.use('/api', apiRoutes);

// Middleware de tratamento de erros (deve estar por último)
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
  console.log(`🌐 Frontend deve acessar: http://localhost:${PORT}`);
  console.log(`📊 Sistema de auditoria ativo`);
  console.log(`🔒 Rotas modulares configuradas`);
});
