"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auditoria_1 = require("../middleware/auditoria");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Pré-Reserva
router.post('/pre-reserva', async (req, res) => {
    try {
        const { nome, cpf_cnpj, contato, email } = req.body;
        if (!nome || !cpf_cnpj || !contato || !email) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Todos os campos são obrigatórios'
            });
        }
        const preReserva = await prisma.preReserva.create({
            data: { nome, cpf_cnpj, contato, email }
        });
        // Registrar no histórico
        await (0, auditoria_1.registrarHistorico)(req, 'CREATE', 'pre_reservas', preReserva.id, null, { nome, cpf_cnpj, contato, email });
        res.json({
            sucesso: true,
            mensagem: 'Pré-reserva enviada com sucesso!',
            data: preReserva
        });
    }
    catch (error) {
        console.error('Erro ao criar pré-reserva:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor'
        });
    }
});
// Contraproposta
router.post('/contraproposta', async (req, res) => {
    try {
        const { nome, cpf_cnpj, contato, email, proposta } = req.body;
        if (!nome || !cpf_cnpj || !contato || !email || !proposta) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Todos os campos são obrigatórios'
            });
        }
        const contraproposta = await prisma.contraproposta.create({
            data: { nome, cpf_cnpj, contato, email, proposta }
        });
        // Registrar no histórico
        await (0, auditoria_1.registrarHistorico)(req, 'CREATE', 'contrapropostas', contraproposta.id, null, { nome, cpf_cnpj, contato, email, proposta });
        res.json({
            sucesso: true,
            mensagem: 'Contraproposta enviada com sucesso!',
            data: contraproposta
        });
    }
    catch (error) {
        console.error('Erro ao criar contraproposta:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor'
        });
    }
});
// Agendamento de Reunião
router.post('/agendar-reuniao', async (req, res) => {
    try {
        const { nome, cpf_cnpj, contato, email, data, hora } = req.body;
        if (!nome || !cpf_cnpj || !contato || !email || !data || !hora) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Todos os campos são obrigatórios'
            });
        }
        const agendamento = await prisma.agendamentoReuniao.create({
            data: { nome, cpf_cnpj, contato, email, data, hora }
        });
        // Registrar no histórico
        await (0, auditoria_1.registrarHistorico)(req, 'CREATE', 'agendamentos_reuniao', agendamento.id, null, { nome, cpf_cnpj, contato, email, data, hora });
        res.json({
            sucesso: true,
            mensagem: 'Reunião agendada com sucesso!',
            data: agendamento
        });
    }
    catch (error) {
        console.error('Erro ao agendar reunião:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor'
        });
    }
});
// Rotas administrativas para visualizar formulários
router.get('/pre-reservas', auth_1.authenticateAdmin, async (req, res) => {
    try {
        const preReservas = await prisma.preReserva.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            sucesso: true,
            data: preReservas
        });
    }
    catch (error) {
        console.error('Erro ao buscar pré-reservas:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor'
        });
    }
});
router.get('/contrapropostas', auth_1.authenticateAdmin, async (req, res) => {
    try {
        const contrapropostas = await prisma.contraproposta.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            sucesso: true,
            data: contrapropostas
        });
    }
    catch (error) {
        console.error('Erro ao buscar contrapropostas:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor'
        });
    }
});
router.get('/agendamentos', auth_1.authenticateAdmin, async (req, res) => {
    try {
        const agendamentos = await prisma.agendamentoReuniao.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            sucesso: true,
            data: agendamentos
        });
    }
    catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor'
        });
    }
});
exports.default = router;
//# sourceMappingURL=formularios.js.map