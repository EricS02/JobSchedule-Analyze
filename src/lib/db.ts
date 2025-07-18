import { PrismaClient } from '@prisma/client';

// Create a new PrismaClient with caching disabled
const prismaClientSingleton = () => {
  // Set fallback environment variables if not present
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "file:./dev.db";
    console.log('Set fallback DATABASE_URL:', process.env.DATABASE_URL);
  }

  console.log('Creating Prisma client with DATABASE_URL:', process.env.DATABASE_URL);

  return new PrismaClient({
    log: ['query', 'error', 'warn'],
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
