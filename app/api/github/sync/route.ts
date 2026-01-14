import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user's GitHub access token
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

        const username = session.user.username;
        if (!username) {
            return NextResponse.json(
                { error: "GitHub username not found" },
                { status: 400 }
            );
        }

        // Fetch user's recent events (last 90 days)
        const events = await fetchUserEvents(account.access_token, username, 90);

        if (events.length === 0) {
            return NextResponse.json({
                success: true,
                message: "No recent activity found",
                achieved: 0,
            });
        }

        // Get unique repos from events
        const uniqueRepos = new Set(events.map((e) => e.repo.name));

        // Fetch repo details (stars) for scoring
        const repoStarsMap = new Map<string, number>();
        const firstContribRepos = new Set<string>();

        await Promise.all(
            Array.from(uniqueRepos).map(async (repoFullName) => {
                try {
                    const { owner, repo } = parseRepoName(repoFullName);
                    const repoDetails = await fetchRepoDetails(
                        account.access_token!,
                        owner,
                        repo
                    );
                    repoStarsMap.set(repoFullName, repoDetails.stargazers_count);

                    // Check if first contribution
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
                    // Ignore errors for individual repos
                    console.error(`Failed to fetch repo ${repoFullName}:`, error);
                }
            })
        );

        // Classify events into achievements
        const achievements = classifyEvents(
            events,
            username,
            repoStarsMap,
            firstContribRepos
        );

        // Store achievements in database (upsert to avoid duplicates)
        let newCount = 0;
        for (const achievement of achievements) {
            try {
                await prisma.achievement.upsert({
                    where: {
                        userId_type_repoName_prNumber: {
                            userId: session.user.id,
                            type: achievement.type,
                            repoName: achievement.repoName,
                            prNumber: achievement.prNumber,
                        },
                    },
                    update: {
                        score: achievement.score,
                        repoStars: achievement.repoStars,
                        impactData: achievement.impactData as object | undefined,
                    },
                    create: {
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

        // Redirect back to dashboard
        return NextResponse.redirect(new URL("/dashboard", process.env.NEXTAUTH_URL || "http://localhost:3000"));
    } catch (error) {
        console.error("Sync error:", error);
        return NextResponse.json(
            { error: "Failed to sync GitHub activity" },
            { status: 500 }
        );
    }
}

export async function GET() {
    // Redirect GET to POST for form submissions
    return NextResponse.redirect(new URL("/dashboard", process.env.NEXTAUTH_URL || "http://localhost:3000"));
}
