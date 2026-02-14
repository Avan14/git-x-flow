export interface AnalyzeActivityParams {
  days: number;
  platforms: string[];
}

export interface AnalyzeActivityResult {
  githubData: any;
  posts: any[];
}

export async function analyzeActivityClient(
  params: AnalyzeActivityParams
): Promise<AnalyzeActivityResult> {
  const query = new URLSearchParams({
    days: String(params.days),
    platforms: params.platforms.join(","),
  });

  const res = await fetch(`/api/ai/analyze?${query.toString()}`);

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error || "Analysis failed");
  }

  return {
    githubData: data.githubData,
    posts: data.posts || [],
  };
}
export async function publishPostClient(
  platform: string,
  content: string
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

  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to publish post");
  }

  return data;
}
