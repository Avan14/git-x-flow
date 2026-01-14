"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  Twitter,
  Linkedin,
  FileText,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface AchievementContentClientProps {
  achievementId: string;
  achievementTitle: string;
  existingContent: Record<string, string>;
}

type Format = "resume_bullet" | "linkedin_post" | "twitter_thread";

export function AchievementContentClient({
  achievementId,
  achievementTitle,
  existingContent,
}: AchievementContentClientProps) {
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
  const [posting, setPosting] = useState<"twitter" | "linkedin" | null>(null);

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
      alert("Failed to generate content. Please try again.");
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
    setPosting(platform);
    try {
      const response = await fetch("/api/social/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content[activeTab],
          platforms: [platform],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to post");
      }

      alert(`Successfully posted to ${platform}!`);
    } catch (error) {
      console.error("Post error:", error);
      alert(`Failed to post to ${platform}. Please try again.`);
    } finally {
      setPosting(null);
    }
  };

  const formatConfig: Record<
    Format,
    { label: string; icon: typeof FileText; description: string }
  > = {
    resume_bullet: {
      label: "Resume",
      icon: FileText,
      description: "Action-oriented bullet point for your resume",
    },
    linkedin_post: {
      label: "LinkedIn",
      icon: Linkedin,
      description: "Professional post with engagement hooks",
    },
    twitter_thread: {
      label: "Twitter/X",
      icon: Twitter,
      description: "Casual thread to share your achievement",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Content</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Format)}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            {(Object.entries(formatConfig) as [Format, typeof formatConfig.resume_bullet][]).map(
              ([format, config]) => (
                <TabsTrigger key={format} value={format} className="gap-2">
                  <config.icon className="h-4 w-4" />
                  {config.label}
                  {content[format] && (
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  )}
                </TabsTrigger>
              )
            )}
          </TabsList>

          {(Object.entries(formatConfig) as [Format, typeof formatConfig.resume_bullet][]).map(
            ([format, config]) => (
              <TabsContent key={format} value={format} className="space-y-4">
                {content[format] ? (
                  <>
                    <div className="relative">
                      <Textarea
                        value={content[format]}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            [format]: e.target.value,
                          }))
                        }
                        className="min-h-[200px] resize-none font-mono text-sm"
                      />
                      <div className="absolute bottom-3 right-3">
                        <Badge variant="secondary" className="text-xs">
                          {content[format].split(/\s+/).filter(Boolean).length} words
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyToClipboard}
                        >
                          {copied ? (
                            <Check className="mr-2 h-4 w-4" />
                          ) : (
                            <Copy className="mr-2 h-4 w-4" />
                          )}
                          {copied ? "Copied!" : "Copy"}
                        </Button>

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

                      <div className="flex items-center gap-2">
                        {format === "twitter_thread" && (
                          <Button
                            size="sm"
                            onClick={() => postToSocial("twitter")}
                            disabled={posting === "twitter"}
                          >
                            {posting === "twitter" ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Twitter className="mr-2 h-4 w-4" />
                            )}
                            Post to X
                          </Button>
                        )}
                        {format === "linkedin_post" && (
                          <Button
                            size="sm"
                            onClick={() => postToSocial("linkedin")}
                            disabled={posting === "linkedin"}
                          >
                            {posting === "linkedin" ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Linkedin className="mr-2 h-4 w-4" />
                            )}
                            Post to LinkedIn
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-[hsl(var(--border))] rounded-xl">
                    <div className="h-14 w-14 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mb-4">
                      <config.icon className="h-7 w-7 text-[hsl(var(--muted-foreground))]" />
                    </div>
                    <h3 className="font-semibold mb-1">
                      Generate {config.label} Content
                    </h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6 max-w-xs">
                      {config.description}
                    </p>
                    <Button
                      onClick={() => generateContent(format)}
                      disabled={loading[format]}
                    >
                      {loading[format] ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate with AI
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </TabsContent>
            )
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
