// Client-safe functions - no Prisma imports

type Format = "resume_bullet" | "linkedin_post" | "twitter_thread";

/**
 * Generate achievement content for a specific format
 */
export async function generateAchievementContent(
  achievementId: string,
  format: Format
): Promise<string> {
  const res = await fetch("/api/content/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ achievementId, format }),
  });

  if (!res.ok) {
    throw new Error("Failed to generate content");
  }

  const data = await res.json();
  return data.content.content;
}

export async function postToSocialClient(
  content: string,
  platform: "twitter" | "linkedin"
) {
  const res = await fetch("/api/content/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content,
          format: platform,
          platform: platform,
          // posted with 1 min delay
          scheduledAt: (new Date(Date.now() + 60 * 1000)).toISOString(),
        }),
      });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to post");
  }

  return data;
}
