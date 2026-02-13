import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { UserAchievements } from "@/lib/user-achievements.server";
import { AchievementContentClient } from "../client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { ParticleBackground } from "@/components/ui/particle-background";

export default async function ContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }
  const { id } = await params; 

  const achievement = await UserAchievements(
    id,
    session.user.id
  );

  if (!achievement) {
    notFound();
  }

  const existingContent: Record<string, string> = {};
  for (const c of achievement.content) {
    existingContent[c.format] = c.content;
  }

  return (
    <div className="min-h-screen">
      <ParticleBackground />
      
      <div className="max-w-4xl mx-auto space-y-6 px-4 py-8">
        {/* Back button */}
        <Link href={`/dashboard/achievement/${id}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Achievement
          </Button>
        </Link>

        {/* Header Card */}
        <Card className="bg-background/40 backdrop-blur-xl border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Manage Content</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {achievement.title}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Content Client */}
        <AchievementContentClient
          achievementId={achievement.id}
          achievementTitle={achievement.title}
          existingContent={existingContent}
        />
      </div>
    </div>
  );
}