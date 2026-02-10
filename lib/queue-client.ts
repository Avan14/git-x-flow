// ============================================================================
// FILE: lib/queue-client.ts
// PURPOSE: BullMQ queue client for scheduling Twitter posts
// ============================================================================

import { Queue } from 'bullmq';

// Redis connection configuration
// Supports local Redis and Upstash (TLS enabled for upstash hosts)
const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
    // Enable TLS for Upstash Redis
    tls: process.env.REDIS_HOST?.includes('upstash') ? {} : undefined,
};

// Twitter post queue - matches the worker's queue name
export const twitterQueue = new Queue('twitter-post', { connection });

// Job data interface - must match what the worker expects
export interface TwitterPostJobData {
    scheduledPostId: string;
    userId: string;
    contentId: string;
    platform: 'twitter';
    content: string;
    mediaUrls?: string[];
    priority: number;
}

/**
 * Schedule a Twitter post by adding it to the BullMQ queue
 * @param data - Job data including post content and metadata
 * @param delayMs - Milliseconds to delay before processing (for scheduled posts)
 * @returns The BullMQ job ID
 */
export async function scheduleTwitterPost(
    data: TwitterPostJobData,
    delayMs = 0
): Promise<string | undefined> {
    const job = await twitterQueue.add('post-tweet', data, {
        delay: delayMs,
        jobId: `tweet-${data.scheduledPostId}`, // Prevents duplicate jobs
        priority: 10 - data.priority,           // BullMQ: lower number = higher priority
        attempts: 3,
        backoff: { type: 'exponential', delay: 60000 }, // 1min, 2min, 4min
    });
    return job.id;
}

/**
 * Get queue statistics for monitoring
 */
export async function getQueueStats() {
    try {
        const counts = await twitterQueue.getJobCounts();
        return {
            waiting: counts.waiting,
            active: counts.active,
            completed: counts.completed,
            failed: counts.failed,
            delayed: counts.delayed,
        };
    } catch (error) {
        console.error('Failed to get queue stats:', error);
        return null;
    }
}

/**
 * Remove a scheduled job from the queue (for unscheduling/deleting)
 * @param scheduledPostId - The scheduled post ID used in jobId
 */
export async function removeScheduledJob(scheduledPostId: string) {
    try {
        const job = await twitterQueue.getJob(`tweet-${scheduledPostId}`);
        if (job) {
            await job.remove();
            return true;
        }
        return false;
    } catch (error) {
        console.error('Failed to remove job:', error);
        return false;
    }
}
