/**
 * Ayrshare API Integration
 * For posting to social media platforms
 */

import type { Platform, AyrsharePostResponse } from "@/types";

const AYRSHARE_API_KEY = process.env.AYRSHARE_API_KEY;
const AYRSHARE_API_URL = "https://app.ayrshare.com/api";

interface PostToSocialParams {
    content: string;
    platforms: Platform[];
    scheduleDate?: Date;
    mediaUrls?: string[];
}

/**
 * Post content to social media platforms via Ayrshare
 */
export async function postToSocial(
    params: PostToSocialParams
): Promise<AyrsharePostResponse> {
    if (!AYRSHARE_API_KEY) {
        throw new Error("AYRSHARE_API_KEY is not configured");
    }

    const response = await fetch(`${AYRSHARE_API_URL}/post`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AYRSHARE_API_KEY}`,
        },
        body: JSON.stringify({
            post: params.content,
            platforms: params.platforms,
            scheduleDate: params.scheduleDate?.toISOString(),
            mediaUrls: params.mediaUrls,
            shortenLinks: true,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ayrshare API error: ${error}`);
    }

    return response.json();
}

/**
 * Schedule a post for later
 */
export async function schedulePost(
    params: PostToSocialParams & { scheduleDate: Date }
): Promise<AyrsharePostResponse> {
    return postToSocial(params);
}

/**
 * Delete a previously posted/scheduled post
 */
export async function deletePost(postId: string): Promise<void> {
    if (!AYRSHARE_API_KEY) {
        throw new Error("AYRSHARE_API_KEY is not configured");
    }

    const response = await fetch(`${AYRSHARE_API_URL}/delete/${postId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${AYRSHARE_API_KEY}`,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ayrshare delete error: ${error}`);
    }
}
