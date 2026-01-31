import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteContent } from "@/lib/content-actions";

export async function DELETE(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const contentId = searchParams.get("id");

        if (!contentId) {
            return NextResponse.json(
                { error: "Content ID is required" },
                { status: 400 }
            );
        }

        await deleteContent(contentId, session.user.id);

        return NextResponse.json({
            success: true,
            message: "Content deleted successfully",
        });
    } catch (error: any) {
        console.error("Delete content error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete content" },
            { status: 500 }
        );
    }
}
