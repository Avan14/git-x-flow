import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import {
    fetchUserEvents,
    fetchRepoDetails,
    isFirstContribution,
    parseRepoName,
} from "@/lib/github";
import { classifyEvents } from "@/lib/classifier";

export async function POST() {
    try {
        // ============================================================
        // STEP 1: Authentication & Authorization
        // TODO: Verify user is logged in with valid session
        // ============================================================
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // ============================================================
        // STEP 2: Get GitHub Access Token
        // TODO: Fetch GitHub OAuth token from accounts table
        // This token is needed to call GitHub API on user's behalf
        // ============================================================
        const account = await prisma.account.findFirst({
            where: {
                userId: session.user.id,
                provider: "github",
            },
        });

        if (!account?.access_token) {
            return NextResponse.json(
                { error: "GitHub account not connected" },
                { status: 400 }
            );
        }

        // ============================================================
        // STEP 3: Validate GitHub Username
        // TODO: Ensure user has a GitHub username in session
        // ============================================================
        const username = session.user.username;
        if (!username) {
            return NextResponse.json(
                { error: "GitHub username not found" },
                { status: 400 }
            );
        }

        // ============================================================
        // STEP 4: Fetch User's GitHub Events (Last 90 Days)
        // TODO: Call GitHub API to get all user activity
        // Returns: PullRequestEvent, IssuesEvent, etc.
        // ============================================================
        const events = await fetchUserEvents(account.access_token, username, 90);

        if (events.length === 0) {
            return NextResponse.json({
                success: true,
                message: "No recent activity found",
                achieved: 0,
            });
        }

        // ============================================================
        // STEP 5: Extract Unique Repositories
        // TODO: Get all unique repo names from events
        // Needed to fetch repo metadata (stars, etc.)
        // ============================================================
        const uniqueRepos = new Set(events.map((e) => e.repo.name));

        // Initialize data structures for scoring
        const repoStarsMap = new Map<string, number>();
        const firstContribRepos = new Set<string>();

        // ============================================================
        // STEP 6: Fetch Repo Details & Check First Contributions
        // TODO: For each unique repo:
        //   - Fetch star count (for achievement scoring)
        //   - Check if user's first contribution to that repo
        // ============================================================
        await Promise.all(
            Array.from(uniqueRepos).map(async (repoFullName) => {
                try {
                    const { owner, repo } = parseRepoName(repoFullName);
                    
                    // Fetch repo metadata (stars, forks, etc.)
                    const repoDetails = await fetchRepoDetails(
                        account.access_token!,
                        owner,
                        repo
                    );
                    repoStarsMap.set(repoFullName, repoDetails.stargazers_count);

                    // Check if this is user's first contribution to repo
                    const isFirst = await isFirstContribution(
                        account.access_token!,
                        owner,
                        repo,
                        username
                    );
                    if (isFirst) {
                        firstContribRepos.add(repoFullName);
                    }
                } catch (error) {
                    // Ignore errors for individual repos (rate limits, private repos, etc.)
                    console.error(`Failed to fetch repo ${repoFullName}:`, error);
                }
            })
        );

        // ============================================================
        // STEP 7: Classify Events into Achievements
        // TODO: Run classifier to detect meaningful achievements
        // Classifier looks for:
        //   - First contributions (special badge)
        //   - Merged PRs (especially in popular repos)
        //   - Code reviews (mentorship)
        //   - Issue resolutions
        // Scoring based on:
        //   - Repo popularity (stars)
        //   - PR size (lines changed)
        //   - First contribution bonus
        // ============================================================
        const achievements = classifyEvents(
            events,
            username,
            repoStarsMap,
            firstContribRepos
        );

        // ============================================================
        // STEP 8: Save Achievements to Database
        // TODO: Upsert each achievement to avoid duplicates
        // Uses composite unique key: userId + type + repoName + prNumber
        // On conflict: Update score and impact data
        // ============================================================
        let newCount = 0;
        for (const achievement of achievements) {
            try {
                await prisma.achievement.upsert({
                    where: {
                        // Composite unique constraint to prevent duplicates
                        userId_type_repoName_prNumber: {
                            userId: session.user.id,
                            type: achievement.type,
                            repoName: achievement.repoName,
                            prNumber: achievement.prNumber,
                        },
                    },
                    update: {
                        // Update dynamic fields that might change
                        score: achievement.score,
                        repoStars: achievement.repoStars,
                        impactData: achievement.impactData as object | undefined,
                    },
                    create: {
                        // Create new achievement record
                        userId: session.user.id,
                        type: achievement.type,
                        title: achievement.title,
                        description: achievement.description,
                        repoName: achievement.repoName,
                        repoOwner: achievement.repoOwner,
                        repoUrl: achievement.repoUrl,
                        repoStars: achievement.repoStars,
                        prNumber: achievement.prNumber,
                        issueNumber: achievement.issueNumber,
                        score: achievement.score,
                        impactData: achievement.impactData as object | undefined,
                        occurredAt: achievement.occurredAt,
                    },
                });
                newCount++;
            } catch (error) {
                // Skip duplicates or constraint violations
                console.error("Failed to save achievement:", error);
            }
        }

        // ============================================================
        // STEP 9: Redirect Back to Dashboard
        // TODO: After sync completes, redirect user to see results
        // ============================================================
        return NextResponse.redirect(new URL("/dashboard", process.env.NEXTAUTH_URL || "http://localhost:3000"));
    } catch (error) {
        console.error("Sync error:", error);
        return NextResponse.json(
            { error: "Failed to sync GitHub activity" },
            { status: 500 }
        );
    }
}

// ============================================================
// GET Handler: Redirect to Dashboard
// TODO: Handle accidental GET requests (form submissions)
// ============================================================
export async function GET() {
    return NextResponse.redirect(new URL("/dashboard", process.env.NEXTAUTH_URL || "http://localhost:3000"));
}
