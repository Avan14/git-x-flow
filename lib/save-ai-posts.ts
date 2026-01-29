import { prismaClient } from "@/lib/db";

interface Activity {
  type: string;
  title: string;
  score: number;
  reasoning: string;
  platforms: string[];
  highlights: string[];
}

interface PostSet {
  activity: Activity;
  posts: Record<string, string>;
}

/**
 * Save AI-generated posts to database after generation
 */
export async function saveAIPostsToDB(
  userId: string,
  postSets: PostSet[],
  githubData: any
) {
  try {
    console.log(`💾 Saving ${postSets.length} post sets to database...`);
    
    const savedRecords = [];

    for (const postSet of postSets) {
      const { activity, posts } = postSet;

      // Extract repo info from activity title
      let repoName = "unknown";
      let repoOwner = "unknown";
      let prNumber = null;

      // Try to extract from title like "Merged PR: Database & Settings Page for git-x-flow"
      const titleMatch = activity.title.match(/for (.+?)(?:\s|$)/i);
      if (titleMatch) {
        repoName = titleMatch[1].trim();
      }

      // Try to find PR number
      const prMatch = activity.title.match(/PR[:\s#]*(\d+)/i);
      if (prMatch) {
        prNumber = parseInt(prMatch[1]);
      }

      // Try to find repo in githubData
      let repoUrl = `https://github.com/${repoName}`;
      let repoStars = 0;

      if (githubData?.repos) {
        const matchingRepo = githubData.repos.find(
          (r: any) => 
            r.name === repoName || 
            r.full_name?.includes(repoName) ||
            r.name?.toLowerCase() === repoName.toLowerCase()
        );
        
        if (matchingRepo) {
          repoUrl = matchingRepo.html_url;
          repoStars = matchingRepo.stargazers_count || 0;
          repoOwner = matchingRepo.owner?.login || repoOwner;
          repoName = matchingRepo.name;
        }
      }

      // Determine achievement type
      let achievementType = "pr_merged";
      if (activity.title.toLowerCase().includes("merged pr")) {
        achievementType = "pr_merged";
      } else if (activity.title.toLowerCase().includes("new repo")) {
        achievementType = "popular_repo";
      } else if (activity.title.toLowerCase().includes("issue")) {
        achievementType = "issue_resolved";
      }

      // Create Achievement
      const achievement = await prismaClient.achievement.create({
        data: {
          userId,
          type: achievementType,
          title: activity.title,
          description: activity.reasoning,
          repoName,
          repoOwner,
          repoUrl,
          repoStars,
          prNumber,
          score: activity.score,
          impactData: {
            highlights: activity.highlights || [],
            platforms: activity.platforms || [],
            activityType: activity.type,
          },
          occurredAt: new Date(),
        },
      });

      console.log(`✅ Created achievement: ${achievement.id} - ${achievement.title}`);

      // Create GeneratedContent for each platform
      const generatedContents = [];
      for (const [platform, content] of Object.entries(posts)) {
        const wordCount = content.split(/\s+/).length;
        
        const generatedContent = await prismaClient.generatedContent.create({
          data: {
            achievementId: achievement.id,
            userId,
            format: platform === "twitter" ? "twitter_thread" : "linkedin_post",
            content,
            wordCount,
            isEdited: false,
          },
        });

        generatedContents.push(generatedContent);
        console.log(`  ✅ Created ${platform} post: ${generatedContent.id}`);
      }

      // Update usage record
      await updateUsageRecord(userId, Object.keys(posts).length);

      savedRecords.push({
        achievement,
        generatedContents,
      });
    }

    console.log(`✅ Successfully saved ${savedRecords.length} achievements and ${savedRecords.reduce((sum, r) => sum + r.generatedContents.length, 0)} posts to database`);
    
    return savedRecords;
  } catch (error) {
    console.error("❌ Error saving AI posts to database:", error);
    throw error;
  }
}

/**
 * Update usage record for current month
 */
async function updateUsageRecord(userId: string, postsGenerated: number) {
  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  await prismaClient.usageRecord.upsert({
    where: {
      userId_month_year: {
        userId,
        month,
        year,
      },
    },
    update: {
      postsGenerated: {
        increment: postsGenerated,
      },
      apiCallsUsed: {
        increment: 1,
      },
      updatedAt: new Date(),
    },
    create: {
      userId,
      month,
      year,
      postsGenerated,
      postsPublished: 0,
      apiCallsUsed: 1,
    },
  });

  console.log(`  ✅ Updated usage record: +${postsGenerated} posts this month`);
}

/**
 * Check if user can generate more posts
 */
export async function checkCanGenerate(userId: string): Promise<{
  canGenerate: boolean;
  used: number;
  limit: number;
  remaining: number;
  plan: string;
}> {
  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  // Get subscription
  const subscription = await prismaClient.subscription.findUnique({
    where: { userId },
  });

  const plan = subscription?.plan || "free";
  const limit = plan === "pro" ? 50 : 5;

  // Get usage
  const usageRecord = await prismaClient.usageRecord.findUnique({
    where: {
      userId_month_year: {
        userId,
        month,
        year,
      },
    },
  });

  const used = usageRecord?.postsGenerated || 0;
  const remaining = Math.max(0, limit - used);
  const canGenerate = used < limit;

  return {
    canGenerate,
    used,
    limit,
    remaining,
    plan,
  };
}