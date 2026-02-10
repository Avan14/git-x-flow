"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Twitter,
  Linkedin,
  Clock,
  CheckCircle,
  Trash2,
  Calendar,
  Send,
  ExternalLink,
  Edit,
} from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";

export interface PostContent {
  id: string;
  content: string;
  format: string;
  status: "saved" | "scheduled" | "posted";
  platform?: string | null;
  scheduledAt?: Date | null;
  postedAt?: Date | null;
  platformUrl?: string | null;
  createdAt: Date;
  achievement?: {
    id: string;
    title: string;
    repoName: string;
    type: string;
  } | null;
}

interface PostCardProps {
  post: PostContent;
  onPostNow?: (postId: string) => void;
  onSchedule?: (postId: string) => void;
  onEdit?: (postId: string, content: string) => void;
  onDelete?: (postId: string) => void;
  isLoading?: boolean;
}

const platformIcons: Record<string, typeof Twitter> = {
  twitter: Twitter,
  linkedin: Linkedin,
};

const statusConfig = {
  saved: {
    icon: Clock,
    color: "text-amber-500 bg-amber-500/10",
    label: "Saved",
  },
  scheduled: {
    icon: Calendar,
    color: "text-blue-500 bg-blue-500/10",
    label: "Scheduled",
  },
  posted: {
    icon: CheckCircle,
    color: "text-green-500 bg-green-500/10",
    label: "Posted",
  },
};

export function PostCard({
  post,
  onPostNow,
  onSchedule,
  onEdit,
  onDelete,
  isLoading,
}: PostCardProps) {
  const PlatformIcon = platformIcons[post.platform || "twitter"] || Twitter;
  const status = statusConfig[post.status];
  const StatusIcon = status.icon;

  // Calculate time remaining for scheduled posts
  const getTimeRemaining = () => {
    if (!post.scheduledAt) return null;
    const diff = new Date(post.scheduledAt).getTime() - Date.now();
    if (diff <= 0) return "Processing...";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? "s" : ""} left`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  };

  return (
    <Card className="group hover:shadow-md transition-shadow bg-background/40 backdrop-blur-xl border-border/50">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Content */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                <PlatformIcon className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium capitalize flex items-center gap-2">
                  {post.platform || "Twitter"}
                  <Badge variant="outline" className={status.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatRelativeDate(new Date(post.createdAt))}
                </div>
              </div>
            </div>

            {/* Content Preview */}
            <p className="text-sm text-muted-foreground line-clamp-3">
              {post.content}
            </p>

            {/* Achievement Badge */}
            {post.achievement && (
              <Badge variant="secondary" className="text-xs">
                📁 {post.achievement.repoName}
              </Badge>
            )}

            {/* Scheduled Time */}
            {post.status === "scheduled" && post.scheduledAt && (
              <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                <Clock className="h-4 w-4" />
                <span>{getTimeRemaining()}</span>
                <span className="text-muted-foreground">
                  ({new Date(post.scheduledAt).toLocaleString()})
                </span>
              </div>
            )}

            {/* Posted Info */}
            {post.status === "posted" && post.postedAt && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span>Posted {formatRelativeDate(new Date(post.postedAt))}</span>
                {post.platformUrl && (
                  <a
                    href={post.platformUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    View <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col gap-2">
            {/* Edit (for saved & scheduled) */}
            {(post.status === "saved" || post.status === "scheduled") &&
              onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(post.id, post.content)}
                  disabled={isLoading}
                  className="gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
              )}

            {/* Post Now (for saved & scheduled) */}
            {(post.status === "saved" || post.status === "scheduled") &&
              onPostNow && (
                <Button
                  size="sm"
                  onClick={() => onPostNow(post.id)}
                  disabled={isLoading}
                  className="gap-1"
                >
                  <Send className="h-3 w-3" />
                  Post Now
                </Button>
              )}

            {/* Schedule (for saved only) */}
            {post.status === "saved" && onSchedule && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSchedule(post.id)}
                disabled={isLoading}
                className="gap-1"
              >
                <Calendar className="h-3 w-3" />
                Schedule
              </Button>
            )}

            {/* Delete (for saved & scheduled) */}
            {(post.status === "saved" || post.status === "scheduled") &&
              onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(post.id)}
                  disabled={isLoading}
                  className="gap-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}