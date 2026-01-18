/**
 * GitHub API Helpers
 * Functions for fetching and processing GitHub data
 */

import type { GitHubEvent, GitHubRepo } from "@/types";

/**
 * Fetch user events from GitHub API
 */
export async function fetchUserEvents(
    accessToken: string,
    username: string,
    days: number
): Promise<GitHubEvent[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const response = await fetch(
        `https://api.github.com/users/${username}/events?per_page=100`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github.v3+json",
            },
        }
    );

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
    }

    const events: GitHubEvent[] = await response.json();

    // Filter events within the time range
    return events.filter((event) => {
        const eventDate = new Date(event.created_at);
        return eventDate >= since;
    });
}

/**
 * Fetch repository details
 */
export async function fetchRepoDetails(
    accessToken: string,
    owner: string,
    repo: string
): Promise<GitHubRepo> {
    const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github.v3+json",
            },
        }
    );

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
    }

    return response.json();
}

/**
 * Check if this is user's first contribution to a repo
 */
export async function isFirstContribution(
    accessToken: string,
    owner: string,
    repo: string,
    username: string
): Promise<boolean> {
    try {
        // Check commits by user
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/commits?author=${username}&per_page=2`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/vnd.github.v3+json",
                },
            }
        );

        if (!response.ok) {
            return false;
        }

        const commits = await response.json();
        return commits.length === 1;
    } catch {
        return false;
    }
}

/**
 * Parse full repo name (owner/repo) into parts
 */
export function parseRepoName(fullName: string): { owner: string; repo: string } {
    const [owner, repo] = fullName.split("/");
    return { owner, repo };
}
