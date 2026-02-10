import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllContent } from "@/lib/content-actions";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const content = await getAllContent(session.user.id);

        return NextResponse.json({
            success: true,
            content,
        });
    } catch (error: any) {
        console.error("List content error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to list content" },
            { status: 500 }
        );
    }
}
