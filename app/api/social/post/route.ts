// ============================================================================
// FILE: app/api/social/post/route.ts
// PURPOSE: Post content immediately to Twitter/LinkedIn via Ayrshare
// FLOW: Validate → Post to Ayrshare → Save to DB → Return Success
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { postToSocial } from "@/lib/ayrshare";
import { z } from "zod";
import type { Platform } from "@/types";

// ============================================================
// Request Validation Schema
// TODO: Ensure incoming data is valid before processing
// ============================================================
const requestSchema = z.object({
    content: z.string().min(1).max(10000),
    platforms: z.array(z.enum(["twitter", "linkedin"])).min(1),
    contentId: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        // ============================================================
        // STEP 1: Authentication
        // TODO: Verify user is logged in
        // ============================================================
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // ============================================================
        // STEP 2: Parse & Validate Request Body
        // TODO: Extract content, platforms, and optional contentId
        // Zod validates format automatically
        // ============================================================
        const body = await request.json();
        const { content, platforms, contentId } = requestSchema.parse(body);

        // ============================================================
        // STEP 3: Post to Social Media via Ayrshare
        // TODO: Ayrshare handles multi-platform posting
        // Returns: { id, status, postIds: [{platform, id, url}] }
        // ============================================================
        const result = await postToSocial({
            content,
            platforms: platforms as Platform[],
        });

        // ============================================================
        // STEP 4: Save Post Records to Database
        // TODO: If contentId provided, create ScheduledPost records
        // This tracks which content was posted where
        // Status is 'published' since it's immediate
        // ============================================================
        if (contentId) {
            for (const platform of platforms) {
                const postInfo = result.postIds?.find((p) => p.platform === platform);
                await prisma.scheduledPost.create({
                    data: {
                        userId: session.user.id,
                        contentId,
                        platform,
                        scheduledFor: new Date(), // Immediate posting
                        status: "published",
                        ayrshareId: result.id,
                        platformPostId: postInfo?.id,
                        platformUrl: postInfo?.url,
                        publishedAt: new Date(),
                    },
                });
            }
        }

        // ============================================================
        // STEP 5: Return Success Response
        // TODO: Send back Ayrshare result with post URLs
        // ============================================================
        return NextResponse.json({
            success: true,
            result,
        });
    } catch (error) {
        console.error("Social post error:", error);

        // ============================================================
        // Error Handling: Validation vs General Errors
        // ============================================================
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request", details: (error as any).errors },
                { status: 400 }
            );
        }

        const message = error instanceof Error ? error.message : "Failed to post";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
