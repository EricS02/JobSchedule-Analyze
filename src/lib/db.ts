import { PrismaClient } from '@prisma/client';

// Create a new PrismaClient with enhanced security
const prismaClientSingleton = () => {
  // During build time, use a placeholder URL to avoid errors
  const dbUrl = process.env.DATABASE_URL || 
    (process.env.NODE_ENV === 'development' ? "file:./dev.db" : "postgresql://placeholder:placeholder@localhost:5432/placeholder");

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
