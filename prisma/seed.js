const { STATUS_DATA, JOB_SOURCES } = require("../src/lib/data/seedData");

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Starting database seeding...");
    
    // Create test user (delete first if exists)
    try {
      await prisma.user.delete({
        where: { email: 'test@example.com' }
      });
      console.log("Deleted existing test user");
    } catch (e) {
      // User doesn't exist, that's fine
      console.log("No existing test user to delete");
    }

    // Create test user
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
        createdAt: new Date(),
      },
    });
    
    console.log('User created:', user);
    
    // Create job statuses
    await seedJobStatuses();
    
    // Create job sources
    await seedJobSources();
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function seedJobSources() {
  const sources = [
    { label: 'LinkedIn', value: 'linkedin' },
    { label: 'Indeed', value: 'indeed' },
    { label: 'Company Website', value: 'company-website' },
    { label: 'Referral', value: 'referral' },
    { label: 'Other', value: 'other' }
  ];
  
  for (const source of sources) {
    await prisma.jobSource.upsert({
      where: { value: source.value },
      update: {},
      create: source
    });
  }
  
  console.log('Job sources seeded');
}

async function seedJobStatuses() {
  const statuses = [
    { label: 'Applied', value: 'applied' },
    { label: 'Interview', value: 'interview' },
    { label: 'Offer', value: 'offer' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Declined', value: 'declined' },
    { label: 'Saved', value: 'saved' }
  ];
  
  for (const status of statuses) {
    await prisma.jobStatus.upsert({
      where: { value: status.value },
      update: {},
      create: status
    });
  }
  
  console.log('Job statuses seeded');
}

main();
