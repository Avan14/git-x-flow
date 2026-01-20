// Social Media Service - Wrapper for Ayrshare
// This extends your existing lib/ayrshare.ts

import { createPost, deletePost, getUser } from "@/lib/ayrshare";
import { Platform } from "@/types";

const AYRSHARE_API_URL = process.env.AYRSHARE_API_URL!;
const AYRSHARE_API_KEY = process.env.AYRSHARE_API_KEY!;

export const PLATFORM_LIMITS: Record<string, number> = {
  twitter: 280,
  linkedin: 3000,
  instagram: 2200,
  facebook: 63206
};

export interface PostResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Validate content length per platform
 */
function validateContent(
  content: string,
  platforms: Platform[]
) {
  for (const platform of platforms) {
    const limit = PLATFORM_LIMITS[platform];
    if (content.length > limit) {
      throw new Error(
        `${platform} limit exceeded (${content.length}/${limit})`
      );
    }
  }
}

/**
 * Post to one or multiple platforms
 */
export async function postToSocial(
  content: string,
  platforms: Platform[],
  options?: {
    scheduleDate?: Date;
    mediaUrls?: string[];
  }
): Promise<PostResult> {
  try {
    validateContent(content, platforms);

    const data = await createPost({
      content,
      platforms,
      scheduleDate: options?.scheduleDate,
      mediaUrls: options?.mediaUrls,
    });

    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Post different content to different platforms
 */
export async function postMultiplePlatforms(
  posts: Partial<Record<Platform, string>>
): Promise<Record<Platform, PostResult>> {
  const results = {} as Record<Platform, PostResult>;

  for (const [platform, content] of Object.entries(posts) as [
    Platform,
    string
  ][]) {
    if (!content) continue;

    results[platform] = await postToSocial(content, [platform]);

    await new Promise((r) => setTimeout(r, 1000));
  }

  return results;
}

/**
 * Delete a post
 */
export async function removePost(postId: string) {
  return deletePost(postId);
}

/**
 * Get connected platforms
 */
export async function getConnectedAccounts(): Promise<Platform[]> {
  try {
    const user = await getUser();
    return user.activeSocialAccounts ?? [];
  } catch {
    return [];
  }
}