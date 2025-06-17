
import { Router, Request, Response } from 'express';
import { prisma } from '../../server';

const router = Router();

// Pré-Reserva
router.post('/pre-reserva', async (req: Request, res: Response) => {
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
router.post('/contraproposta', async (req: Request, res: Response) => {
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
router.post('/agendar-reuniao', async (req: Request, res: Response) => {
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

export default router;
