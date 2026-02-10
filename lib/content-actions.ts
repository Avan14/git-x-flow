import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { twitterQueue } from "@/lib/queue-client";

// Type definitions
export interface SaveContentParams {
    content: string;
    format: string;
    achievementId?: string;
    platform?: string;
}

export interface ScheduleContentParams {
    content: string;
    format: string;
    achievementId?: string;
    platform: string;
    scheduledAt: Date;
}

// Helper to check if user has connected Twitter
async function checkTwitterConnection(userId: string): Promise<boolean> {
    const connection = await prisma.socialConnection.findFirst({
        where: {
            userId,
            platform: 'twitter',
            isActive: true,
        },
    });
    return !!connection;
}

// Get content by status
export async function getContentByStatus(
    userId: string,
    status: "saved" | "scheduled" | "posted"
) {
    return prisma.generatedContent.findMany({
        where: { userId, status },
        orderBy: { createdAt: "desc" },
        include: {
            achievement: {
                select: {
                    id: true,
                    title: true,
                    repoName: true,
                    type: true,
                },
            },
        },
    });
}

// Get all content for user (for Posts page)
export async function getAllContent(userId: string, limit = 50) {
    return prisma.generatedContent.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
            achievement: {
                select: {
                    id: true,
                    title: true,
                    repoName: true,
                    type: true,
                },
            },
        },
    });
}

// Save content (status = "saved")
export async function saveContent(userId: string, params: SaveContentParams) {
    // Get a default achievement if not provided
    let achievementId = params.achievementId;

    if (!achievementId) {
        const latestAchievement = await prisma.achievement.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        achievementId = latestAchievement?.id;
    }

    if (!achievementId) {
        throw new Error("No achievement found. Please sync your GitHub data first.");
    }

    return prisma.generatedContent.create({
        data: {
            userId,
            achievementId,
            content: params.content,
            format: params.format,
            platform: params.platform || "twitter",
            status: "saved",
            wordCount: params.content.split(/\s+/).length,
        },
    });
}

// Schedule content (status = "scheduled")
export async function scheduleContent(
    userId: string,
    params: ScheduleContentParams
) {
    let achievementId = params.achievementId;

    if (!achievementId) {
        const latestAchievement = await prisma.achievement.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        achievementId = latestAchievement?.id;
    }

    if (!achievementId) {
        throw new Error("No achievement found. Please sync your GitHub data first.");
    }

    // Validate Twitter connection if platform is Twitter
    if (params.platform === "twitter") {
        const isConnected = await checkTwitterConnection(userId);
        if (!isConnected) {
            throw new Error("Twitter not connected. Please connect your Twitter account in Settings before scheduling posts.");
        }
    }

    // Create the GeneratedContent with scheduled status
    const content = await prisma.generatedContent.create({
        data: {
            userId,
            achievementId,
            content: params.content,
            format: params.format,
            platform: params.platform,
            status: "scheduled",
            scheduledAt: params.scheduledAt,
            wordCount: params.content.split(/\s+/).length,
        },
    });

    // Create ScheduledPost job for background worker
    const scheduledPost = await prisma.scheduledPost.create({
        data: {
            userId,
            contentId: content.id,
            platform: params.platform,
            scheduledFor: params.scheduledAt,
            status: "pending",
        },
    });

    // Calculate delay until scheduled time
    const delay = Math.max(0, params.scheduledAt.getTime() - Date.now());

    // Add to BullMQ queue (currently only Twitter supported)
    if (params.platform === "twitter") {
        try {
            const job = await twitterQueue.add(
                "post-tweet",
                {
                    scheduledPostId: scheduledPost.id,
                    userId,
                    contentId: content.id,
                    platform: "twitter",
                    content: params.content,
                    priority: 0,
                },
                {
                    delay,
                    jobId: `tweet-${scheduledPost.id}`,
                    attempts: 3,
                    backoff: { type: "exponential", delay: 60000 },
                }
            );

            // Update ScheduledPost with job ID and queued status
            await prisma.scheduledPost.update({
                where: { id: scheduledPost.id },
                data: {
                    jobId: job.id,
                    status: "queued",
                    queuedAt: new Date(),
                },
            });
        } catch (error) {
            console.error("Failed to add job to queue:", error);
            // Post remains in 'pending' status - scheduler can retry later
        }
    }

    return content;
}

// Mark content as posted
export async function markAsPosted(
    contentId: string,
    platformPostId?: string,
    platformUrl?: string
) {
    return prisma.generatedContent.update({
        where: { id: contentId },
        data: {
            status: "posted",
            postedAt: new Date(),
            platformPostId,
            platformUrl,
        },
    });
}

// Delete content (and associated ScheduledPost if exists)
export async function deleteContent(contentId: string, userId: string) {
    // First verify ownership
    const content = await prisma.generatedContent.findFirst({
        where: { id: contentId, userId },
    });

    if (!content) {
        throw new Error("Content not found or unauthorized");
    }

    if (content.status === "posted") {
        throw new Error("Cannot delete posted content");
    }

    // Delete associated ScheduledPost if exists
    await prisma.scheduledPost.deleteMany({
        where: { contentId },
    });

    // Delete the content
    return prisma.generatedContent.delete({
        where: { id: contentId },
    });
}

// Update content status (for transitioning saved → scheduled)
export async function updateContentSchedule(
    contentId: string,
    userId: string,
    platform: string,
    scheduledAt: Date
) {
    const content = await prisma.generatedContent.findFirst({
        where: { id: contentId, userId },
    });

    if (!content) {
        throw new Error("Content not found or unauthorized");
    }

    if (content.status !== "saved") {
        throw new Error("Can only schedule saved content");
    }

    // Validate Twitter connection if platform is Twitter
    if (platform === "twitter") {
        const isConnected = await checkTwitterConnection(userId);
        if (!isConnected) {
            throw new Error("Twitter not connected. Please connect your Twitter account in Settings before scheduling posts.");
        }
    }

    // Update content to scheduled
    const updated = await prisma.generatedContent.update({
        where: { id: contentId },
        data: {
            status: "scheduled",
            scheduledAt,
            platform,
        },
    });

    // Create ScheduledPost job
    const scheduledPost = await prisma.scheduledPost.create({
        data: {
            userId,
            contentId,
            platform,
            scheduledFor: scheduledAt,
            status: "pending",
        },
    });

    // Calculate delay and add to queue
    const delay = Math.max(0, scheduledAt.getTime() - Date.now());

    if (platform === "twitter") {
        try {
            const job = await twitterQueue.add(
                "post-tweet",
                {
                    scheduledPostId: scheduledPost.id,
                    userId,
                    contentId,
                    platform: "twitter",
                    content: content.content,
                    priority: 0,
                },
                {
                    delay,
                    jobId: `tweet-${scheduledPost.id}`,
                    attempts: 3,
                    backoff: { type: "exponential", delay: 60000 },
                }
            );

            await prisma.scheduledPost.update({
                where: { id: scheduledPost.id },
                data: {
                    jobId: job.id,
                    status: "queued",
                    queuedAt: new Date(),
                },
            });
        } catch (error) {
            console.error("Failed to add job to queue:", error);
        }
    }

    return updated;
}
