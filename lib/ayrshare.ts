/**
 * Ayrshare Provider SDK
 * Low-level wrapper around Ayrshare HTTP API
 */

import type { Platform, AyrsharePostResponse } from "@/types";

const AYRSHARE_API_URL = process.env.AYRSHARE_API_URL!;
const AYRSHARE_API_KEY = process.env.AYRSHARE_API_KEY;

if (!AYRSHARE_API_KEY) {
  throw new Error("AYRSHARE_API_KEY is not configured");
}

export interface AyrsharePostParams {
  content: string;
  platforms: Platform[];
  scheduleDate?: Date;
  mediaUrls?: string[];
}

async function ayrshareFetch<T>(
  path: string,
  options: RequestInit
): Promise<T> {
  const response = await fetch(`${AYRSHARE_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AYRSHARE_API_KEY}`,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ayrshare API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Create or schedule a post
 */
export async function createPost(
  params: AyrsharePostParams
): Promise<AyrsharePostResponse> {
  return ayrshareFetch<AyrsharePostResponse>("/post", {
    method: "POST",
    body: JSON.stringify({
      post: params.content,
      platforms: params.platforms,
      scheduleDate: params.scheduleDate?.toISOString(),
      mediaUrls: params.mediaUrls,
      shortenLinks: true,
    }),
  });
}

/**
 * Delete a post
 */
export async function deletePost(postId: string): Promise<void> {
  await ayrshareFetch(`/delete/${postId}`, {
    method: "DELETE",
  });
}

/**
 * Get connected social accounts
 */
export async function getUser() {
  return ayrshareFetch<{
    activeSocialAccounts: Platform[];
  }>("/user", {
    method: "GET",
  });
}
