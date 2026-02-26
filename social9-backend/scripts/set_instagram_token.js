#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.EMAIL || process.argv[2];
  const token = process.env.TOKEN || process.argv[3];

  if (!email || !token) {
    console.log('Usage: EMAIL=you@example.com TOKEN=your_token node scripts/set_instagram_token.js');
    console.log('Or: node scripts/set_instagram_token.js you@example.com your_token');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error('User not found for email:', email);
    process.exit(1);
  }

  // Try to auto-detect IG user id / username using the provided token
  let platformUserId = null;
  let platformUsername = null;

  try {
    // First try: /me (works for user tokens)
    try {
      const resp = await axios.get('https://graph.facebook.com/v18.0/me', {
        params: {
          access_token: token,
          fields: 'id,username,name'
        }
      });

      if (resp?.data?.id) {
        platformUserId = resp.data.id;
        platformUsername = resp.data.username || resp.data.name || null;
        console.log('Detected platform user id via /me:', platformUserId);
      }
    } catch (errMe) {
      // If /me fails or doesn't return IG info, try /me/accounts to find a connected Page with instagram_business_account
      console.warn('/me lookup failed or incomplete, trying /me/accounts:', errMe.response?.data || errMe.message);
      try {
        const pages = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
          params: {
            access_token: token,
            fields: 'id,name,access_token,instagram_business_account'
          }
        });

        const pageWithIg = (pages.data.data || []).find(p => p.instagram_business_account && p.instagram_business_account.id);
        if (pageWithIg) {
          platformUserId = pageWithIg.instagram_business_account.id;
          platformUsername = pageWithIg.name || null;
          // Prefer storing the page access token as accessToken so insights calls work
          // but we will still store the passed token in case it's already a page token
          console.log('Detected Instagram business account id via /me/accounts:', platformUserId);
        } else {
          console.warn('No Instagram Business account found in /me/accounts response');
        }
      } catch (errAccounts) {
        console.warn('/me/accounts lookup failed:', errAccounts.response?.data || errAccounts.message);
      }
    }
  } catch (err) {
    console.warn('Could not detect IG user id from token:', err.response?.data || err.message);
  }

  if (!platformUserId) {
    platformUserId = 'manual-' + crypto.randomBytes(6).toString('hex');
    console.log('Using generated platformUserId:', platformUserId);
  }

  // Try to find an existing INSTAGRAM account for this user
  const existing = await prisma.socialAccount.findFirst({
    where: { userId: user.id, platform: 'INSTAGRAM' }
  });

  const data = {
    userId: user.id,
    platform: 'INSTAGRAM',
    platformUserId,
    platformUsername,
    accessToken: token,
    status: 'ACTIVE',
    tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
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
