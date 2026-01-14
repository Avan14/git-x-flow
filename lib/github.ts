import type { GitHubEvent, GitHubRepo, GitHubPullRequest } from "@/types";

const GITHUB_API_BASE = "https://api.github.com";

/**
 * Fetch user's recent public events from GitHub
 */
export async function fetchUserEvents(
    accessToken: string,
    username: string,
    days: number = 90
): Promise<GitHubEvent[]> {
    const allEvents: GitHubEvent[] = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // GitHub API returns max 300 events across 10 pages
    for (let page = 1; page <= 10; page++) {
        const response = await fetch(
            `${GITHUB_API_BASE}/users/${username}/events?per_page=100&page=${page}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/vnd.github.v3+json",
                    "User-Agent": "gitXflow-App",
                },
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("User not found");
            }
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const events: GitHubEvent[] = await response.json();

        if (events.length === 0) break;

        // Filter events within the time window
        for (const event of events) {
            const eventDate = new Date(event.created_at);
            if (eventDate >= cutoffDate) {
                allEvents.push(event);
            } else {
                // Events are sorted by date, so we can stop early
                return allEvents;
            }
        }
    }

    return allEvents;
}

/**
 * Fetch repository details including star count
 */
export async function fetchRepoDetails(
    accessToken: string,
    owner: string,
    repo: string
): Promise<GitHubRepo> {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "gitXflow-App",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch repo: ${response.status}`);
    }

    return response.json();
}

/**
 * Fetch pull request details
 */
export async function fetchPullRequest(
    accessToken: string,
    owner: string,
    repo: string,
    prNumber: number
): Promise<GitHubPullRequest> {
    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${prNumber}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "gitXflow-App",
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch PR: ${response.status}`);
    }

    return response.json();
}

/**
 * Check if this is the user's first contribution to a repo
 */
export async function isFirstContribution(
    accessToken: string,
    owner: string,
    repo: string,
    username: string
): Promise<boolean> {
    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?author=${username}&per_page=2`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "gitXflow-App",
            },
        }
    );

    if (!response.ok) {
        return false;
    }

    const commits = await response.json();
    // If only 1 or 2 commits, likely first contribution
    return commits.length <= 2;
}

/**
 * Parse repo name from full name (owner/repo format)
 */
export function parseRepoName(fullName: string): { owner: string; repo: string } {
    const [owner, repo] = fullName.split("/");
    return { owner, repo };
}
