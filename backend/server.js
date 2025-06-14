
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Sistema de Logs
const logError = (error, req = null) => {
  const timestamp = new Date().toISOString();
  const route = req ? `${req.method} ${req.path}` : 'SYSTEM';
  const logEntry = `[${timestamp}] ${route} - ERROR: ${error.message}\nStack: ${error.stack}\n\n`;
  
  // Criar diretório de logs se não existir
  if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
  }
  
  // Salvar no arquivo de log
  const logFile = `logs/error-${new Date().toISOString().split('T')[0]}.log`;
  fs.appendFileSync(logFile, logEntry);
  
  console.error(`[${timestamp}] ${route} - ERROR:`, error.message);
};

// Middleware de autenticação
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || token !== 'admin-token-123') {
    const error = new Error('Token de acesso inválido ou expirado');
    logError(error, req);
    return res.status(401).json({ 
      sucesso: false, 
      mensagem: 'Acesso negado. Token inválido.',
      codigo: 'UNAUTHORIZED'
    });
  }
  
  next();
};

// Middleware global de tratamento de erros
const errorHandler = (err, req, res, next) => {
  logError(err, req);
  
  res.status(500).json({
    sucesso: false,
    mensagem: 'Erro interno do servidor',
    codigo: 'INTERNAL_ERROR'
  });
};

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
app.post('/api/salas', authenticateAdmin, upload.fields([
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
app.put('/api/salas/:id', authenticateAdmin, upload.fields([
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
app.delete('/api/salas/:id', authenticateAdmin, async (req, res) => {
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

// ================= ROTAS DE ADMIN E GERENCIAMENTO =================

// Login Admin
app.post('/api/admin/login', async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'Usuário e senha são obrigatórios' 
      });
    }

    // Verificação simples (em produção, use hash da senha)
    if (usuario === 'admin' && senha === 'admin123') {
      res.json({ 
        sucesso: true, 
        mensagem: 'Login realizado com sucesso!',
        token: 'admin-token-123' // Token simples para demonstração
      });
    } else {
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

// Listar todas as pré-reservas
app.get('/api/admin/pre-reservas', authenticateAdmin, async (req, res) => {
  try {
    const preReservas = await prisma.preReserva.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ sucesso: true, data: preReservas });
  } catch (error) {
    console.error('Erro ao buscar pré-reservas:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
});

// Listar todas as contrapropostas
app.get('/api/admin/contrapropostas', authenticateAdmin, async (req, res) => {
  try {
    const contrapropostas = await prisma.contraproposta.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ sucesso: true, data: contrapropostas });
  } catch (error) {
    logError(error, req);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
});

// Listar todos os agendamentos
app.get('/api/admin/agendamentos', authenticateAdmin, async (req, res) => {
  try {
    const agendamentos = await prisma.agendamentoReuniao.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ sucesso: true, data: agendamentos });
  } catch (error) {
    logError(error, req);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
});

// Marcar pré-reserva como visualizada
app.put('/api/admin/pre-reservas/:id/visualizar', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const preReserva = await prisma.preReserva.update({
      where: { id: parseInt(id) },
      data: { visualizado: true }
    });
    res.json({ sucesso: true, data: preReserva });
  } catch (error) {
    logError(error, req);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
});

// Marcar contraproposta como visualizada
app.put('/api/admin/contrapropostas/:id/visualizar', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const contraproposta = await prisma.contraproposta.update({
      where: { id: parseInt(id) },
      data: { visualizado: true }
    });
    res.json({ sucesso: true, data: contraproposta });
  } catch (error) {
    logError(error, req);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
});

// Marcar agendamento como visualizado
app.put('/api/admin/agendamentos/:id/visualizar', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const agendamento = await prisma.agendamentoReuniao.update({
      where: { id: parseInt(id) },
      data: { visualizado: true }
    });
    res.json({ sucesso: true, data: agendamento });
  } catch (error) {
    logError(error, req);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
});

// CSRF Token (compatibilidade)
app.get('/api/csrf-token/', (req, res) => {
  res.json({ csrfToken: 'dummy-token' });
});

// Middleware de tratamento de erros (deve estar por último)
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
