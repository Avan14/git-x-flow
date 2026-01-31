"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Clock, Twitter, Linkedin } from "lucide-react";

interface ScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  onSchedule: (data: {
    content: string;
    platform: string;
    scheduledAt: Date;
  }) => void;
  isLoading?: boolean;
}

const TIME_PRESETS = [
  { label: "5 minutes", minutes: 5 },
  { label: "1 hour", minutes: 60 },
  { label: "6 hours", minutes: 360 },
  { label: "1 day", minutes: 1440 },
  { label: "3 days", minutes: 4320 },
  { label: "5 days", minutes: 7200 },
];

export function ScheduleModal({
  open,
  onOpenChange,
  content: initialContent,
  onSchedule,
  isLoading,
}: ScheduleModalProps) {
  const [content, setContent] = useState(initialContent);
  const [platform, setPlatform] = useState("twitter");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  const handleSchedule = () => {
    if (!selectedPreset) return;

    const scheduledAt = new Date(Date.now() + selectedPreset * 60 * 1000);
    onSchedule({ content, platform, scheduledAt });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Post
          </DialogTitle>
          <DialogDescription>
            Edit your post and choose when to publish it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Content Editor */}
          <div className="space-y-2">
            <Label>Post Content</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="resize-none"
              placeholder="Your post content..."
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length} characters
            </p>
          </div>

          {/* Platform Selector */}
          <div className="space-y-2">
            <Label>Platform</Label>
            <RadioGroup
              value={platform}
              onValueChange={setPlatform}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="twitter" id="twitter" />
                <Label
                  htmlFor="twitter"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="linkedin" id="linkedin" />
                <Label
                  htmlFor="linkedin"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Time Presets */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Schedule For
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {TIME_PRESETS.map((preset) => (
                <Button
                  key={preset.minutes}
                  type="button"
                  variant={
                    selectedPreset === preset.minutes ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedPreset(preset.minutes)}
                  className="w-full"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            {selectedPreset && (
              <p className="text-sm text-muted-foreground">
                Will be posted at{" "}
                <strong>
                  {new Date(
                    Date.now() + selectedPreset * 60 * 1000
                  ).toLocaleString()}
                </strong>
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={!selectedPreset || !content.trim() || isLoading}
          >
            {isLoading ? "Scheduling..." : "📅 Schedule Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
