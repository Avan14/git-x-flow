import { prisma } from "./db";


export async function UserAchievements(id: string, userId: string) {
    const response = await prisma.achievement.findFirst({
        where: {
            id,
            userId: userId,
        },
        include: {
            content: true,
        },
    });

    if (response) {
        return response;
    } else {
        return null;
    }

}

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
  const res = await fetch("/api/social/post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content,
      platforms: [platform],
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to post");
  }

  return data;
}
