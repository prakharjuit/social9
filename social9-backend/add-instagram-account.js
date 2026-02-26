// add-instagram-account.js
// Run this script to add your Instagram account to the database
// Usage: node add-instagram-account.js

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addInstagramAccount() {
  try {
    console.log('🔍 Finding user...');
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: 'chauhanprakhar536@gmail.com' }
    });

    if (!user) {
      console.error('❌ User not found with email: chauhanprakhar536@gmail.com');
      console.log('💡 Make sure you have signed up with this email first!');
      process.exit(1);
    }

    console.log('✅ User found:', user.email);
    console.log('   User ID:', user.id);

    // Check if Instagram account already exists
    const existing = await prisma.socialAccount.findFirst({
      where: {
        userId: user.id,
        platform: 'INSTAGRAM',
        platformUserId: '17841452939050608'
      }
    });

    if (existing) {
      console.log('⚠️  Instagram account already exists! Updating...');
      
      // Update existing account
      const updated = await prisma.socialAccount.update({
        where: { id: existing.id },
        data: {
          accessToken: 'EAAMRJc6444wBQ6Gx5X6sSdM2adga2aqzUnZCTPI1dBUEsO2RkFdNFBErD0rdddBSbb1sGEqvuURAq27L22ZAe0q6ZCaYsXPVjqDCAhUZCHWq2jX1PbBCydbbRZA6r2zujsrjbLeYLuOPjZBNjbkD0MjVSeH9Sl7zWWJf0dbxqzhkfMnezgrQRVd0ZAjPkBD',
          tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          status: 'ACTIVE',
          errorMessage: null
        }
      });

      console.log('✅ Instagram account updated!');
      console.log('   Account ID:', updated.id);
      console.log('   Platform User ID:', updated.platformUserId);
      console.log('   Status:', updated.status);
      
    } else {
      console.log('📝 Creating new Instagram account...');
      
      // Create new account
      const account = await prisma.socialAccount.create({
        data: {
          userId: user.id,
          platform: 'INSTAGRAM',
          platformUserId: '17841452939050608',
          platformUsername: 'prakharjuit', // Update with your actual username if different
          platformDisplayName: 'Prakhar Chauhan', // Update with your actual name
          accessToken: 'EAAMRJc6444wBQ6Gx5X6sSdM2adga2aqzUnZCTPI1dBUEsO2RkFdNFBErD0rdddBSbb1sGEqvuURAq27L22ZAe0q6ZCaYsXPVjqDCAhUZCHWq2jX1PbBCydbbRZA6r2zujsrjbLeYLuOPjZBNjbkD0MjVSeH9Sl7zWWJf0dbxqzhkfMnezgrQRVd0ZAjPkBD',
          tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          status: 'ACTIVE',
          metadata: {}
        }
      });

      console.log('✅ Instagram account created successfully!');
      console.log('   Account ID:', account.id);
      console.log('   Platform User ID:', account.platformUserId);
      console.log('   Status:', account.status);
    }

    // Verify by fetching all social accounts for this user
    const allAccounts = await prisma.socialAccount.findMany({
      where: { userId: user.id }
    });

    console.log('\n📊 All connected accounts for this user:');
    allAccounts.forEach(acc => {
      console.log(`   - ${acc.platform}: ${acc.platformUsername || acc.platformUserId} (${acc.status})`);
    });

    console.log('\n🎉 Done! Instagram account is now connected.');
    console.log('💡 Go to https://social9-ul4j.vercel.app and login to see it!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
addInstagramAccount();