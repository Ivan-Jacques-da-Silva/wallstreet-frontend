
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// ================= ROTAS DE FORMULÁRIOS =================

// Pré-Reserva
app.post('/api/pre-reserva', async (req, res) => {
  try {
    const { nome, cpf_cnpj, contato, email } = req.body;

    if (!nome || !cpf_cnpj || !contato || !email) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'Todos os campos são obrigatórios' 
      });
    }

    const preReserva = await prisma.preReserva.create({
      data: {
        nome,
        cpf_cnpj,
        contato,
        email
      }
    });

    res.json({ 
      sucesso: true, 
      mensagem: 'Pré-reserva enviada com sucesso!',
      data: preReserva
    });
  } catch (error) {
    console.error('Erro ao criar pré-reserva:', error);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro interno do servidor' 
    });
  }
});

// Contraproposta
app.post('/api/contraproposta', async (req, res) => {
  try {
    const { nome, cpf_cnpj, contato, email, proposta } = req.body;

    if (!nome || !cpf_cnpj || !contato || !email || !proposta) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'Todos os campos são obrigatórios' 
      });
    }

    const contraproposta = await prisma.contraproposta.create({
      data: {
        nome,
        cpf_cnpj,
        contato,
        email,
        proposta
      }
    });

    res.json({ 
      sucesso: true, 
      mensagem: 'Contraproposta enviada com sucesso!',
      data: contraproposta
    });
  } catch (error) {
    console.error('Erro ao criar contraproposta:', error);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro interno do servidor' 
    });
  }
});

// Agendamento de Reunião
app.post('/api/agendar-reuniao', async (req, res) => {
  try {
    const { nome, cpf_cnpj, contato, email, data, hora } = req.body;

    if (!nome || !cpf_cnpj || !contato || !email || !data || !hora) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'Todos os campos são obrigatórios' 
      });
    }

    const agendamento = await prisma.agendamentoReuniao.create({
      data: {
        nome,
        cpf_cnpj,
        contato,
        email,
        data,
        hora
      }
    });

    res.json({ 
      sucesso: true, 
      mensagem: 'Reunião agendada com sucesso!',
      data: agendamento
    });
  } catch (error) {
    console.error('Erro ao agendar reunião:', error);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro interno do servidor' 
    });
  }
});

// ================= ROTAS DE SALAS =================

// Buscar todas as salas
app.get('/api/salas', async (req, res) => {
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
app.get('/api/salas/:id', async (req, res) => {
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

// Criar nova sala
app.post('/api/salas', upload.fields([
  { name: 'imagem', maxCount: 1 },
  { name: 'planta', maxCount: 1 },
  { name: 'proposta', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      numero, andar, nome, area, posicao, orientacao, preco,
      disponivel, valorizacao, lucro, aluguel, condominio, iptu
    } = req.body;

    const imagemFile = req.files?.imagem?.[0];
    const plantaFile = req.files?.planta?.[0];
    const propostaFile = req.files?.proposta?.[0];

    const sala = await prisma.sala.create({
      data: {
        numero,
        andar: parseInt(andar),
        nome,
        area: parseFloat(area),
        posicao,
        orientacao,
        preco: parseFloat(preco),
        disponivel: disponivel === 'true',
        valorizacao: valorizacao ? parseFloat(valorizacao) : null,
        lucro: lucro ? parseFloat(lucro) : null,
        aluguel: aluguel ? parseFloat(aluguel) : null,
        condominio: condominio ? parseFloat(condominio) : null,
        iptu: iptu ? parseFloat(iptu) : null,
        imagem: imagemFile?.filename,
        planta: plantaFile?.filename,
        proposta: propostaFile?.filename
      }
    });

    res.json({ 
      sucesso: true, 
      mensagem: 'Sala criada com sucesso!',
      data: sala
    });
  } catch (error) {
    console.error('Erro ao criar sala:', error);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro interno do servidor' 
    });
  }
});

// Atualizar sala
app.put('/api/salas/:id', upload.fields([
  { name: 'imagem', maxCount: 1 },
  { name: 'planta', maxCount: 1 },
  { name: 'proposta', maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      numero, andar, nome, area, posicao, orientacao, preco,
      disponivel, valorizacao, lucro, aluguel, condominio, iptu
    } = req.body;

    const imagemFile = req.files?.imagem?.[0];
    const plantaFile = req.files?.planta?.[0];
    const propostaFile = req.files?.proposta?.[0];

    const updateData = {
      numero,
      andar: parseInt(andar),
      nome,
      area: parseFloat(area),
      posicao,
      orientacao,
      preco: parseFloat(preco),
      disponivel: disponivel === 'true',
      valorizacao: valorizacao ? parseFloat(valorizacao) : null,
      lucro: lucro ? parseFloat(lucro) : null,
      aluguel: aluguel ? parseFloat(aluguel) : null,
      condominio: condominio ? parseFloat(condominio) : null,
      iptu: iptu ? parseFloat(iptu) : null
    };

    if (imagemFile) updateData.imagem = imagemFile.filename;
    if (plantaFile) updateData.planta = plantaFile.filename;
    if (propostaFile) updateData.proposta = propostaFile.filename;

    const sala = await prisma.sala.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({ 
      sucesso: true, 
      mensagem: 'Sala atualizada com sucesso!',
      data: sala
    });
  } catch (error) {
    console.error('Erro ao atualizar sala:', error);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro interno do servidor' 
    });
  }
});

// Deletar sala
app.delete('/api/salas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.sala.delete({
      where: { id: parseInt(id) }
    });

    res.json({ 
      sucesso: true, 
      mensagem: 'Sala deletada com sucesso!' 
    });
  } catch (error) {
    console.error('Erro ao deletar sala:', error);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro interno do servidor' 
    });
  }
});

// CSRF Token (compatibilidade)
app.get('/api/csrf-token/', (req, res) => {
  res.json({ csrfToken: 'dummy-token' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
