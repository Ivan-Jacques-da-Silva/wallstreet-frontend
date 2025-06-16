
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

    res.json({
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
    });
  } catch (error) {
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
  } catch (error) {
    console.error('Erro ao buscar sala:', error);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro interno do servidor' 
    });
  }
});

module.exports = router;
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Listar todas as salas (endpoint público)
router.get('/', async (req, res) => {
  try {
    const salas = await prisma.sala.findMany({
      where: { disponivel: true },
      orderBy: [
        { andar: 'asc' },
        { numero: 'asc' }
      ]
    });

    // Estrutura compatível com código antigo
    const estruturaAntica = {
      produtos: [{
        variacoes: []
      }]
    };

    // Agrupar por andar
    const andares = {};
    salas.forEach(sala => {
      if (!andares[sala.andar]) {
        andares[sala.andar] = [];
      }
      andares[sala.andar].push({
        atributos: {
          nome: [{ valor: sala.nome }],
          area: [{ valor: sala.area }],
          posicao: [{ valor: sala.posicao }],
          disponibilidade: [{ valor: sala.disponivel }]
        },
        precos: {
          de: [{ valor: sala.preco }]
        },
        arquivos: {
          imagens: sala.imagem ? [{ baixar: `/uploads/${sala.imagem}` }] : [],
          plantas: sala.planta ? [{ baixar: `/uploads/${sala.planta}` }] : []
        }
      });
    });

    // Converter para estrutura antiga
    Object.keys(andares).forEach(andar => {
      estruturaAntica.produtos[0].variacoes.push({
        atributos: {
          andar: [{ valor: andar }]
        },
        variacoes: andares[andar]
      });
    });

    res.json(estruturaAntica);
  } catch (error) {
    console.error('Erro ao buscar salas:', error);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao buscar salas: ' + error.message
    });
  }
});

module.exports = router;
