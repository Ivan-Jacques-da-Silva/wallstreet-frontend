
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    // Verificar se já existe um admin
    const adminExistente = await prisma.admin.findFirst();
    
    if (adminExistente) {
      console.log('Admin já existe no banco de dados');
      return;
    }

    // Criar hash da senha
    const senhaHash = await bcrypt.hash('admin123', 10);

    // Criar admin padrão
    const admin = await prisma.admin.create({
      data: {
        email: 'admin@wallstreet.com',
        nome: 'Administrador',
        senha: senhaHash
      }
    });

    console.log('Admin criado com sucesso:', {
      id: admin.id,
      email: admin.email,
      nome: admin.nome
    });
    
    console.log('Credenciais de acesso:');
    console.log('Email: admin@wallstreet.com');
    console.log('Senha: admin123');

  } catch (error) {
    console.error('Erro ao criar admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
