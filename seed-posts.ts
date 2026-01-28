import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });


async function seedScheduledPosts() {
  try {
    const userId = 'cmkx127do0000pwucl2kmsajq'; // AviraL0013
    
    console.log('🌱 Seeding scheduled posts for AviraL0013...');

    // Create Achievement 1: PR Merged
    const achievement1 = await prisma.achievement.create({
      data: {
        userId: userId,
        type: 'pr_merged',
        title: 'Fixed critical bug in authentication system',
        description: 'Resolved a security vulnerability in the JWT token validation',
        repoName: 'awesome-saas-app',
        repoOwner: 'tech-startup',
        repoUrl: 'https://github.com/tech-startup/awesome-saas-app',
        repoStars: 1250,
        prNumber: 142,
        score: 85,
        impactData: {
          linesChanged: 234,
          filesAffected: 8,
        },
        occurredAt: new Date('2024-01-15'),
      },
    });

    console.log('✅ Created achievement 1:', achievement1.id);

    // Create Achievement 2: Popular Repo
    const achievement2 = await prisma.achievement.create({
      data: {
        userId: userId,
        type: 'popular_repo',
        title: 'React components library reached 500 stars',
        description: 'My open-source UI component library hit a milestone',
        repoName: 'react-modern-ui',
        repoOwner: 'AviraL0013',
        repoUrl: 'https://github.com/AviraL0013/react-modern-ui',
        repoStars: 523,
        score: 92,
        impactData: {
          forks: 45,
          contributors: 12,
        },
        occurredAt: new Date('2024-01-10'),
      },
    });

    console.log('✅ Created achievement 2:', achievement2.id);

    // Create Achievement 3: Issue Resolved
    const achievement3 = await prisma.achievement.create({
      data: {
        userId: userId,
        type: 'issue_resolved',
        title: 'Solved long-standing performance issue',
        description: 'Optimized database queries reducing load time by 60%',
        repoName: 'nodejs-backend',
        repoOwner: 'enterprise-corp',
        repoUrl: 'https://github.com/enterprise-corp/nodejs-backend',
        repoStars: 890,
        issueNumber: 78,
        score: 78,
        impactData: {
          performanceGain: '60%',
          affectedUsers: 10000,
        },
        occurredAt: new Date('2024-01-20'),
      },
    });

    console.log('✅ Created achievement 3:', achievement3.id);

    // Create generated content
    const twitterContent1 = await prisma.generatedContent.create({
      data: {
        achievementId: achievement1.id,
        userId: userId,
        format: 'twitter_thread',
        content: '🔒 Just merged a critical security fix in our authentication system!\n\nFixed a JWT token validation vulnerability that could have exposed user sessions. 234 lines changed across 8 files.\n\n🛡️ Always validate those tokens properly, folks!\n\n#Security #WebDev #CyberSecurity',
        wordCount: 45,
        isEdited: false,
      },
    });

    const linkedinContent1 = await prisma.generatedContent.create({
      data: {
        achievementId: achievement1.id,
        userId: userId,
        format: 'linkedin_post',
        content: 'Excited to share that I recently merged a critical security patch for our authentication system at tech-startup. 🔐\n\nThe fix addresses a JWT token validation vulnerability that could have compromised user sessions. This involved careful analysis of 234 lines of code across 8 files.\n\nThis experience reinforced the importance of:\n• Thorough security reviews\n• Proper token validation\n• Never trusting client-side data\n\nSecurity is not a feature, it\'s a requirement. 🛡️\n\n#CyberSecurity #SoftwareEngineering #DevOps #JWT',
        wordCount: 78,
        isEdited: false,
      },
    });

    const twitterContent2 = await prisma.generatedContent.create({
      data: {
        achievementId: achievement2.id,
        userId: userId,
        format: 'twitter_thread',
        content: '🎉 Milestone alert!\n\nMy React component library just hit 500+ stars on GitHub! 🌟\n\nreact-modern-ui now has:\n✨ 523 stars\n🍴 45 forks\n👥 12 contributors\n\nThank you to everyone who contributed and supported this project!\n\n#ReactJS #OpenSource #WebDev',
        wordCount: 42,
        isEdited: false,
      },
    });

    const linkedinContent2 = await prisma.generatedContent.create({
      data: {
        achievementId: achievement2.id,
        userId: userId,
        format: 'linkedin_post',
        content: 'Thrilled to announce that react-modern-ui, my open-source React component library, has reached 500+ stars on GitHub! 🎉\n\nWhat started as a personal project to solve my own UI challenges has grown into a community effort with 45 forks and 12 amazing contributors.\n\nKey learnings from this journey:\n• Open source is about community, not just code\n• Documentation matters as much as features\n• Consistency beats perfection\n\nA huge thank you to everyone who has starred, contributed, or even just tried it out. Your support means the world! 🙏\n\n#OpenSource #ReactJS #WebDevelopment #JavaScript',
        wordCount: 98,
        isEdited: false,
      },
    });

    const twitterContent3 = await prisma.generatedContent.create({
      data: {
        achievementId: achievement3.id,
        userId: userId,
        format: 'twitter_thread',
        content: '⚡ Performance wins!\n\nJust resolved a long-standing issue in our Node.js backend:\n\n📉 Reduced load time by 60%\n👥 Impacted 10,000+ users\n🔍 Root cause: N+1 query problem\n\nOptimized our database queries and the difference is night and day!\n\n#NodeJS #Performance #Backend',
        wordCount: 48,
        isEdited: false,
      },
    });

    console.log('✅ Created all content pieces');

    // Create scheduled posts with various statuses
    const posts = await Promise.all([
      // Published Twitter post
      prisma.scheduledPost.create({
        data: {
          userId: userId,
          contentId: twitterContent1.id,
          platform: 'twitter',
          scheduledFor: new Date('2024-01-16T10:00:00Z'),
          status: 'published',
          ayrshareId: 'ayr_123abc',
          platformPostId: '1747234567890123456',
          platformUrl: 'https://twitter.com/AviraL0013/status/1747234567890123456',
          publishedAt: new Date('2024-01-16T10:00:00Z'),
          attempts: 1,
        },
      }),
      
      // Published LinkedIn post
      prisma.scheduledPost.create({
        data: {
          userId: userId,
          contentId: linkedinContent1.id,
          platform: 'linkedin',
          scheduledFor: new Date('2024-01-16T14:00:00Z'),
          status: 'published',
          ayrshareId: 'ayr_456def',
          platformPostId: 'urn:li:activity:7123456789012345678',
          platformUrl: 'https://www.linkedin.com/feed/update/urn:li:activity:7123456789012345678',
          publishedAt: new Date('2024-01-16T14:00:00Z'),
          attempts: 1,
        },
      }),
      
      // Published Twitter post (achievement 2)
      prisma.scheduledPost.create({
        data: {
          userId: userId,
          contentId: twitterContent2.id,
          platform: 'twitter',
          scheduledFor: new Date('2024-01-11T09:00:00Z'),
          status: 'published',
          ayrshareId: 'ayr_789ghi',
          platformPostId: '1745678901234567890',
          platformUrl: 'https://twitter.com/AviraL0013/status/1745678901234567890',
          publishedAt: new Date('2024-01-11T09:00:00Z'),
          attempts: 1,
        },
      }),
      
      // Pending post
      prisma.scheduledPost.create({
        data: {
          userId: userId,
          contentId: twitterContent3.id,
          platform: 'twitter',
          scheduledFor: new Date('2024-01-28T09:00:00Z'),
          status: 'pending',
          attempts: 0,
        },
      }),
      
      // Processing post
      prisma.scheduledPost.create({
        data: {
          userId: userId,
          contentId: linkedinContent2.id,
          platform: 'linkedin',
          scheduledFor: new Date('2024-01-27T18:00:00Z'),
          status: 'processing',
          processedAt: new Date('2024-01-27T18:00:00Z'),
          attempts: 1,
        },
      }),
      
      // Failed post
      prisma.scheduledPost.create({
        data: {
          userId: userId,
          contentId: twitterContent3.id,
          platform: 'twitter',
          scheduledFor: new Date('2024-01-25T15:00:00Z'),
          status: 'failed',
          errorMessage: 'Authentication failed: Invalid API credentials',
          attempts: 3,
        },
      }),

      // Another pending LinkedIn post
      prisma.scheduledPost.create({
        data: {
          userId: userId,
          contentId: linkedinContent2.id,
          platform: 'linkedin',
          scheduledFor: new Date('2024-01-30T11:00:00Z'),
          status: 'pending',
          attempts: 0,
        },
      }),
    ]);

    console.log(`✅ Created ${posts.length} scheduled posts`);
    console.log('🎉 Seeding completed successfully!');
    
    console.log('\n📊 Summary:');
    console.log(`   • 3 Achievements created`);
    console.log(`   • 5 Content pieces generated`);
    console.log(`   • 7 Scheduled posts created`);
    console.log(`      - 3 Published ✅`);
    console.log(`      - 2 Pending ⏰`);
    console.log(`      - 1 Processing 🔄`);
    console.log(`      - 1 Failed ❌`);
    
    return posts;
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedScheduledPosts()
  .then(() => {
    console.log('\n✨ All done! Visit /dashboard/posts to see your scheduled posts!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed:', error);
    process.exit(1);
  });