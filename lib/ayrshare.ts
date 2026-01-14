import type { AyrsharePostResponse, Platform } from "@/types";

const AYRSHARE_BASE_URL = "https://api.ayrshare.com/api";

/**
 * Post content to social media platforms via Ayrshare API
 */
export async function postToSocial(params: {
    content: string;
    platforms: Platform[];
    scheduleDate?: Date;
    mediaUrls?: string[];
}): Promise<AyrsharePostResponse> {
    const apiKey = process.env.AYRSHARE_API_KEY;

    if (!apiKey) {
        throw new Error("AYRSHARE_API_KEY is not configured");
    }

    const body: Record<string, unknown> = {
        post: params.content,
        platforms: params.platforms,
    };

    // Add schedule date if provided
    if (params.scheduleDate) {
        body.scheduleDate = params.scheduleDate.toISOString();
    }

    // Add media URLs if provided
    if (params.mediaUrls && params.mediaUrls.length > 0) {
        body.mediaUrls = params.mediaUrls;
    }

    // Enable link shortening
    body.shortenLinks = true;

    const response = await fetch(`${AYRSHARE_BASE_URL}/post`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Ayrshare API error:", data);
        throw new Error(data.message || "Failed to post to social media");
    }

    return {
        status: "success",
        id: data.id,
        postIds: data.postIds?.map((p: { platform: Platform; id: string; postUrl?: string }) => ({
            platform: p.platform,
            id: p.id,
            url: p.postUrl,
        })),
    };
}

/**
 * Get post history from Ayrshare
 */
export async function getPostHistory(limit: number = 20): Promise<unknown[]> {
    const apiKey = process.env.AYRSHARE_API_KEY;

    if (!apiKey) {
        throw new Error("AYRSHARE_API_KEY is not configured");
    }

    const response = await fetch(
        `${AYRSHARE_BASE_URL}/history?limit=${limit}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch post history");
    }

    return response.json();
}

/**
 * Delete a scheduled or posted item
 */
export async function deletePost(id: string): Promise<void> {
    const apiKey = process.env.AYRSHARE_API_KEY;

    if (!apiKey) {
        throw new Error("AYRSHARE_API_KEY is not configured");
    }

    const response = await fetch(`${AYRSHARE_BASE_URL}/post`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ id }),
    });

    if (!response.ok) {
        throw new Error("Failed to delete post");
    }
}
