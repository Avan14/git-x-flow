import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateContentSchedule } from "@/lib/content-actions";

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { contentId, platform, scheduledAt } = body;

        if (!contentId || !platform || !scheduledAt) {
            return NextResponse.json(
                { error: "contentId, platform, and scheduledAt are required" },
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

        const updated = await updateContentSchedule(
            contentId,
            session.user.id,
            platform,
            scheduledDate
        );

        return NextResponse.json({
            success: true,
            content: updated,
        });
    } catch (error: any) {
        console.error("Reschedule content error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to reschedule content" },
            { status: 500 }
        );
    }
}
