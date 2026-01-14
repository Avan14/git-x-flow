import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

// Use the fast model for content generation
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export type ContentFormat = "resume_bullet" | "linkedin_post" | "twitter_thread";

interface AchievementContext {
    type: string;
    title: string;
    description: string | null;
    repoName: string;
    repoOwner: string;
    repoStars: number;
    prNumber: number | null;
    impactData: {
        linesAdded?: number;
        linesRemoved?: number;
        filesChanged?: number;
    } | null;
}

/**
 * Generate content for an achievement using Gemini AI
 */
export async function generateContent(
    achievement: AchievementContext,
    format: ContentFormat
): Promise<string> {
    const prompt = buildPrompt(achievement, format);

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up the response
        return cleanContent(text, format);
    } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("Failed to generate content");
    }
}

/**
 * Build the prompt based on achievement and format
 */
function buildPrompt(achievement: AchievementContext, format: ContentFormat): string {
    const baseContext = `
Achievement Type: ${achievement.type.replace("_", " ")}
Repository: ${achievement.repoOwner}/${achievement.repoName}
Repository Stars: ${achievement.repoStars.toLocaleString()}
Title: ${achievement.title}
${achievement.description ? `Description: ${achievement.description}` : ""}
${achievement.prNumber ? `PR Number: #${achievement.prNumber}` : ""}
${achievement.impactData ? `
Impact:
- Lines added: ${achievement.impactData.linesAdded || 0}
- Lines removed: ${achievement.impactData.linesRemoved || 0}
- Files changed: ${achievement.impactData.filesChanged || 0}
` : ""}
`.trim();

    switch (format) {
        case "resume_bullet":
            return `
You are an expert resume writer for software developers. Generate a single, compelling resume bullet point for the following open source contribution.

${baseContext}

Requirements:
- Start with a strong action verb (Implemented, Developed, Fixed, Optimized, etc.)
- Include quantifiable impact where possible (e.g., "reducing load time by 40%")
- Be concise (1-2 lines max)
- Professional tone
- Don't include the repository name in a generic way - make it specific
- If it's a popular repo (1000+ stars), mention its scale

Output ONLY the bullet point, starting with "• "
`;

        case "linkedin_post":
            return `
You are a social media expert for developers. Generate an engaging LinkedIn post about this open source contribution.

${baseContext}

Requirements:
- Professional but warm tone
- 150-200 words
- Include 2-3 relevant hashtags at the end
- Use an emoji at the start
- Share the learning or impact
- Don't be cringey or overly promotional
- Make it genuine and authentic
- Include a call-to-action or question at the end to drive engagement

Output ONLY the LinkedIn post content.
`;

        case "twitter_thread":
            return `
You are a tech Twitter content creator. Generate a Twitter/X thread about this open source contribution.

${baseContext}

Requirements:
- Casual, developer-friendly tone
- 3-4 tweets (separated by "---")
- Each tweet under 280 characters
- Use emojis sparingly but effectively
- Tell a story: problem → solution → impact
- Include relevant mentions if it's a well-known repo
- End with a lesson learned or call to action
- Don't use hashtags excessively (max 1-2 in the last tweet)

Output the thread with each tweet separated by "---"
`;

        default:
            throw new Error(`Unknown format: ${format}`);
    }
}

/**
 * Clean and format the generated content
 */
function cleanContent(content: string, format: ContentFormat): string {
    let cleaned = content.trim();

    switch (format) {
        case "resume_bullet":
            // Ensure it starts with a bullet
            if (!cleaned.startsWith("•")) {
                cleaned = "• " + cleaned;
            }
            break;

        case "twitter_thread":
            // Clean up tweet separators
            cleaned = cleaned
                .split("---")
                .map((tweet) => tweet.trim())
                .filter((tweet) => tweet.length > 0)
                .join("\n\n---\n\n");
            break;
    }

    return cleaned;
}

/**
 * Count words in content
 */
export function countWords(content: string): number {
    return content
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
}
