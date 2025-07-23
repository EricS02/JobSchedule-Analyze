const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function grantPremiumAccess(email) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: {
        subscription_status: 'active',
        stripe_subscription_id: 'manual_pro_access',
        has_used_trial: true,
        trial_end_date: new Date('2099-12-31'), // Far future date
      },
    });
    
    console.log(`✅ Premium access granted to: ${email}`);
    return user;
  } catch (error) {
    console.error(`❌ Failed to grant premium access to ${email}:`, error.message);
    return null;
  }
}

// Usage examples
async function main() {
  const emails = [
    'admin@jobschedule.io',
    'beta@jobschedule.io',
    // Add more emails here
  ];
  
  for (const email of emails) {
    await grantPremiumAccess(email);
  }
  
  await prisma.$disconnect();
}

main().catch(console.error); 