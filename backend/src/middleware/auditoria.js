"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditarOperacao = exports.registrarHistorico = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Função para registrar alterações no histórico
const registrarHistorico = async (req, operacao, tabela, registroId = null, dadosAntes = null, dadosDepois = null) => {
    try {
        await prisma.historicoAlteracoes.create({
            data: {
                tabela,
                operacao,
                registro_id: registroId,
                dados_antes: dadosAntes,
                dados_depois: dadosDepois,
                usuario: 'admin', // Por enquanto fixo, pode ser expandido com JWT
                ip_address: req.ip || req.socket.remoteAddress || 'UNKNOWN',
                user_agent: req.headers['user-agent'] || 'UNKNOWN'
            }
        });
    }
    catch (error) {
        console.error('Erro ao registrar histórico:', error);
    }
};
exports.registrarHistorico = registrarHistorico;
// Middleware para interceptar operações do Prisma
const auditarOperacao = (req, res, next) => {
    req.registrarHistorico = exports.registrarHistorico;
    next();
};
exports.auditarOperacao = auditarOperacao;
//# sourceMappingURL=auditoria.js.map