"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Trophy, FileText, TrendingUp, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface QuickActionsProps {
  achievements: { total: number; thisWeek: number };
  posts: { generated: number; published: number };
}

export function QuickActions({ achievements, posts }: QuickActionsProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [timeframe, setTimeframe] = useState(7);
  const router = useRouter();

  const handleAnalyze = async () => {
    setAnalyzing(true);
    // Navigate to AI posts page with timeframe
    router.push(`/dashboard/ai-posts?days=${timeframe}`);
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Analyze with AI Card */}
      <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 bg-background/40 backdrop-blur-xl border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <CardHeader className="relative">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg">🤖 Analyze with AI</CardTitle>
          <p className="text-sm text-muted-foreground">
            Find new wins from your code
          </p>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">
              Timeframe
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(parseInt(e.target.value))}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={analyzing}
            >
              <option value={3}>Last 3 days</option>
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
            </select>
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full gap-2 border-2"
            variant="outline"
          >
            {analyzing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze Now
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Achievements Card */}
      <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 bg-background/40 backdrop-blur-xl border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <CardHeader className="relative">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
            <Trophy className="h-6 w-6 text-amber-500" />
          </div>
          <CardTitle className="text-lg">🏆 Achievements</CardTitle>
          <p className="text-sm text-muted-foreground">
            Track your developer wins
          </p>
        </CardHeader>
        <CardContent className="relative space-y-3">
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{achievements.total}</span>
              <span className="text-sm text-muted-foreground">total</span>
            </div>
            {achievements.thisWeek > 0 && (
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                {achievements.thisWeek} this week
              </Badge>
            )}
          </div>
          <Link href="/dashboard/achievements" className="block">
            <Button variant="outline" className="w-full gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* My Posts Card */}
      <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 bg-background/40 backdrop-blur-xl border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <CardHeader className="relative">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
            <FileText className="h-6 w-6 text-blue-500" />
          </div>
          <CardTitle className="text-lg">📝 My Posts</CardTitle>
          <p className="text-sm text-muted-foreground">
            Generated content library
          </p>
        </CardHeader>
        <CardContent className="relative space-y-3">
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{posts.generated}</span>
              <span className="text-sm text-muted-foreground">generated</span>
            </div>
            {posts.published > 0 && (
              <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-700 dark:text-green-400">
                ✓ {posts.published} published
              </Badge>
            )}
          </div>
          <Link href="/dashboard/posts" className="block">
            <Button variant="outline" className="w-full gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}