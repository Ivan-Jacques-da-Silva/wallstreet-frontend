
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.sala.deleteMany({});
  console.log(`🗑️ ${result.count} salas removidas com sucesso`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao limpar salas:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
