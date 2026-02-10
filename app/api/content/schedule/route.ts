import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { scheduleContent } from "@/lib/content-actions";

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { content, format, achievementId, platform, scheduledAt } = body;

        if (!content || !format || !platform || !scheduledAt) {
            return NextResponse.json(
                { error: "Content, format, platform, and scheduledAt are required" },
                { status: 400 }
            );
        }

        const scheduledDate = new Date(scheduledAt);
        if (isNaN(scheduledDate.getTime())) {
            return NextResponse.json(
                { error: "Invalid scheduledAt date" },
                { status: 400 }
            );
        }

        if (scheduledDate <= new Date()) {
            return NextResponse.json(
                { error: "Scheduled time must be in the future" },
                { status: 400 }
            );
        }

        const scheduled = await scheduleContent(session.user.id, {
            content,
            format,
            achievementId,
            platform,
            scheduledAt: scheduledDate,
        });

        return NextResponse.json({
            success: true,
            content: scheduled,
        });
    } catch (error: any) {
        console.error("Schedule content error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to schedule content" },
            { status: 500 }
        );
    }
}
