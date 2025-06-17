"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateToken = exports.generateSecureToken = exports.cleanExpiredTokens = exports.invalidateToken = exports.adminRateLimit = exports.authenticateAdmin = void 0;
const crypto_1 = __importDefault(require("crypto"));
// Cache simples para tokens válidos (em produção usar Redis)
const validTokens = new Map();
// Função para gerar token seguro
const generateSecureToken = (user) => {
    const timestamp = Date.now();
    const randomBytes = crypto_1.default.randomBytes(16).toString('hex');
    const payload = JSON.stringify({ user, timestamp });
    // Em produção, usar JWT ou similar
    const token = crypto_1.default.createHash('sha256')
        .update(payload + process.env.JWT_SECRET || 'default-secret')
        .digest('hex');
    // Armazenar token com expiração de 24h
    validTokens.set(token, {
        user,
        expires: timestamp + (24 * 60 * 60 * 1000)
    });
    return token;
};
exports.generateSecureToken = generateSecureToken;
// Função para validar token
const validateToken = (token) => {
    const tokenData = validTokens.get(token);
    if (!tokenData) {
        return null;
    }
    // Verificar se token expirou
    if (Date.now() > tokenData.expires) {
        validTokens.delete(token);
        return null;
    }
    return tokenData.user;
};
exports.validateToken = validateToken;
// Middleware de autenticação principal para rotas administrativas
const authenticateAdmin = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                sucesso: false,
                mensagem: 'Token de acesso não fornecido',
                codigo: 'MISSING_TOKEN'
            });
            return;
        }
        const token = authHeader.replace('Bearer ', '');
        // Validação básica para demonstração (admin-token)
        if (token === 'admin-token') {
            req.user = {
                id: 1,
                username: 'admin',
                role: 'admin',
                lastLogin: new Date()
            };
            return next();
        }
        // Validação de token gerado dinamicamente
        const user = validateToken(token);
        if (user) {
            req.user = user;
            return next();
        }
        res.status(401).json({
            sucesso: false,
            mensagem: 'Token de acesso inválido ou expirado',
            codigo: 'INVALID_TOKEN'
        });
    }
    catch (error) {
        console.error('Erro na autenticação:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno na verificação de autenticação',
            codigo: 'AUTH_ERROR'
        });
    }
};
exports.authenticateAdmin = authenticateAdmin;
// Middleware opcional para rate limiting específico de admin
const adminRateLimit = (req, res, next) => {
    // Implementar rate limiting mais restritivo para rotas admin
    // Por exemplo: máximo 30 requests por minuto para admins
    next();
};
exports.adminRateLimit = adminRateLimit;
// Função para fazer logout (invalidar token)
const invalidateToken = (token) => {
    return validTokens.delete(token);
};
exports.invalidateToken = invalidateToken;
// Função para limpar tokens expirados (executar periodicamente)
const cleanExpiredTokens = () => {
    const now = Date.now();
    for (const [token, data] of validTokens.entries()) {
        if (now > data.expires) {
            validTokens.delete(token);
        }
    }
};
exports.cleanExpiredTokens = cleanExpiredTokens;
// Limpar tokens expirados a cada hora
setInterval(exports.cleanExpiredTokens, 60 * 60 * 1000);
//# sourceMappingURL=auth.js.map