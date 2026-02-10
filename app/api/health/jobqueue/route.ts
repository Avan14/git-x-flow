import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getQueueStats } from "@/lib/queue-client";

/**
 * Job Queue Health Check
 * Returns statistics about pending/processing jobs from both DB and Redis queue
 */
export async function GET() {
    try {
        // Database stats
        const [pending, queued, processing, published, failed] = await Promise.all([
            prisma.scheduledPost.count({ where: { status: "pending" } }),
            prisma.scheduledPost.count({ where: { status: "queued" } }),
            prisma.scheduledPost.count({ where: { status: "processing" } }),
            prisma.scheduledPost.count({ where: { status: "published" } }),
            prisma.scheduledPost.count({ where: { status: "failed" } }),
        ]);

        // Redis queue stats (may be null if Redis unavailable)
        const queueStats = await getQueueStats();

        return NextResponse.json({
            status: "healthy",
            database: {
                pending,
                queued,
                processing,
                published,
                failed,
                total: pending + queued + processing + published + failed,
            },
            queue: queueStats || { error: "Redis unavailable" },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Job queue health check failed:", error);
        return NextResponse.json(
            { status: "unhealthy", error: "Health check failed" },
            { status: 500 }
        );
    }
}
