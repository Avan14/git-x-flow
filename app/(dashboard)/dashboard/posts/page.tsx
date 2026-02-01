"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard, PostContent } from "@/components/posts/post-card";
import { ScheduleModal } from "@/components/posts/schedule-modal";
import { EditPostModal } from "@/components/posts/edit-post-modal";
import { EmptyState } from "@/components/empty-state";
import { Clock, Calendar, CheckCircle, Loader2 } from "lucide-react";

export default function PostsPage() {
  const [posts, setPosts] = useState<PostContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Schedule modal state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [schedulePostId, setSchedulePostId] = useState("");

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editPostId, setEditPostId] = useState("");
  const [isPro, setIsPro] = useState(false);

// Fetch user's subscription status
useEffect(() => {
  const fetchUserSubscription = async () => {
    try {
      const res = await fetch("/api/user/subscription");
      const data = await res.json();
      setIsPro(data.plan === "pro");
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
      setIsPro(false);
    }
  };
  fetchUserSubscription();
}, []);

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

  const handleOpenSchedule = (postId: string) => {
    setSchedulePostId(postId);
    setScheduleModalOpen(true);
  };

  const handleSchedule = async (data: {
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

  const handleOpenEdit = (postId: string, content: string) => {
    setEditPostId(postId);
    setEditContent(content);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (newContent: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/content/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: editPostId,
          content: newContent,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      // Optimistic update
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editPostId ? { ...p, content: newContent } : p
        )
      );
      setEditModalOpen(false);
      alert("✅ Post updated successfully!");
    } catch (error: any) {
      alert(`❌ Update failed: ${error.message}`);
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
      <div className="flex items-center justify-center min-h-100">
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
                  onEdit={handleOpenEdit}
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
  onSchedule={handleSchedule}
  isLoading={actionLoading}
  isPro={isPro} // Use actual value instead of hardcoded true
/>

      {/* Edit Modal */}
      <EditPostModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        content={editContent}
        onSave={handleSaveEdit}
        isLoading={actionLoading}
      />
    </div>
  );
}