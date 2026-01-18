/**
 * Google Gemini AI Integration
 * For generating content from achievements
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ContentFormat } from "@/types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
    }
    if (!genAI) {
        genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
    return genAI;
}

interface GenerateContentParams {
    achievementTitle: string;
    achievementDescription: string | null;
    repoName: string;
    repoStars: number;
    format: ContentFormat;
}

const FORMAT_PROMPTS: Record<ContentFormat, string> = {
    resume_bullet: `Create a concise, impactful resume bullet point for this achievement. 
    Use action verbs, include metrics where possible, and keep it under 2 lines.
    Format: Start with a strong action verb, describe the action, and highlight the impact.`,

    linkedin_post: `Write an engaging LinkedIn post about this achievement.
    Keep it professional but personable, around 150-200 words.
    Include relevant hashtags at the end.
    Make it shareable and inspiring to other developers.`,

    twitter_thread: `Create a Twitter thread (3-5 tweets) about this achievement.
    Each tweet should be under 280 characters.
    Start with a hook, tell the story, and end with a takeaway.
    Use emojis sparingly but effectively.
    Format each tweet on a new line, numbered 1/, 2/, etc.`,
};

/**
 * Generate content for an achievement using Gemini AI
 */
export async function generateContent(
    params: GenerateContentParams
): Promise<string> {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a developer advocate helping developers showcase their open source contributions.

Achievement: ${params.achievementTitle}
${params.achievementDescription ? `Details: ${params.achievementDescription}` : ""}
Repository: ${params.repoName}
${params.repoStars > 0 ? `Repository Stars: ${params.repoStars}` : ""}

${FORMAT_PROMPTS[params.format]}

Generate the content now:`;

    const result = await model.generateContent(prompt);
    const response = result.response;

    return response.text();
}

/**
 * Generate multiple formats at once
 */
export async function generateAllFormats(
    params: Omit<GenerateContentParams, "format">
): Promise<Record<ContentFormat, string>> {
    const formats: ContentFormat[] = ["resume_bullet", "linkedin_post", "twitter_thread"];

    const results = await Promise.all(
        formats.map(async (format) => ({
            format,
            content: await generateContent({ ...params, format }),
        }))
    );

    return results.reduce(
        (acc, { format, content }) => ({ ...acc, [format]: content }),
        {} as Record<ContentFormat, string>
    );
}
