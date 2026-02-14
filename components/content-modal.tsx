"use client";

import React, { useState } from "react";
import { Copy, Check, Twitter, Linkedin, FileText, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievementId: string;
  achievementTitle: string;
  existingContent?: {
    resume_bullet?: string;
    linkedin_post?: string;
    twitter_thread?: string;
  };
}

type Format = "resume_bullet" | "linkedin_post" | "twitter_thread";

export function ContentModal({
  open,
  onOpenChange,
  achievementId,
  achievementTitle,
  existingContent = {},
}: ContentModalProps) {
  const [activeTab, setActiveTab] = useState<Format>("resume_bullet");
  const [content, setContent] = useState<Record<Format, string>>({
    resume_bullet: existingContent.resume_bullet || "",
    linkedin_post: existingContent.linkedin_post || "",
    twitter_thread: existingContent.twitter_thread || "",
  });
  const [loading, setLoading] = useState<Record<Format, boolean>>({
    resume_bullet: false,
    linkedin_post: false,
    twitter_thread: false,
  });
  const [copied, setCopied] = useState(false);

  const generateContent = async (format: Format) => {
    setLoading((prev) => ({ ...prev, [format]: true }));

    try {
      const response = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ achievementId, format }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      const data = await response.json();
      setContent((prev) => ({ ...prev, [format]: data.content.content }));
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setLoading((prev) => ({ ...prev, [format]: false }));
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(content[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const postToSocial = async (platform: "twitter" | "linkedin") => {
    try {
      const res = await fetch("/api/content/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content[activeTab],
          format: activeTab,
          platform: platform,
          // posted with 1 min delay
          scheduledAt: (new Date(Date.now() + 60 * 1000)).toISOString(),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to post");
      }

      // Show success feedback
      alert(`Posted to ${platform}!`);
    } catch (error) {
      console.error("Post error:", error);
      alert("Failed to post. Please try again.");
    }
  };

  const formatLabels: Record<Format, { label: string; icon: typeof FileText }> = {
    resume_bullet: { label: "Resume", icon: FileText },
    linkedin_post: { label: "LinkedIn", icon: Linkedin },
    twitter_thread: { label: "Twitter", icon: Twitter },
  };

  const currentContent = content[activeTab];
  const isLoading = loading[activeTab];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Content</DialogTitle>
          <DialogDescription className="line-clamp-1">
            {achievementTitle}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Format)}>
          <TabsList className="grid w-full grid-cols-3">
            {(Object.entries(formatLabels) as [Format, { label: string; icon: typeof FileText }][]).map(
              ([format, { label, icon: Icon }]) => (
                <TabsTrigger key={format} value={format} className="gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </TabsTrigger>
              )
            )}
          </TabsList>

          {(Object.keys(formatLabels) as Format[]).map((format) => (
            <TabsContent key={format} value={format} className="space-y-4">
              {content[format] ? (
                <>
                  <div className="relative">
                    <Textarea
                      value={content[format]}
                      onChange={(e) =>
                        setContent((prev) => ({ ...prev, [format]: e.target.value }))
                      }
                      className="min-h-[200px] resize-none"
                      placeholder="Generated content will appear here..."
                    />
                    <div className="absolute bottom-2 right-2 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {content[format].split(/\s+/).filter(Boolean).length} words
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>

                    <div className="flex items-center gap-2">
                      {format === "twitter_thread" && (
                        <Button
                          size="sm"
                          onClick={() => postToSocial("twitter")}
                        >
                          <Twitter className="mr-2 h-4 w-4" />
                          Post to X
                        </Button>
                      )}
                      {format === "linkedin_post" && (
                        <Button
                          size="sm"
                          onClick={() => postToSocial("linkedin")}
                        >
                          <Linkedin className="mr-2 h-4 w-4" />
                          Post to LinkedIn
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateContent(format)}
                        disabled={loading[format]}
                      >
                        {loading[format] ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Regenerate
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mb-4">
                    {React.createElement(formatLabels[format].icon, {
                      className: "h-7 w-7 text-[hsl(var(--muted-foreground))]",
                    })}
                  </div>
                  <h3 className="font-medium mb-2">
                    Generate {formatLabels[format].label} Content
                  </h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4 max-w-xs">
                    AI will create polished content based on your achievement.
                  </p>
                  <Button onClick={() => generateContent(format)} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Content
                      </>
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
