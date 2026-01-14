import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const requestSchema = z.object({
    contentId: z.string(),
    platform: z.enum(["twitter", "linkedin"]),
    scheduledFor: z.string().datetime(),
});

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { contentId, platform, scheduledFor } = requestSchema.parse(body);

        // Verify the content belongs to the user
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

        // Create scheduled post
        const scheduledPost = await prisma.scheduledPost.create({
            data: {
                userId: session.user.id,
                contentId,
                platform,
                scheduledFor: new Date(scheduledFor),
                status: "pending",
            },
        });

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

// Get scheduled posts
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const posts = await prisma.scheduledPost.findMany({
            where: { userId: session.user.id },
            orderBy: { scheduledFor: "desc" },
            include: {
                content: {
                    include: {
                        achievement: true,
                    },
                },
            },
        });

        return NextResponse.json({ posts });
    } catch (error) {
        console.error("Fetch scheduled posts error:", error);
        return NextResponse.json(
            { error: "Failed to fetch scheduled posts" },
            { status: 500 }
        );
    }
}
