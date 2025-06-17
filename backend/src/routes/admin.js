"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const client_1 = require("@prisma/client");
const auditoria_1 = require("../middleware/auditoria");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Configuração do multer
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = (0, multer_1.default)({ storage });
// Listar todas as salas (admin)
router.get('/salas', auth_1.authenticateAdmin, async (req, res) => {
    try {
        const salas = await prisma.sala.findMany({
            orderBy: [
                { andar: 'asc' },
                { numero: 'asc' }
            ]
        });
        res.json({
            sucesso: true,
            data: salas
        });
    }
    catch (error) {
        console.error('Erro ao buscar salas:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar salas: ' + error.message
        });
    }
});
// Criar nova sala
router.post('/salas', auth_1.authenticateAdmin, upload.fields([
    { name: 'imagem', maxCount: 1 },
    { name: 'planta', maxCount: 1 }
]), async (req, res) => {
    try {
        const files = req.files;
        const salaData = req.body;
        // Converter strings para números
        salaData.andar = parseInt(salaData.andar);
        salaData.area = parseFloat(salaData.area);
        salaData.preco = parseFloat(salaData.preco);
        salaData.disponivel = Boolean(salaData.disponivel === true || String(salaData.disponivel) === 'true');
        if (salaData.valorizacao)
            salaData.valorizacao = parseFloat(salaData.valorizacao);
        if (salaData.lucro)
            salaData.lucro = parseFloat(salaData.lucro);
        if (salaData.aluguel)
            salaData.aluguel = parseFloat(salaData.aluguel);
        if (salaData.condominio)
            salaData.condominio = parseFloat(salaData.condominio);
        if (salaData.iptu)
            salaData.iptu = parseFloat(salaData.iptu);
        const dataToSave = { ...salaData };
        if (files.imagem) {
            dataToSave.imagem = files.imagem[0].filename;
        }
        if (files.planta) {
            dataToSave.planta = files.planta[0].filename;
        }
        const novaSala = await prisma.sala.create({
            data: dataToSave
        });
        // Registrar no histórico
        await (0, auditoria_1.registrarHistorico)(req, 'CREATE', 'salas', novaSala.id, null, dataToSave);
        res.json({
            sucesso: true,
            mensagem: 'Sala criada com sucesso!',
            data: novaSala
        });
    }
    catch (error) {
        console.error('Erro ao criar sala:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao criar sala: ' + error.message
        });
    }
});
// Atualizar sala
router.put('/salas/:id', auth_1.authenticateAdmin, upload.fields([
    { name: 'imagem', maxCount: 1 },
    { name: 'planta', maxCount: 1 }
]), async (req, res) => {
    try {
        const { id } = req.params;
        const files = req.files;
        // Buscar sala atual para comparação
        const salaAtual = await prisma.sala.findUnique({
            where: { id: parseInt(id) }
        });
        if (!salaAtual) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Sala não encontrada'
            });
        }
        const salaData = req.body;
        // Converter strings para números
        if (salaData.andar)
            salaData.andar = parseInt(salaData.andar);
        if (salaData.area)
            salaData.area = parseFloat(salaData.area);
        if (salaData.preco)
            salaData.preco = parseFloat(salaData.preco);
        if (salaData.disponivel !== undefined)
            salaData.disponivel = Boolean(salaData.disponivel === true || String(salaData.disponivel) === 'true');
        if (salaData.valorizacao)
            salaData.valorizacao = parseFloat(salaData.valorizacao);
        if (salaData.lucro)
            salaData.lucro = parseFloat(salaData.lucro);
        if (salaData.aluguel)
            salaData.aluguel = parseFloat(salaData.aluguel);
        if (salaData.condominio)
            salaData.condominio = parseFloat(salaData.condominio);
        if (salaData.iptu)
            salaData.iptu = parseFloat(salaData.iptu);
        if (files.imagem) {
            salaData.imagem = files.imagem[0].filename;
        }
        if (files.planta) {
            salaData.planta = files.planta[0].filename;
        }
        const salaAtualizada = await prisma.sala.update({
            where: { id: parseInt(id) },
            data: salaData
        });
        // Registrar no histórico
        await (0, auditoria_1.registrarHistorico)(req, 'UPDATE', 'salas', parseInt(id), salaAtual, salaData);
        res.json({
            sucesso: true,
            mensagem: 'Sala atualizada com sucesso!',
            data: salaAtualizada
        });
    }
    catch (error) {
        console.error('Erro ao atualizar sala:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao atualizar sala: ' + error.message
        });
    }
});
// Deletar sala
router.delete('/salas/:id', auth_1.authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        // Buscar sala antes de deletar
        const sala = await prisma.sala.findUnique({
            where: { id: parseInt(id) }
        });
        if (!sala) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Sala não encontrada'
            });
        }
        await prisma.sala.delete({
            where: { id: parseInt(id) }
        });
        // Registrar no histórico
        await (0, auditoria_1.registrarHistorico)(req, 'DELETE', 'salas', parseInt(id), sala, null);
        res.json({
            sucesso: true,
            mensagem: 'Sala deletada com sucesso!'
        });
    }
    catch (error) {
        console.error('Erro ao deletar sala:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao deletar sala: ' + error.message
        });
    }
});
// Buscar histórico de alterações
router.get('/historico', auth_1.authenticateAdmin, async (req, res) => {
    try {
        const { page = '1', limit = '20', tabela, operacao } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = {};
        if (tabela)
            where.tabela = tabela;
        if (operacao)
            where.operacao = operacao;
        const [historico, total] = await Promise.all([
            prisma.historicoAlteracoes.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.historicoAlteracoes.count({ where })
        ]);
        res.json({
            sucesso: true,
            data: historico,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar histórico: ' + error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map