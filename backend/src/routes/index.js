"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Importar todas as rotas modulares
const salas_1 = __importDefault(require("./salas"));
const admin_1 = __importDefault(require("./admin"));
const formularios_1 = __importDefault(require("./formularios"));
const auth_1 = __importDefault(require("./auth"));
// Configurar as rotas principais sem prefixo /api
// Rota para gerenciamento de salas (público e admin)
router.use('/salas', salas_1.default);
// Rota para funcionalidades administrativas (protegida)
router.use('/admin', admin_1.default);
// Rota para formulários de contato e propostas (público)
router.use('/formularios', formularios_1.default);
// Rota para autenticação de usuários (público)
router.use('/auth', auth_1.default);
// Rota de verificação de status da API
router.get('/status', (req, res) => {
    res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});
// Token CSRF para compatibilidade com sistemas antigos
router.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: 'dummy-token' });
});
exports.default = router;
//# sourceMappingURL=index.js.map