"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { analyzeActivityClient } from "@/lib/ai-posts";
import { ScheduleModal } from "@/components/posts/schedule-modal";
import { Save, Calendar, Send, CheckCircle, Loader2 } from "lucide-react";

interface Activity {
  type: string;
  title: string;
  score: number;
  reasoning: string;
  platforms: string[];
  highlights: string[];
}

interface PostSet {
  activity: Activity;
  posts: Record<string, string>;
}

export default function AIPostsPage() {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [days, setDays] = useState(7);
  const [githubData, setGithubData] = useState<any>(null);
  const [postSets, setPostSets] = useState<PostSet[]>([]);
  
  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  
  // Schedule modal state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleContent, setScheduleContent] = useState("");
  const [scheduleKey, setScheduleKey] = useState("");

  const analyzeActivity = async () => {
    setLoading(true);
    setAnalyzing(true);
    setSavedPosts(new Set()); // Reset saved state for new analysis

    try {
      const result = await analyzeActivityClient({
        days,
        platforms: ["twitter"],
      });

      setGithubData(result.githubData);
      setPostSets(result.posts);
    } catch (error: any) {
      alert(`Analysis failed: ${error.message}`);
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  const handleSave = async (platform: string, content: string, key: string) => {
    setActionLoading(key);
    try {
      const res = await fetch("/api/content/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          format: platform,
          platform,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSavedPosts(prev => new Set([...prev, key]));
      alert("✅ Post saved! View it in the Posts tab.");
    } catch (error: any) {
      alert(`❌ Save failed: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenSchedule = (platform: string, content: string, key: string) => {
    setScheduleContent(content);
    setScheduleKey(key);
    setScheduleModalOpen(true);
  };

  const handleSchedule = async (data: {
    content: string;
    platform: string;
    scheduledAt: Date;
  }) => {
    setActionLoading(scheduleKey);
    try {
      const res = await fetch("/api/content/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: data.content,
          format: data.platform,
          platform: data.platform,
          scheduledAt: data.scheduledAt.toISOString(),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setSavedPosts(prev => new Set([...prev, scheduleKey]));
      setScheduleModalOpen(false);
      alert(`📅 Post scheduled for ${data.scheduledAt.toLocaleString()}`);
    } catch (error: any) {
      alert(`❌ Schedule failed: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePostNow = async (platform: string, content: string, key: string) => {
    if (!confirm(`Post to ${platform} now?`)) return;

    setActionLoading(key);
    try {
      const res = await fetch("/api/social/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          platforms: [platform],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setSavedPosts(prev => new Set([...prev, key]));
      alert(`✅ Posted to ${platform} successfully!`);
    } catch (error: any) {
      alert(`❌ Post failed: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const copyPost = (content: string) => {
    navigator.clipboard.writeText(content);
    alert("📋 Copied to clipboard!");
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      twitter: "🐦",
      linkedin: "💼",
    };
    return icons[platform] || "📱";
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🤖 AI Post Generator</h1>
        <p className="text-muted-foreground">
          Generate content from your GitHub activity. Save, schedule, or post immediately.
        </p>
      </div>

      {/* Controls */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">📊 Analyze Your Activity</h2>

        <div className="flex flex-wrap gap-4 items-center mb-4">
          {/* Timeframe selector */}
          <div>
            <label className="text-sm font-medium mr-2">Timeframe:</label>
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="border rounded px-3 py-2 bg-background"
            >
              <option value={3}>Last 3 days</option>
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
            </select>
          </div>

          {/* Analyze button */}
          <Button
            onClick={analyzeActivity}
            disabled={loading}
            className="ml-auto"
          >
            {loading ? "⏳ Analyzing..." : "🤖 Analyze with AI"}
          </Button>
        </div>

        {analyzing && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
            <p className="text-muted-foreground">
              AI is analyzing your GitHub activity...
            </p>
          </div>
        )}
      </Card>

      {/* GitHub Stats */}
      {githubData && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            📈 GitHub Activity Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {githubData.stats.totalCommits}
              </div>
              <div className="text-sm text-muted-foreground">Commits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {githubData.stats.totalPRs}
              </div>
              <div className="text-sm text-muted-foreground">Pull Requests</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {githubData.stats.mergedPRs}
              </div>
              <div className="text-sm text-muted-foreground">Merged PRs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {githubData.stats.newRepos}
              </div>
              <div className="text-sm text-muted-foreground">New Repos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">
                +{githubData.stats.totalAdditions}
              </div>
              <div className="text-sm text-muted-foreground">Lines Added</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                -{githubData.stats.totalDeletions}
              </div>
              <div className="text-sm text-muted-foreground">Lines Removed</div>
            </div>
          </div>
        </Card>
      )}

      {/* Generated Posts */}
      {postSets.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">✨ AI-Generated Posts</h2>
          <p className="text-muted-foreground">
            Choose an action for each post: Save for later, Schedule for a specific time, or Post Now.
          </p>

          {postSets.map((postSet, index) => (
            <Card key={index} className="p-6">
              {/* Activity Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div>
                  <h3 className="text-xl font-semibold">
                    {postSet.activity.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {postSet.activity.reasoning}
                  </p>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Score: {postSet.activity.score}/10
                </Badge>
              </div>

              {/* Posts Tabs */}
              <Tabs
                defaultValue={Object.keys(postSet.posts)[0]}
                className="w-full"
              >
                <TabsList>
                  {Object.keys(postSet.posts).map((platform) => (
                    <TabsTrigger key={platform} value={platform}>
                      {getPlatformIcon(platform)}{" "}
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(postSet.posts).map(([platform, content]) => {
                  const key = `${index}-${platform}`;
                  const isSaved = savedPosts.has(key);
                  const isLoading = actionLoading === key;

                  return (
                    <TabsContent key={platform} value={platform}>
                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">
                            {getPlatformIcon(platform)} {platform}
                          </h4>
                          <span className="text-sm text-muted-foreground">
                            {content.length} characters
                          </span>
                        </div>

                        <div className="bg-muted p-4 rounded mb-4 whitespace-pre-wrap font-mono text-sm">
                          {content}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          {isSaved ? (
                            <Badge variant="outline" className="text-green-600 gap-1 py-2 px-4">
                              <CheckCircle className="h-4 w-4" />
                              Action Completed
                            </Badge>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                onClick={() => handleSave(platform, content, key)}
                                disabled={isLoading}
                                className="gap-2"
                              >
                                {isLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleOpenSchedule(platform, content, key)}
                                disabled={isLoading}
                                className="gap-2"
                              >
                                <Calendar className="h-4 w-4" />
                                Schedule
                              </Button>
                              <Button
                                onClick={() => handlePostNow(platform, content, key)}
                                disabled={isLoading}
                                className="gap-2"
                              >
                                {isLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                                Post Now
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            onClick={() => copyPost(content)}
                          >
                            📋 Copy
                          </Button>
                        </div>
                      </Card>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !githubData && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground text-lg">
            Click "Analyze with AI" to generate posts from your GitHub activity
          </p>
        </Card>
      )}

      {postSets.length === 0 && githubData && !loading && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground text-lg">
            😕 No shareable activities found. Try adjusting the timeframe or
            push some code!
          </p>
        </Card>
      )}

      {/* Schedule Modal */}
      <ScheduleModal
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        content={scheduleContent}
        onSchedule={handleSchedule}
        isLoading={actionLoading !== null}
      />
    </div>
  );
}
