import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveContent } from "@/lib/content-actions";

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { content, format, achievementId, platform } = body;

        if (!content || !format) {
            return NextResponse.json(
                { error: "Content and format are required" },
                { status: 400 }
            );
        }

        const saved = await saveContent(session.user.id, {
            content,
            format,
            achievementId,
            platform,
        });

        return NextResponse.json({
            success: true,
            content: saved,
        });
    } catch (error: any) {
        console.error("Save content error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to save content" },
            { status: 500 }
        );
    }
}
