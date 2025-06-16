
import express, { Request, Response } from 'express';

const router = express.Router();

interface LoginData {
  username: string;
  password: string;
}

// Login simples (para demonstração)
router.post('/login', (req: Request<{}, any, LoginData>, res: Response) => {
  const { username, password } = req.body;

  // Validação simples (em produção, usar hash e banco de dados)
  if (username === 'admin' && password === 'admin123') {
    res.json({
      sucesso: true,
      mensagem: 'Login realizado com sucesso',
      token: 'admin-token',
      user: {
        id: 1,
        username: 'admin',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({
      sucesso: false,
      mensagem: 'Credenciais inválidas'
    });
  }
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  res.json({
    sucesso: true,
    mensagem: 'Logout realizado com sucesso'
  });
});

// Verificar token
router.get('/verify', (req: Request, res: Response) => {
  const token = req.headers.authorization;
  
  if (token === 'Bearer admin-token') {
    res.json({
      sucesso: true,
      user: {
        id: 1,
        username: 'admin',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({
      sucesso: false,
      mensagem: 'Token inválido'
    });
  }
});

export default router;
