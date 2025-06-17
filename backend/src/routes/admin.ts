
import { Router, Request, Response } from 'express';
import { prisma } from '../server';
import { authenticateAdmin } from '../middleware/auth';
import { logError } from '../middleware/errorHandler';

const router = Router();

// Login Admin
router.post('/admin/login', async (req: Request, res: Response) => {
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
router.get('/admin/pre-reservas', authenticateAdmin, async (req: Request, res: Response) => {
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
router.get('/admin/contrapropostas', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const contrapropostas = await prisma.contraproposta.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ sucesso: true, data: contrapropostas });
  } catch (error) {
    logError(error as Error, req);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
});

// Listar todos os agendamentos
router.get('/admin/agendamentos', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const agendamentos = await prisma.agendamentoReuniao.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ sucesso: true, data: agendamentos });
  } catch (error) {
    logError(error as Error, req);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
});

// Marcar pré-reserva como visualizada
router.put('/admin/pre-reservas/:id/visualizar', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const preReserva = await prisma.preReserva.update({
      where: { id: parseInt(id) },
      data: { visualizado: true }
    });
    res.json({ sucesso: true, data: preReserva });
  } catch (error) {
    logError(error as Error, req);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
});

// Marcar contraproposta como visualizada
router.put('/admin/contrapropostas/:id/visualizar', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contraproposta = await prisma.contraproposta.update({
      where: { id: parseInt(id) },
      data: { visualizado: true }
    });
    res.json({ sucesso: true, data: contraproposta });
  } catch (error) {
    logError(error as Error, req);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
});

// Marcar agendamento como visualizado
router.put('/admin/agendamentos/:id/visualizar', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const agendamento = await prisma.agendamentoReuniao.update({
      where: { id: parseInt(id) },
      data: { visualizado: true }
    });
    res.json({ sucesso: true, data: agendamento });
  } catch (error) {
    logError(error as Error, req);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
  }
});

export default router;
