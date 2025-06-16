
import express, { Request, Response } from 'express';

const router = express.Router();

// Importar todas as rotas
import salasRoutes from './salas';
import adminRoutes from './admin';
import formulariosRoutes from './formularios';
import authRoutes from './auth';

// Configurar as rotas
router.use('/salas', salasRoutes);
router.use('/admin', adminRoutes);
router.use('/formularios', formulariosRoutes);
router.use('/auth', authRoutes);

// Rota de status da API
router.get('/status', (req: Request, res: Response) => {
  res.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// CSRF Token (compatibilidade)
router.get('/csrf-token/', (req: Request, res: Response) => {
  res.json({ csrfToken: 'dummy-token' });
});

export default router;
