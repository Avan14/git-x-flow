import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HeroSection } from "@/components/dashboard/hero-section";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ActivityStream } from "@/components/dashboard/activity-stream";
import { StatsInsights } from "@/components/dashboard/stats-insights";
import {
  getAchievementsMetrics,
  getUsageMetrics,
  getRecentAchievements,
  getPostsMetrics,
  getMonthlyGitHubStats,
  getTopRepositories,
  getUserSubscription,
  getPortfolioStats,
} from "@/lib/dashboard-data";
import { ParticleBackground } from "@/components/ui/particle-background";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  const userId = session.user.id as string;
  const accessToken = session.user.accessToken as string;

  if (!accessToken) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>GitHub Not Connected</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please connect your GitHub account first.</p>
            <Link href="/api/auth/signin">
              <Button className="mt-4">Sign In with GitHub</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  try {
    // Fetch all dashboard data in parallel
    const [
      achievementsMetrics,
      usageMetrics,
      recentAchievements,
      postsMetrics,
      monthlyStats,
      topRepos,
      subscription,
      portfolioStats,
    ] = await Promise.all([
      getAchievementsMetrics(userId),
      getUsageMetrics(userId),
      getRecentAchievements(userId, 10),
      getPostsMetrics(userId),
      getMonthlyGitHubStats(userId),
      getTopRepositories(userId, 5),
      getUserSubscription(userId),
      getPortfolioStats(userId),
    ]);

    return (
      <div className="relative min-h-screen space-y-8 animate-fade-in pb-12">
        <ParticleBackground />
        
        <HeroSection
          achievementsCount={achievementsMetrics.shareable}
          usageData={usageMetrics}
          userPlan={(subscription?.plan as "free" | "pro") || "free"}
        />

        <QuickActions
          achievements={{
            total: achievementsMetrics.total,
            thisWeek: achievementsMetrics.thisWeek,
          }}
          posts={{
            generated: postsMetrics.generated,
            published: postsMetrics.published,
          }}
        />

        <ActivityStream achievements={recentAchievements} userId={userId} />

        <StatsInsights
          monthlyStats={monthlyStats}
          topRepos={topRepos}
          portfolioStats={portfolioStats}
        />
      </div>
    );
  } catch (error: any) {
    console.error("Dashboard error:", error);
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500 mb-4">{error.message}</p>
            <Link href="/api/auth/signout">
              <Button>Sign Out</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
}
