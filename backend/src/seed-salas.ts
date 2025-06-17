
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--limpar')) {
    console.log('🗑️ Limpando todas as salas...');
    await prisma.sala.deleteMany({});
    console.log('✅ Todas as salas foram removidas!');
    return;
  }

  console.log('🌱 Iniciando seed das salas...');

  const salas = [
    {
      numero: '101',
      andar: 1,
      nome: 'Sala Premium 101',
      area: 45.5,
      posicao: 'Frente',
      orientacao: 'Norte',
      preco: 180000,
      disponivel: true,
      valorizacao: 15.5,
      lucro: 25000,
      aluguel: 1800,
      condominio: 450,
      iptu: 320,
      imagem: 'sala1.png',
      planta: 'planta-sala-1.png'
    },
    // Adicione mais salas conforme necessário
  ];

  for (const salaData of salas) {
    await prisma.sala.upsert({
      where: { numero: salaData.numero },
      update: salaData,
      create: salaData,
    });
  }

  console.log('✅ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
