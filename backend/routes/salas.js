"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Buscar todas as salas (público)
router.get('/', async (req, res) => {
    try {
        const { andar } = req.query;
        const where = andar ? { andar: parseInt(andar) } : {};
        const salas = await prisma.sala.findMany({
            where,
            orderBy: [
                { andar: 'asc' },
                { numero: 'asc' }
            ]
        });
        if (salas.length === 0) {
            return res.json({
                produtos: [{
                        variacoes: []
                    }]
            });
        }
        const response = {
            produtos: [{
                    variacoes: salas.reduce((acc, sala) => {
                        let andarExistente = acc.find(a => a.atributos?.andar?.[0]?.valor === sala.andar);
                        if (!andarExistente) {
                            andarExistente = {
                                atributos: {
                                    andar: [{ valor: sala.andar }]
                                },
                                variacoes: []
                            };
                            acc.push(andarExistente);
                        }
                        andarExistente.variacoes.push({
                            atributos: {
                                nome: [{ valor: sala.nome }],
                                area: [{ valor: sala.area.toString() }],
                                posicao: [{ valor: sala.posicao }],
                                disponibilidade: [{ valor: sala.disponivel }]
                            },
                            precos: {
                                de: [{ valor: sala.preco.toString() }]
                            },
                            arquivos: {
                                imagens: sala.imagem ? [{ baixar: `/uploads/${sala.imagem}` }] : [],
                                plantas: sala.planta ? [{ baixar: `/uploads/${sala.planta}` }] : []
                            }
                        });
                        return acc;
                    }, [])
                }]
        };
        res.json(response);
    }
    catch (error) {
        console.error('Erro ao buscar salas:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor'
        });
    }
});
// Buscar sala específica
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sala = await prisma.sala.findUnique({
            where: { id: parseInt(id) }
        });
        if (!sala) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Sala não encontrada'
            });
        }
        res.json(sala);
    }
    catch (error) {
        console.error('Erro ao buscar sala:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor'
        });
    }
});
exports.default = router;
//# sourceMappingURL=salas.js.map