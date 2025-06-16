
const express = require('express');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const { registrarHistorico } = require('../middleware/auditoria');

const router = express.Router();
const prisma = new PrismaClient();

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Middleware de autenticação
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || token !== 'admin-token-123') {
    return res.status(401).json({ 
      sucesso: false, 
      mensagem: 'Acesso negado. Token inválido.',
      codigo: 'UNAUTHORIZED'
    });
  }
  
  next();
};

// Login
router.post('/login', async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'Usuário e senha são obrigatórios' 
      });
    }

    if (usuario === 'admin' && senha === 'admin123') {
      await registrarHistorico(req, 'LOGIN', 'admin', null, null, { usuario });
      
      res.json({ 
        sucesso: true, 
        mensagem: 'Login realizado com sucesso!',
        token: 'admin-token-123'
      });
    } else {
      await registrarHistorico(req, 'LOGIN_FAILED', 'admin', null, null, { usuario });
      
      res.status(401).json({ 
        sucesso: false, 
        mensagem: 'Credenciais inválidas' 
      });
    }
  } catch (error) {
    console.error('Erro no login admin:', error);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro interno do servidor' 
    });
  }
});

// Listar salas para admin
router.get('/salas-list', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', disponivel } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    
    if (search) {
      where.nome = {
        contains: search,
        mode: 'insensitive'
      };
    }
    
    if (disponivel !== undefined) {
      where.disponivel = disponivel === 'true';
    }

    const [salas, total] = await Promise.all([
      prisma.sala.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: [
          { andar: 'asc' },
          { numero: 'asc' }
        ]
      }),
      prisma.sala.count({ where })
    ]);

    res.json({ 
      sucesso: true, 
      data: salas,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar salas:', error);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao buscar salas: ' + error.message
    });
  }
});

// Criar nova sala
router.post('/salas', authenticateAdmin, upload.fields([
  { name: 'imagem', maxCount: 1 },
  { name: 'planta', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      numero, andar, nome, area, posicao, orientacao, preco, disponivel
    } = req.body;

    const imagemFile = req.files?.imagem?.[0];
    const plantaFile = req.files?.planta?.[0];

    const dadosSala = {
      numero,
      andar: parseInt(andar),
      nome,
      area: parseFloat(area),
      posicao: posicao || orientacao,
      orientacao: orientacao || posicao,
      preco: parseFloat(preco),
      disponivel: disponivel === 'true',
      imagem: imagemFile?.filename,
      planta: plantaFile?.filename
    };

    const sala = await prisma.sala.create({
      data: dadosSala
    });

    // Registrar no histórico
    await registrarHistorico(req, 'CREATE', 'salas', sala.id, null, dadosSala);

    res.json({ 
      sucesso: true, 
      mensagem: 'Sala criada com sucesso!',
      data: sala
    });
  } catch (error) {
    console.error('Erro ao criar sala:', error);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao criar sala: ' + error.message
    });
  }
});

// Atualizar sala
router.put('/salas/:id', authenticateAdmin, upload.fields([
  { name: 'imagem', maxCount: 1 },
  { name: 'planta', maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      numero, andar, nome, area, posicao, orientacao, preco, disponivel
    } = req.body;

    // Buscar dados antes da alteração
    const salaAntes = await prisma.sala.findFirst({
      where: { 
        OR: [
          { id: parseInt(id) },
          { 
            AND: [
              { andar: parseInt(andar) },
              { numero: numero }
            ]
          }
        ]
      }
    });

    if (!salaAntes) {
      return res.status(404).json({ 
        sucesso: false, 
        mensagem: 'Sala não encontrada' 
      });
    }

    const imagemFile = req.files?.imagem?.[0];
    const plantaFile = req.files?.planta?.[0];

    const updateData = {
      numero,
      andar: parseInt(andar),
      nome,
      area: parseFloat(area),
      posicao: posicao || orientacao,
      orientacao: orientacao || posicao,
      preco: parseFloat(preco),
      disponivel: disponivel === 'true'
    };

    if (imagemFile) updateData.imagem = imagemFile.filename;
    if (plantaFile) updateData.planta = plantaFile.filename;

    const sala = await prisma.sala.update({
      where: { id: salaAntes.id },
      data: updateData
    });

    // Registrar no histórico
    await registrarHistorico(req, 'UPDATE', 'salas', sala.id, salaAntes, updateData);

    res.json({ 
      sucesso: true, 
      mensagem: 'Sala atualizada com sucesso!',
      data: sala
    });
  } catch (error) {
    console.error('Erro ao atualizar sala:', error);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao atualizar sala: ' + error.message
    });
  }
});

// Deletar sala
router.delete('/salas/:id', authenticateAdmin, async (req, res) => {
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

    await prisma.sala.delete({
      where: { id: parseInt(id) }
    });

    // Registrar no histórico
    await registrarHistorico(req, 'DELETE', 'salas', parseInt(id), sala, null);

    res.json({ 
      sucesso: true, 
      mensagem: 'Sala deletada com sucesso!' 
    });
  } catch (error) {
    console.error('Erro ao deletar sala:', error);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao deletar sala: ' + error.message
    });
  }
});

// Buscar histórico de alterações
router.get('/historico', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, tabela, operacao } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (tabela) where.tabela = tabela;
    if (operacao) where.operacao = operacao;

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
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao buscar histórico: ' + error.message
    });
  }
});

module.exports = router;
