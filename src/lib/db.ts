import { PrismaClient } from '@prisma/client';
import { getEnvVar } from './config';

// Create a new PrismaClient with enhanced security
const prismaClientSingleton = () => {
  const dbUrl = getEnvVar('DATABASE_URL', 
    process.env.NODE_ENV === 'development' ? "file:./dev.db" : undefined
  );

  return new PrismaClient({
    datasources: { db: { url: dbUrl } },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

// Use type for global variable
type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

// Create global variable
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

// Export prisma client
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
