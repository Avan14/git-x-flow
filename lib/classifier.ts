/**
 * Achievement Classification System
 * Analyzes GitHub events and generates achievements with scores
 */

import type { GitHubEvent, AchievementType, ImpactData } from "@/types";

export interface ClassifiedAchievement {
    type: AchievementType;
    title: string;
    description: string | null;
    repoName: string;
    repoOwner: string;
    repoUrl: string;
    repoStars: number;
    prNumber: number | null;
    issueNumber: number | null;
    score: number;
    impactData: ImpactData | null;
    occurredAt: Date;
}

/**
 * Classify GitHub events into achievements
 */
export function classifyEvents(
    events: GitHubEvent[],
    username: string,
    repoStarsMap: Map<string, number>,
    firstContribRepos: Set<string>
): ClassifiedAchievement[] {
    const achievements: ClassifiedAchievement[] = [];

    for (const event of events) {
        const repoStars = repoStarsMap.get(event.repo.name) || 0;
        const isFirstContrib = firstContribRepos.has(event.repo.name);
        const [repoOwner, repoName] = event.repo.name.split("/");

        // Handle Pull Request events
        if (event.type === "PullRequestEvent" && event.payload.pull_request) {
            const pr = event.payload.pull_request;

            // Only count merged PRs
            if (pr.merged && pr.user.login === username) {
                // Calculate score based on repo popularity and PR size
                let score = 10; // Base score
                score += Math.min(repoStars / 100, 50); // Up to 50 points for popularity
                score += Math.min((pr.additions + pr.deletions) / 10, 30); // Up to 30 for size

                if (isFirstContrib) {
                    score += 25; // Bonus for first contribution
                }

                achievements.push({
                    type: isFirstContrib ? "first_contribution" : "pr_merged",
                    title: isFirstContrib
                        ? `First contribution to ${repoName}`
                        : `Merged PR in ${repoName}`,
                    description: pr.title,
                    repoName: event.repo.name,
                    repoOwner,
                    repoUrl: `https://github.com/${event.repo.name}`,
                    repoStars,
                    prNumber: pr.number,
                    issueNumber: null,
                    score: Math.round(score),
                    impactData: {
                        linesAdded: pr.additions,
                        linesRemoved: pr.deletions,
                        filesChanged: pr.changed_files,
                    },
                    occurredAt: new Date(pr.merged_at || event.created_at),
                });
            }
        }

        // Handle Issue events
        if (event.type === "IssuesEvent" && event.payload.issue) {
            const issue = event.payload.issue;

            if (event.payload.action === "closed" && issue.user.login === username) {
                achievements.push({
                    type: "issue_resolved",
                    title: `Resolved issue in ${repoName}`,
                    description: issue.title,
                    repoName: event.repo.name,
                    repoOwner,
                    repoUrl: `https://github.com/${event.repo.name}`,
                    repoStars,
                    prNumber: null,
                    issueNumber: issue.number,
                    score: Math.round(10 + Math.min(repoStars / 100, 20)),
                    impactData: null,
                    occurredAt: new Date(event.created_at),
                });
            }
        }
    }

    return achievements;
}
