
import { prisma } from "@/lib/db";
import { Sparkles, GitPullRequest, Trophy, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AchievementCard } from "@/components/achievement-card";
import { EmptyState } from "@/components/empty-state";
import { use } from "react";

export default async function DashboardPage() {
  const session = {
    user: { id: "user-id-123", name: "Demo User", username: "demouser",image: null },
  }

  

  // Fetch user's achievements
  const achievements = [{
    id: "achv1",
    type: "pr_merged",
    score: 50,
    content: "Merged a pull request on repository XYZ",
  },
  {
    id: "achv2",
    type: "issue_opened",
    score: 20,
    content: "Opened an issue on repository ABC",
  }];

  // Calculate stats
  const totalScore = achievements.reduce((sum: number, a: any) => sum + a.score, 0);
  const totalAchievements = achievements.length;
  const prsMerged = achievements.filter((a: any) => a.type === "pr_merged").length;

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              Total Score
            </CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalScore}</div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Impact points earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              Achievements
            </CardTitle>
            <Sparkles className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalAchievements}</div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Detected contributions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              PRs Merged
            </CardTitle>
            <GitPullRequest className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{prsMerged}</div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Successfully merged
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Your Achievements</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Click on an achievement to generate content
            </p>
          </div>
          <form action="/api/github/sync" method="POST">
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Now
            </Button>
          </form>
        </div>

        {achievements.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No achievements yet"
            description="Click 'Sync GitHub' to analyze your recent activity and discover your achievements."
            action={
              <form action="/api/github/sync" method="POST">
                <Button>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync GitHub Activity
                </Button>
              </form>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {achievements.map((achievement: any) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                hasContent={achievement.content.length > 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
