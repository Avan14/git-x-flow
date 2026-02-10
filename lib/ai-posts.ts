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
  const res = await fetch("/api/social/post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content,
      platforms: [platform],
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to publish post");
  }

  return data;
}
