import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateContent, countWords, type ContentFormat } from "@/lib/gemini";
import { z } from "zod";

const requestSchema = z.object({
    achievementId: z.string(),
    format: z.enum(["resume_bullet", "linkedin_post", "twitter_thread"]),
});

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { achievementId, format } = requestSchema.parse(body);

        // Fetch the achievement
        const achievement = await prisma.achievement.findFirst({
            where: {
                id: achievementId,
                userId: session.user.id,
            },
        });

        if (!achievement) {
            return NextResponse.json(
                { error: "Achievement not found" },
                { status: 404 }
            );
        }

        // Check if content already exists for this format
        const existingContent = await prisma.generatedContent.findFirst({
            where: {
                achievementId,
                format,
            },
        });

        if (existingContent) {
            return NextResponse.json({
                success: true,
                content: existingContent,
                cached: true,
            });
        }

        // Generate new content using Gemini
        const generatedText = await generateContent(
            {
                type: achievement.type,
                title: achievement.title,
                description: achievement.description,
                repoName: achievement.repoName,
                repoOwner: achievement.repoOwner,
                repoStars: achievement.repoStars,
                prNumber: achievement.prNumber,
                impactData: achievement.impactData as {
                    linesAdded?: number;
                    linesRemoved?: number;
                    filesChanged?: number;
                } | null,
            },
            format as ContentFormat
        );

        // Save the generated content
        const content = await prisma.generatedContent.create({
            data: {
                achievementId,
                userId: session.user.id,
                format,
                content: generatedText,
                wordCount: countWords(generatedText),
            },
        });

        return NextResponse.json({
            success: true,
            content,
            cached: false,
        });
    } catch (error) {
        console.error("Content generation error:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request", details: (error as any).errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to generate content" },
            { status: 500 }
        );
    }
}
