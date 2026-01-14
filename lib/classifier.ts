import type { GitHubEvent, AchievementType, ImpactData } from "@/types";
import { parseRepoName } from "./github";

interface RawAchievement {
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

// Scoring weights for different achievement types
const BASE_SCORES: Record<AchievementType, number> = {
    first_contribution: 50,
    pr_merged: 30,
    issue_resolved: 20,
    popular_repo: 40,
    maintainer: 35,
};

// Star thresholds for bonus scoring
const STAR_BONUSES = [
    { threshold: 10000, bonus: 30 },
    { threshold: 5000, bonus: 20 },
    { threshold: 1000, bonus: 15 },
    { threshold: 500, bonus: 10 },
    { threshold: 100, bonus: 5 },
];

/**
 * Calculate score based on achievement type and repo popularity
 */
function calculateScore(type: AchievementType, repoStars: number): number {
    let score = BASE_SCORES[type] || 10;

    // Add bonus for popular repos
    for (const { threshold, bonus } of STAR_BONUSES) {
        if (repoStars >= threshold) {
            score += bonus;
            break;
        }
    }

    return score;
}

/**
 * Classify GitHub events into achievements
 */
export function classifyEvents(
    events: GitHubEvent[],
    username: string,
    repoStarsMap: Map<string, number>,
    firstContribRepos: Set<string>
): RawAchievement[] {
    const achievements: RawAchievement[] = [];
    const seenPRs = new Set<string>(); // Deduplicate PR achievements

    for (const event of events) {
        const { owner, repo } = parseRepoName(event.repo.name);
        const repoStars = repoStarsMap.get(event.repo.name) || 0;
        const repoUrl = `https://github.com/${event.repo.name}`;
        const occurredAt = new Date(event.created_at);

        switch (event.type) {
            case "PullRequestEvent": {
                const pr = event.payload.pull_request;
                if (!pr) break;

                const prKey = `${event.repo.name}#${pr.number}`;

                // Check for merged PR
                if (event.payload.action === "closed" && pr.merged && !seenPRs.has(prKey)) {
                    seenPRs.add(prKey);

                    // Check if first contribution
                    const isFirst = firstContribRepos.has(event.repo.name);

                    if (isFirst) {
                        achievements.push({
                            type: "first_contribution",
                            title: `First contribution to ${repo}`,
                            description: pr.title,
                            repoName: repo,
                            repoOwner: owner,
                            repoUrl,
                            repoStars,
                            prNumber: pr.number,
                            issueNumber: null,
                            score: calculateScore("first_contribution", repoStars),
                            impactData: {
                                linesAdded: pr.additions,
                                linesRemoved: pr.deletions,
                                filesChanged: pr.changed_files,
                            },
                            occurredAt,
                        });
                    } else {
                        achievements.push({
                            type: "pr_merged",
                            title: pr.title,
                            description: pr.body?.slice(0, 200) || null,
                            repoName: repo,
                            repoOwner: owner,
                            repoUrl,
                            repoStars,
                            prNumber: pr.number,
                            issueNumber: null,
                            score: calculateScore("pr_merged", repoStars),
                            impactData: {
                                linesAdded: pr.additions,
                                linesRemoved: pr.deletions,
                                filesChanged: pr.changed_files,
                            },
                            occurredAt,
                        });
                    }

                    // Bonus achievement for popular repos
                    if (repoStars >= 1000) {
                        achievements.push({
                            type: "popular_repo",
                            title: `Contributed to popular repo ${repo}`,
                            description: `Merged PR in repository with ${repoStars.toLocaleString()} stars`,
                            repoName: repo,
                            repoOwner: owner,
                            repoUrl,
                            repoStars,
                            prNumber: pr.number,
                            issueNumber: null,
                            score: calculateScore("popular_repo", repoStars),
                            impactData: null,
                            occurredAt,
                        });
                    }
                }
                break;
            }

            case "IssuesEvent": {
                const issue = event.payload.issue;
                if (!issue) break;

                // Track resolved issues (closed by the creator)
                if (event.payload.action === "closed") {
                    achievements.push({
                        type: "issue_resolved",
                        title: `Resolved: ${issue.title}`,
                        description: issue.body?.slice(0, 200) || null,
                        repoName: repo,
                        repoOwner: owner,
                        repoUrl,
                        repoStars,
                        prNumber: null,
                        issueNumber: issue.number,
                        score: calculateScore("issue_resolved", repoStars),
                        impactData: null,
                        occurredAt,
                    });
                }
                break;
            }

            case "PullRequestReviewEvent": {
                // Track maintainer activity (reviewing PRs)
                if (event.payload.action === "submitted") {
                    achievements.push({
                        type: "maintainer",
                        title: `Reviewed PR in ${repo}`,
                        description: "Contributed as a reviewer/maintainer",
                        repoName: repo,
                        repoOwner: owner,
                        repoUrl,
                        repoStars,
                        prNumber: event.payload.pull_request?.number || null,
                        issueNumber: null,
                        score: calculateScore("maintainer", repoStars),
                        impactData: null,
                        occurredAt,
                    });
                }
                break;
            }
        }
    }

    // Deduplicate and sort by score
    const uniqueAchievements = deduplicateAchievements(achievements);
    return uniqueAchievements.sort((a, b) => b.score - a.score);
}

/**
 * Remove duplicate achievements (same type + repo + pr/issue number)
 */
function deduplicateAchievements(achievements: RawAchievement[]): RawAchievement[] {
    const seen = new Set<string>();
    return achievements.filter((a) => {
        const key = `${a.type}:${a.repoOwner}/${a.repoName}:${a.prNumber || a.issueNumber || ""}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

export type { RawAchievement };
