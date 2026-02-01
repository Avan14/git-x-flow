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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Twitter, Linkedin, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchedule: (data: { platform: string; scheduledAt: Date }) => void;
  isLoading?: boolean;
  isPro?: boolean; // Add this prop to check if user is pro
}

const TIME_PRESETS = [
  { label: "5 minutes", minutes: 5 },
  { label: "1 hour", minutes: 60 },
  { label: "6 hours", minutes: 360 },
  { label: "1 day", minutes: 1440 },
  { label: "3 days", minutes: 4320 },
  { label: "5 days", minutes: 7200 },
];

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "IST (India Standard Time)" },
  { value: "America/New_York", label: "EST (Eastern Time)" },
  { value: "America/Chicago", label: "CST (Central Time)" },
  { value: "America/Denver", label: "MST (Mountain Time)" },
  { value: "America/Los_Angeles", label: "PST (Pacific Time)" },
  { value: "Europe/London", label: "GMT (London)" },
  { value: "Europe/Paris", label: "CET (Central European)" },
  { value: "Asia/Tokyo", label: "JST (Japan)" },
  { value: "Asia/Dubai", label: "GST (Gulf)" },
  { value: "Australia/Sydney", label: "AEST (Sydney)" },
  { value: "UTC", label: "UTC" },
];

export function ScheduleModal({
  open,
  onOpenChange,
  onSchedule,
  isLoading,
  isPro = false, // Default to false
}: ScheduleModalProps) {
  const [platform, setPlatform] = useState("twitter");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  
  // Pro features
  const [scheduleMode, setScheduleMode] = useState<"quick" | "exact">("quick");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState("Asia/Kolkata");

  const handleSchedule = () => {
    let scheduledAt: Date;

    if (scheduleMode === "quick") {
      if (!selectedPreset) return;
      scheduledAt = new Date(Date.now() + selectedPreset * 60 * 1000);
    } else {
      // Exact time mode
      if (!selectedDate || !selectedTime) return;

      // Combine date and time in the selected timezone
      const dateTimeString = `${selectedDate}T${selectedTime}:00`;
      scheduledAt = new Date(dateTimeString);

      // Convert from selected timezone to UTC
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: selectedTimezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      // This ensures the date is correctly interpreted in the selected timezone
      const tzDate = new Date(dateTimeString);
      scheduledAt = tzDate;
    }

    onSchedule({ platform, scheduledAt });
  };

  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getMinTime = () => {
    if (selectedDate === getMinDateTime()) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    }
    return "00:00";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Post
            {isPro && (
              <Badge variant="default" className="ml-2 gap-1">
                <Crown className="h-3 w-3" />
                Pro
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Choose when and where to publish your post.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
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

          {/* Schedule Time - Tabs for Pro */}
          {isPro ? (
            <Tabs value={scheduleMode} onValueChange={(v) => setScheduleMode(v as "quick" | "exact")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="quick">Quick Schedule</TabsTrigger>
                <TabsTrigger value="exact" className="gap-1">
                  <Crown className="h-3 w-3" />
                  Exact Time
                </TabsTrigger>
              </TabsList>

              {/* Quick Schedule Tab */}
              <TabsContent value="quick" className="space-y-2 mt-4">
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
                  <p className="text-sm text-muted-foreground mt-2">
                    Will be posted at{" "}
                    <strong>
                      {new Date(
                        Date.now() + selectedPreset * 60 * 1000
                      ).toLocaleString()}
                    </strong>
                  </p>
                )}
              </TabsContent>

              {/* Exact Time Tab (Pro) */}
              <TabsContent value="exact" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={getMinDateTime()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      min={getMinTime()}
                    />
                  </div>
                </div>

                {selectedDate && selectedTime && (
                  <p className="text-sm text-muted-foreground">
                    Will be posted at{" "}
                    <strong>
                      {new Date(`${selectedDate}T${selectedTime}`).toLocaleString("en-US", {
                        timeZone: selectedTimezone,
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}{" "}
                      ({TIMEZONES.find((tz) => tz.value === selectedTimezone)?.label})
                    </strong>
                  </p>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            // Non-Pro: Only Quick Schedule
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Schedule For
                </Label>
                <Badge variant="outline" className="gap-1 text-xs">
                  <Crown className="h-3 w-3" />
                  Upgrade for exact time
                </Badge>
              </div>
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
          )}
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
            disabled={
              (scheduleMode === "quick" && !selectedPreset) ||
              (scheduleMode === "exact" && (!selectedDate || !selectedTime)) ||
              isLoading
            }
          >
            {isLoading ? "Scheduling..." : "📅 Schedule Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}