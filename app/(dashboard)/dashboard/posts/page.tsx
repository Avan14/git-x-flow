"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { PostCard, PostContent } from "@/components/posts/post-card";
import { ScheduleModal } from "@/components/posts/schedule-modal";
import { EmptyState } from "@/components/empty-state";
import { Clock, Calendar, CheckCircle, Loader2 } from "lucide-react";

export default function PostsPage() {
  const [posts, setPosts] = useState<PostContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Schedule modal state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleContent, setScheduleContent] = useState("");
  const [schedulePostId, setSchedulePostId] = useState("");

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/content/list");
      const data = await res.json();
      if (data.content) {
        setPosts(data.content);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const savedPosts = posts.filter((p) => p.status === "saved");
  const scheduledPosts = posts.filter((p) => p.status === "scheduled");
  const postedPosts = posts.filter((p) => p.status === "posted");

  const handlePostNow = async (postId: string) => {
    if (!confirm("Post this content now?")) return;

    setActionLoading(true);
    try {
      const post = posts.find((p) => p.id === postId);
      if (!post) throw new Error("Post not found");

      const res = await fetch("/api/social/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: post.content,
          platforms: [post.platform || "twitter"],
          contentId: post.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      // Optimistic update
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, status: "posted" as const, postedAt: new Date() }
            : p
        )
      );
      alert("✅ Posted successfully!");
    } catch (error: any) {
      alert(`❌ Post failed: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenSchedule = (postId: string, content: string) => {
    setSchedulePostId(postId);
    setScheduleContent(content);
    setScheduleModalOpen(true);
  };

  const handleSchedule = async (data: {
    content: string;
    platform: string;
    scheduledAt: Date;
  }) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/content/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: schedulePostId,
          platform: data.platform,
          scheduledAt: data.scheduledAt.toISOString(),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      // Optimistic update
      setPosts((prev) =>
        prev.map((p) =>
          p.id === schedulePostId
            ? {
                ...p,
                status: "scheduled" as const,
                platform: data.platform,
                scheduledAt: data.scheduledAt,
              }
            : p
        )
      );
      setScheduleModalOpen(false);
      alert(`📅 Post scheduled for ${data.scheduledAt.toLocaleString()}`);
    } catch (error: any) {
      alert(`❌ Schedule failed: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post permanently?")) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/content/delete?id=${postId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Optimistic update
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      alert("🗑️ Post deleted");
    } catch (error: any) {
      alert(`❌ Delete failed: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Posts</h1>
        <p className="text-muted-foreground">
          Manage your saved, scheduled, and published posts
        </p>
      </div>

      <Tabs defaultValue="saved" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="saved" className="gap-2">
            <Clock className="h-4 w-4" />
            Saved ({savedPosts.length})
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="gap-2">
            <Calendar className="h-4 w-4" />
            Scheduled ({scheduledPosts.length})
          </TabsTrigger>
          <TabsTrigger value="posted" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Posted ({postedPosts.length})
          </TabsTrigger>
        </TabsList>

        {/* Saved Tab */}
        <TabsContent value="saved" className="mt-6">
          {savedPosts.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No saved posts"
              description="Generate content with AI and save posts to see them here."
            />
          ) : (
            <div className="space-y-4">
              {savedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostNow={handlePostNow}
                  onSchedule={handleOpenSchedule}
                  onDelete={handleDelete}
                  isLoading={actionLoading}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Scheduled Tab */}
        <TabsContent value="scheduled" className="mt-6">
          {scheduledPosts.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No scheduled posts"
              description="Schedule posts from the AI generator or the Saved tab."
            />
          ) : (
            <div className="space-y-4">
              {scheduledPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostNow={handlePostNow}
                  onDelete={handleDelete}
                  isLoading={actionLoading}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Posted Tab */}
        <TabsContent value="posted" className="mt-6">
          {postedPosts.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="No posted content"
              description="Posts that have been published will appear here."
            />
          ) : (
            <div className="space-y-4">
              {postedPosts.map((post) => (
                <PostCard key={post.id} post={post} isLoading={actionLoading} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Schedule Modal */}
      <ScheduleModal
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        content={scheduleContent}
        onSchedule={handleSchedule}
        isLoading={actionLoading}
      />
    </div>
  );
}
