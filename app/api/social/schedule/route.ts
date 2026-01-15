// ============================================================================
// FILE: app/api/schedule/route.ts
// PURPOSE: Schedule posts for later & retrieve scheduled posts
// ENDPOINTS: POST (create), GET (list)
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// ============================================================
// Request Validation Schema for POST
// ============================================================
const requestSchema = z.object({
    contentId: z.string(),
    platform: z.enum(["twitter", "linkedin"]),
    scheduledFor: z.string().datetime(),
});

// ============================================================
// POST: Create Scheduled Post
// TODO: Schedule content to be posted at a future time
// Cron job will pick this up when scheduledFor <= now
// ============================================================
export async function POST(request: NextRequest) {
    try {
        // ============================================================
        // STEP 1: Authentication
        // ============================================================
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // ============================================================
        // STEP 2: Parse & Validate Request
        // TODO: Extract contentId, platform, scheduledFor
        // ============================================================
        const body = await request.json();
        const { contentId, platform, scheduledFor } = requestSchema.parse(body);

        // ============================================================
        // STEP 3: Verify Content Ownership
        // TODO: Ensure user owns the content they're scheduling
        // ============================================================
        const content = await prisma.generatedContent.findFirst({
            where: {
                id: contentId,
                userId: session.user.id,
            },
        });

        if (!content) {
            return NextResponse.json(
                { error: "Content not found" },
                { status: 404 }
            );
        }

        // ============================================================
        // STEP 4: Create Scheduled Post Record
        // TODO: Save to database with status 'pending'
        // Cron job will process when time arrives
        // ============================================================
        const scheduledPost = await prisma.scheduledPost.create({
            data: {
                userId: session.user.id,
                contentId,
                platform,
                scheduledFor: new Date(scheduledFor),
                status: "pending", // Will be processed by cron
            },
        });

        // ============================================================
        // STEP 5: Return Scheduled Post Details
        // ============================================================
        return NextResponse.json({
            success: true,
            post: scheduledPost,
        });
    } catch (error) {
        console.error("Schedule error:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request", details: (error as any).errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to schedule post" },
            { status: 500 }
        );
    }
}

// ============================================================
// GET: Retrieve All Scheduled Posts for User
// TODO: Return list with achievement + content data
// ============================================================
export async function GET() {
    try {
        // ============================================================
        // STEP 1: Authentication
        // ============================================================
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // ============================================================
        // STEP 2: Fetch Scheduled Posts
        // TODO: Get all posts for user with related data
        // Includes: content, achievement details
        // Ordered by: most recent first
        // ============================================================
        const posts = await prisma.scheduledPost.findMany({
            where: { userId: session.user.id },
            orderBy: { scheduledFor: "desc" },
            include: {
                content: {
                    include: {
                        achievement: true, // Include source achievement
                    },
                },
            },
        });

        // ============================================================
        // STEP 3: Return Posts List
        // ============================================================
        return NextResponse.json({ posts });
    } catch (error) {
        console.error("Fetch scheduled posts error:", error);
        return NextResponse.json(
            { error: "Failed to fetch scheduled posts" },
            { status: 500 }
        );
    }
}
