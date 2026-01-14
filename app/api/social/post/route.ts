import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { postToSocial } from "@/lib/ayrshare";
import { z } from "zod";
import type { Platform } from "@/types";

const requestSchema = z.object({
    content: z.string().min(1).max(10000),
    platforms: z.array(z.enum(["twitter", "linkedin"])).min(1),
    contentId: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { content, platforms, contentId } = requestSchema.parse(body);

        // Post to social media via Ayrshare
        const result = await postToSocial({
            content,
            platforms: platforms as Platform[],
        });

        // If we have a content ID, save the post record
        if (contentId) {
            for (const platform of platforms) {
                const postInfo = result.postIds?.find((p) => p.platform === platform);
                await prisma.scheduledPost.create({
                    data: {
                        userId: session.user.id,
                        contentId,
                        platform,
                        scheduledFor: new Date(),
                        status: "published",
                        ayrshareId: result.id,
                        platformPostId: postInfo?.id,
                        platformUrl: postInfo?.url,
                        publishedAt: new Date(),
                    },
                });
            }
        }

        return NextResponse.json({
            success: true,
            result,
        });
    } catch (error) {
        console.error("Social post error:", error);

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
