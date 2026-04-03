import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL nao foi definida. Verifique o arquivo .env antes de executar o seed.',
  );
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const senhaHash = await bcrypt.hash('123456', 10);

  await prisma.usuario.upsert({
    where: { email: 'admin@fluxoops.local' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@fluxoops.local',
      senhaHash,
      perfil: 'ADMIN',
      ativo: true,
    },
  });

  console.log('✅ Seed executado com sucesso.');
}

main()
  .catch((error) => {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });