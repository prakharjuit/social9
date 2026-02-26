#!/usr/bin/env node
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const email = 'vcuestore123@gmail.com';
const token = 'EAAWEib6MPfoBQ49afvoWen3P6QOZBwrZC5xhSCtWMbDlQ8B2G9pjes1syZAAOt6Jp5weiZC5EFZBag6wkWXqrYvNtSZBBiYTJersv5KhKo86CDHbC7syKARZBqP6qiPpIhoR1rjFf3FZAbm1DWhUifAkKr98ZBQ2lep0e00cmrZB9zgEuBWy9JhZANreCmP9FSr';

async function main() {
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const passwordHash = bcrypt.hashSync('testpassword123', 10);
    user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name: 'VCUE Store'
      }
    });
    console.log('Created user', email);
  } else {
    console.log('User already exists:', email);
  }

  const platformUserId = 'manual-' + Date.now();

  const existing = await prisma.socialAccount.findFirst({
    where: { userId: user.id, platform: 'INSTAGRAM' }
  });

  const data = {
    userId: user.id,
    platform: 'INSTAGRAM',
    platformUserId,
    platformUsername: 'vcuestore123',
    accessToken: token,
    status: 'ACTIVE',
    tokenExpiresAt: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000) // 10 years
  };

  if (existing) {
    await prisma.socialAccount.update({ where: { id: existing.id }, data });
    console.log('Updated existing Instagram socialAccount for user', email);
  } else {
    await prisma.socialAccount.create({ data });
    console.log('Created Instagram socialAccount for user', email);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Script error:', err);
  prisma.$disconnect();
  process.exit(1);
});
