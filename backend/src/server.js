"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Importar middleware e rotas
const auditoria_1 = require("./middleware/auditoria");
const index_1 = __importDefault(require("./routes/index"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '5000');
// Sistema de Logs Melhorado com rotação
const logError = (error, req = null, additionalData = {}) => {
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
    if (!fs_1.default.existsSync('logs')) {
        fs_1.default.mkdirSync('logs');
    }
    // Salvar no arquivo de log com rotação diária
    const logFile = `logs/error-${new Date().toISOString().split('T')[0]}.log`;
    fs_1.default.appendFileSync(logFile, logEntry);
    console.error(`[${timestamp}] ${route} - ERROR:`, error.message);
};
// Log de operações de sucesso
const logOperation = (operation, req, data = {}) => {
    const timestamp = new Date().toISOString();
    const route = req ? `${req.method} ${req.path}` : 'SYSTEM';
    const ip = req ? (req.ip || req.socket.remoteAddress) : 'UNKNOWN';
    const logEntry = `[${timestamp}] ${route} - ${operation} - IP: ${ip} - Data: ${JSON.stringify(data)}\n`;
    if (!fs_1.default.existsSync('logs')) {
        fs_1.default.mkdirSync('logs');
    }
    const logFile = `logs/operations-${new Date().toISOString().split('T')[0]}.log`;
    fs_1.default.appendFileSync(logFile, logEntry);
    console.log(`[${timestamp}] ${route} - ${operation}`);
};
// Middleware de segurança para headers
const securityHeaders = (req, res, next) => {
    // Prevenir ataques XSS
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Política de segurança de conteúdo básica
    res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'");
    next();
};
// Middleware global de tratamento de erros aprimorado
const errorHandler = (err, req, res, next) => {
    // Log detalhado do erro
    logError(err, req, {
        body: req.body,
        params: req.params,
        query: req.query,
        headers: req.headers
    });
    // Resposta amigável para o frontend
    let mensagem = 'Erro interno do servidor';
    let codigo = 'INTERNAL_ERROR';
    let statusCode = err.statusCode || 500;
    // Tratar diferentes tipos de erro do Prisma e outros
    if (err.code === 'P2002') {
        mensagem = 'Dados duplicados encontrados';
        codigo = 'DUPLICATE_DATA';
        statusCode = 409;
    }
    else if (err.code === 'P2025') {
        mensagem = 'Registro não encontrado';
        codigo = 'NOT_FOUND';
        statusCode = 404;
    }
    else if (err.message.includes('Unknown argument')) {
        mensagem = 'Erro de validação dos dados';
        codigo = 'VALIDATION_ERROR';
        statusCode = 400;
    }
    else if (err.message.includes('Unauthorized')) {
        mensagem = 'Acesso não autorizado';
        codigo = 'UNAUTHORIZED';
        statusCode = 401;
    }
    res.status(statusCode).json({
        sucesso: false,
        mensagem,
        codigo,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
// Middleware de rate limiting básico
const rateLimitMap = new Map();
const rateLimit = (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutos
    const limit = 100; // máximo 100 requests por IP por janela
    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
        return next();
    }
    const data = rateLimitMap.get(ip);
    if (now > data.resetTime) {
        data.count = 1;
        data.resetTime = now + windowMs;
        return next();
    }
    if (data.count >= limit) {
        res.status(429).json({
            sucesso: false,
            mensagem: 'Muitas requisições. Tente novamente em alguns minutos.',
            codigo: 'RATE_LIMIT_EXCEEDED'
        });
        return;
    }
    data.count++;
    next();
};
// Configuração de CORS otimizada
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // Cache preflight por 24h
}));
// Middleware de parsing com limites de segurança
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Servir arquivos estáticos com cache headers
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads'), {
    maxAge: '1d',
    etag: true,
    lastModified: true
}));
// Aplicar middlewares de segurança
app.use(securityHeaders);
app.use(rateLimit);
// Middleware de auditoria para tracking de operações
app.use(auditoria_1.auditarOperacao);
// Configurar todas as rotas SEM prefixo /api
app.use('/', index_1.default);
// Rota de health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '2.0.0'
    });
});
// Middleware de tratamento de erros (deve estar por último)
app.use(errorHandler);
// Tratamento de rotas não encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        sucesso: false,
        mensagem: 'Rota não encontrada',
        codigo: 'NOT_FOUND',
        path: req.originalUrl
    });
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
    console.log(`🌐 Frontend deve acessar: http://localhost:${PORT}`);
    console.log(`📊 Sistema de auditoria ativo`);
    console.log(`🔒 Rotas modulares configuradas`);
    console.log(`🛡️  Middlewares de segurança ativos`);
    console.log(`⚡ Sistema de rate limiting ativo`);
});
//# sourceMappingURL=server.js.map