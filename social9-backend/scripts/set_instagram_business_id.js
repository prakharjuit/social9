#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const businessId = process.argv[3];
  const token = process.argv[4];

  if (!email || !businessId) {
    console.log('Usage: node scripts/set_instagram_business_id.js user@example.com 178414... [accessToken]');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error('User not found for email:', email);
    process.exit(1);
  }

  const account = await prisma.socialAccount.findFirst({ where: { userId: user.id, platform: 'INSTAGRAM' } });

  const data = {
    platformUserId: businessId
  };
  if (token) data.accessToken = token;
  data.status = 'ACTIVE';

  if (account) {
    await prisma.socialAccount.update({ where: { id: account.id }, data });
    console.log('Updated SocialAccount', account.id);
  } else {
    await prisma.socialAccount.create({ data: {
      userId: user.id,
      platform: 'INSTAGRAM',
      platformUserId: businessId,
      accessToken: token || '',
      status: 'ACTIVE'
    }});
    console.log('Created SocialAccount for user', email);
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
