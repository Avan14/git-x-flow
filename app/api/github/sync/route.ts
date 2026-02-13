import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
    fetchUserEvents,
    fetchAllPages,
    fetchRepoDetails,
    isFirstContribution,
    parseRepoName,
} from "@/lib/github";
import { classifyEvents } from "@/lib/classifier";

export async function POST() {
    try {
        console.log('🔄 Starting GitHub sync...');
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.log(`👤 Syncing for user: ${session.user.id}`);
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
        console.log(`🐙 GitHub username: ${username}`);
        console.log('📥 Fetching ALL GitHub events (last 90 days)...');
        const events = await fetchUserEvents(account.access_token, username, 90);
        console.log(`✅ Found ${events.length} events`);

        if (events.length === 0) {
            return NextResponse.json({
                success: true,
                message: "No recent activity found",
                achieved: 0,
            });
        }
        const uniqueRepos = new Set(events.map((e) => e.repo.name));
        console.log(`📁 Found ${uniqueRepos.size} unique repositories`);
        const repoStarsMap = new Map<string, number>();
        const firstContribRepos = new Set<string>();

        console.log('🔍 Fetching repository details...');
        
        let processed = 0;
        await Promise.all( Array.from(uniqueRepos).map(async (repoFullName) => {
                try {
                    const { owner, repo } = parseRepoName(repoFullName);
                    const repoDetails = await fetchRepoDetails(
                        account.access_token!,
                        owner,
                        repo
                    );
                    repoStarsMap.set(repoFullName, repoDetails.stargazers_count);

                    const isFirst = await isFirstContribution(
                        account.access_token!,
                        owner,
                        repo,
                        username
                    );
                    if (isFirst) {
                        firstContribRepos.add(repoFullName);
                    }
                    
                    processed++;
                    if (processed % 10 === 0) {
                        console.log(`  Processed ${processed}/${uniqueRepos.size} repos...`);
                    }
                } catch (error) {
                    // Ignore errors for individual repos (rate limits, private repos, etc.)
                    console.error(`Failed to fetch repo ${repoFullName}:`, error);
                }
            })
        );

        console.log(`✅ Processed ${processed} repositories`);
        console.log(`🌟 First contributions: ${firstContribRepos.size}`);
        console.log('🏆 Classifying achievements...');
        
        const achievements = classifyEvents(
            events,
            username,
            repoStarsMap,
            firstContribRepos
        );

        console.log(`✅ Found ${achievements.length} achievements`);
        console.log('💾 Saving achievements to database...');
        
        let newCount = 0;
        let updatedCount = 0;
        
        for (const achievement of achievements) {
            try {
                const result = await prisma.achievement.upsert({
                    where: {
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
                
                // Check if it was newly created or updated
                if (result.createdAt === result.updatedAt) {
                    newCount++;
                } else {
                    updatedCount++;
                }
            } catch (error) {
                console.error("Failed to save achievement:", error);
            }
        }

        console.log(`✅ Saved: ${newCount} new, ${updatedCount} updated`);
        return NextResponse.json({
            success: true,
            message: "GitHub sync completed successfully",
            stats: {
                events: events.length,
                repositories: uniqueRepos.size,
                achievements: achievements.length,
                new: newCount,
                updated: updatedCount,
                firstContributions: firstContribRepos.size
            }
        });
        
    } catch (error) {
        console.error("❌ Sync error:", error);
        return NextResponse.json(
            { 
                error: "Failed to sync GitHub activity",
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const achievementCount = await prisma.achievement.count({
            where: { userId: session.user.id }
        });

        return NextResponse.json({
            message: "Use POST to trigger sync",
            currentAchievements: achievementCount,
            userId: session.user.id
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to get sync status" },
            { status: 500 }
        );
    }
}