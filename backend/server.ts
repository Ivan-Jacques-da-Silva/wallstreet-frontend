
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { errorHandler, logError } from './src/middleware/errorHandler';
import { authenticateAdmin } from './src/middleware/auth';
import formularioRoutes from './src/routes/formularios';
import salaRoutes from './src/routes/salas';
import adminRoutes from './src/routes/admin';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

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

export const upload = multer({ storage });

// Rotas
app.use('/api', formularioRoutes);
app.use('/api', salaRoutes);
app.use('/api', adminRoutes);

// CSRF Token (compatibilidade)
app.get('/api/csrf-token/', (req, res) => {
  res.json({ csrfToken: 'dummy-token' });
});

// Middleware de tratamento de erros (deve estar por último)
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
  console.log(`🌐 Frontend deve acessar: http://localhost:${PORT}`);
});

export { prisma };
