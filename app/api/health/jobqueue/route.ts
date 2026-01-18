import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Job Queue Health Check
 * Returns statistics about pending/processing jobs
 */
export async function GET() {
    try {
        const [pending, processing, published, failed] = await Promise.all([
            prisma.scheduledPost.count({ where: { status: "pending" } }),
            prisma.scheduledPost.count({ where: { status: "processing" } }),
            prisma.scheduledPost.count({ where: { status: "published" } }),
            prisma.scheduledPost.count({ where: { status: "failed" } }),
        ]);

        return NextResponse.json({
            status: "healthy",
            jobs: {
                pending,
                processing,
                published,
                failed,
                total: pending + processing + published + failed,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Job queue health check failed:", error);
        return NextResponse.json(
            { status: "unhealthy", error: "Database connection failed" },
            { status: 500 }
        );
    }
}
