import { prisma } from "./db";

/**
 * Dashboard Data Utilities
 * Server-side functions for fetching dashboard metrics and data
 */

// Get achievements count metrics
export async function getAchievementsMetrics(userId: string) {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [total, thisWeek, shareable] = await Promise.all([
        // Total achievements
        prisma.achievement.count({
            where: { userId },
        }),
        // Achievements from this week
        prisma.achievement.count({
            where: {
                userId,
                occurredAt: { gte: oneWeekAgo },
            },
        }),
        // Shareable achievements (score > 5)
        prisma.achievement.count({
            where: {
                userId,
                score: { gt: 5 },
            },
        }),
    ]);

    return { total, thisWeek, shareable };
}

// Get usage metrics for current month
export async function getUsageMetrics(userId: string) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    const usageRecord = await prisma.usageRecord.findUnique({
        where: {
            userId_month_year: {
                userId,
                month: currentMonth,
                year: currentYear,
            },
        },
    });

    // Free tier limits
    const monthlyLimit = 6;
    const postsGenerated = usageRecord?.postsGenerated || 0;
    const postsPublished = usageRecord?.postsPublished || 0;
    const creditsRemaining = Math.max(0, monthlyLimit - postsGenerated);

    return {
        postsGenerated,
        postsPublished,
        monthlyLimit,
        creditsRemaining,
    };
}

// Get recent achievements for activity stream
export async function getRecentAchievements(
    userId: string,
    limit: number = 10
) {
    const achievements = await prisma.achievement.findMany({
        where: { userId },
        orderBy: { occurredAt: "desc" },
        take: limit,
        include: {
            content: {
                select: {
                    id: true,
                },
            },
        },
    });

    return achievements.map((achievement: any) => ({
        id: achievement.id,
        type: achievement.type,
        title: achievement.title,
        description: achievement.description || "",
        repoName: achievement.repoName,
        repoUrl: achievement.repoUrl,
        occurredAt: achievement.occurredAt,
        score: achievement.score,
        hasGeneratedContent: achievement.content.length > 0,
    }));
}

// Get posts metrics
export async function getPostsMetrics(userId: string) {
    const [generated, published, pending] = await Promise.all([
        prisma.generatedContent.count({
            where: { userId },
        }),
        prisma.scheduledPost.count({
            where: {
                userId,
                status: "published",
            },
        }),
        prisma.scheduledPost.count({
            where: {
                userId,
                status: "pending",
            },
        }),
    ]);

    return { generated, published, pending };
}

// Get monthly GitHub stats
export async function getMonthlyGitHubStats(userId: string) {
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get achievements from last 30 days and aggregate
    const achievements = await prisma.achievement.findMany({
        where: {
            userId,
            occurredAt: { gte: oneMonthAgo },
        },
    });

    // Count different types
    const totalAchievements = achievements.length;
    const prsMerged = achievements.filter((a: any) => a.type === "pr_merged" || a.type === "first_contribution").length;
    const issues = achievements.filter((a: any) => a.type === "issue_resolved").length;

    // Sum up stars from all achievements' repos
    const starsGained = achievements
        .reduce((sum: number, a: any) => sum + (a.repoStars || 0), 0);

    return {
        totalAchievements,
        prsMerged,
        issues,
        starsGained,
    };
}

// Get top repositories by achievement count
export async function getTopRepositories(userId: string, limit: number = 5) {
    const achievements = await prisma.achievement.findMany({
        where: { userId },
        select: {
            repoName: true,
        },
    });

    // Count achievements per repo
    const repoCounts = achievements.reduce(
        (acc: Record<string, number>, a: any) => {
            acc[a.repoName] = (acc[a.repoName] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    // Convert to array and sort
    const topRepos = Object.entries(repoCounts)
        .map(([name, count]) => ({ name, count: Number(count) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

    return topRepos;
}

// Get user subscription info
export async function getUserSubscription(userId: string) {
    const subscription = await prisma.subscription.findUnique({
        where: { userId },
    });

    return subscription || { plan: "free", status: "active" };
}

// Get portfolio stats (if exists)
export async function getPortfolioStats(userId: string) {
    const portfolio = await prisma.portfolio.findUnique({
        where: { userId },
    });

    if (!portfolio) return null;

    // Calculate completeness score
    let completeness = 0;
    if (portfolio.bio) completeness += 25;
    if (portfolio.headline) completeness += 25;
    if (portfolio.isPublic) completeness += 25;
    if (portfolio.username) completeness += 25;

    return {
        views: 0, // TODO: Implement view tracking
        completeness,
        username: portfolio.username,
    };
}
