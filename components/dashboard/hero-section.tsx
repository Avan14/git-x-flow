"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, ArrowRight } from "lucide-react";

interface HeroSectionProps {
  achievementsCount: number;
  usageData: {
    postsGenerated: number;
    monthlyLimit: number;
    creditsRemaining: number;
  };
  userPlan: "free" | "pro";
}

export function HeroSection({
  achievementsCount,
  usageData,
  userPlan,
}: HeroSectionProps) {
  const hasAchievements = achievementsCount > 0;
  const isLimitReached = usageData.creditsRemaining === 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-background/60 p-8 text-center shadow-lg backdrop-blur-xl md:p-12">
      {/* Glow Effect */}
      <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-3xl space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-text">
              Experience Liftoff
            </span>
            <br />
            <span className="text-foreground">with your GitHub Data</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground md:text-xl leading-relaxed">
            Transform your code contributions into shareable success stories.
            <br className="hidden sm:inline" /> Stop showing raw stats. Start showing impact.
          </p>
        </div>

        {/* Action Area */}
        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
  {/* Generate Content - ALWAYS visible */}
  {!isLimitReached && (
    <Link href="/dashboard/ai-posts">
      <Button
        size="lg"
        className="group h-14 rounded-full px-8 text-lg font-medium shadow-blue-500/25 shadow-xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 border-2"
      >
        Generate Content
      </Button>
    </Link>
  )}

  {/* View Achievements - dynamic label */}
  <Link href="/dashboard/achievements">
    <Button
      variant="outline"
      size="lg"
      className="h-14 rounded-full px-8 text-lg border-2 hover:bg-muted/50 transition-all duration-300"
    >
      {achievementsCount > 0
        ? `View ${achievementsCount} Achievements`
        : "View Achievements"}
    </Button>
  </Link>
</div>



        {/* Usage Stats (Minimal) */}
        <div className="pt-10">
          <div className="mx-auto flex max-w-xs flex-col items-center gap-2">
            <div className="flex w-full justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <span>Usage</span>
              <span>{usageData.postsGenerated} / {usageData.monthlyLimit} Credits</span>
            </div>
            <Progress
              value={(usageData.postsGenerated / usageData.monthlyLimit) * 100}
              className="h-2 w-full overflow-hidden rounded-full bg-muted/50"
            />
            {isLimitReached && (
              <p className="text-xs text-red-500 font-medium animate-pulse">
                Monthly limit reached
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
