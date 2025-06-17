
import express, { Router, Request, Response } from "express";
import { prisma } from "../../server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authenticateAdmin } from "../middleware/auth";

const router = Router();

// Login do admin
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    // Verificar se o admin existe
    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    if (!admin) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Credenciais inválidas'
      });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, admin.senha);
    if (!senhaValida) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Credenciais inválidas'
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { adminId: admin.id, email: admin.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      sucesso: true,
      mensagem: 'Login realizado com sucesso',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        nome: admin.nome
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor'
    });
  }
});

// Buscar todos os formulários
router.get('/formularios', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const formularios = await prisma.formulario.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(formularios);
  } catch (error) {
    console.error('Erro ao buscar formulários:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor'
    });
  }
});

// Buscar pré-reservas
router.get('/pre-reservas', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const preReservas = await prisma.preReserva.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(preReservas);
  } catch (error) {
    console.error('Erro ao buscar pré-reservas:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor'
    });
  }
});

// Buscar contrapropostas
router.get('/contrapropostas', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const contrapropostas = await prisma.contraproposta.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(contrapropostas);
  } catch (error) {
    console.error('Erro ao buscar contrapropostas:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor'
    });
  }
});

// Buscar agendamentos
router.get('/agendamentos', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const agendamentos = await prisma.agendamentoReuniao.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(agendamentos);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor'
    });
  }
});

// Atualizar status do formulário
router.put('/formularios/:id/status', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const formulario = await prisma.formulario.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.json({
      sucesso: true,
      mensagem: 'Status atualizado com sucesso',
      data: formulario
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor'
    });
  }
});

export default router;
