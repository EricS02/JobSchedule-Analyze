import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      createdAt: new Date(),
    },
  });
  
  console.log({ user });
  
  // Create job statuses if they don't exist
  const statuses = [
    { label: 'Applied', value: 'applied' },
    { label: 'Interview', value: 'interview' },
    { label: 'Offer', value: 'offer' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Saved', value: 'saved' }
  ];
  
  for (const status of statuses) {
    await prisma.jobStatus.upsert({
      where: { value: status.value },
      update: {},
      create: status,
    });
  }
  
  // Create job source for LinkedIn
  await prisma.jobSource.upsert({
    where: { value: 'linkedin' },
    update: {},
    create: {
      label: 'LinkedIn',
      value: 'linkedin',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 