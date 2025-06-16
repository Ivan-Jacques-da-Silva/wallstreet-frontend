const express = require('express');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

// Importar middleware e rotas
const { auditarOperacao } = require('./middleware/auditoria');
const salasRoutes = require('./routes/salas');
const adminRoutes = require('./routes/admin');
const formulariosRoutes = require('./routes/formularios');

const app = express();
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
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Middleware de auditoria
app.use(auditarOperacao);

// Configurar rotas modulares
app.use('/api/salas', salasRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', formulariosRoutes);

// CSRF Token (compatibilidade)
app.get('/api/csrf-token/', (req, res) => {
  res.json({ csrfToken: 'dummy-token' });
});

// Rota de status da API
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Middleware de tratamento de erros (deve estar por último)
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
  console.log(`🌐 Frontend deve acessar: http://localhost:${PORT}`);
  console.log(`📊 Sistema de auditoria ativo`);
  console.log(`🔒 Rotas modulares configuradas`);
});