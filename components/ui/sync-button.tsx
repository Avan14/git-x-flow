"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  TrendingUp,
  Award,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    stats?: { new: number; updated: number };
    error?: string;
  } | null>(null);

    useEffect(() => {
    if (showModal && syncResult?.success) {
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showModal, syncResult?.success]);

  const handleSync = async () => {
    setLoading(true);
    setSyncResult(null);

    try {
      const res = await fetch("/api/github/sync", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Sync failed");
      }

      setSyncResult({
        success: true,
        stats: data.stats,
      });

      setShowModal(true);
    } catch (err: any) {
      setSyncResult({
        success: false,
        error: err.message,
      });

      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleSync}
        disabled={loading}
        className="gap-2"
      >
        <RefreshCw
          className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
        />
        {loading ? "Syncing..." : "Sync GitHub"}
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSync}
        disabled={loading}
        className="gap-2"
      >
        <RefreshCw
          className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
        />
        {loading ? "Syncing..." : "Sync GitHub"}
      </Button>

      {/* Custom Modal */}
      <div className="fixed inset-0 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 z-[9999] bg-black/50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        />

        {/* Modal Content */}
        <div className="top-50 right-20 relative z-[10000] w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border border-border/50 rounded-lg shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
          {/* Close Button */}
          <button
            onClick={() => setShowModal(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
          </button>

          {syncResult?.success ? (
            <>
              <div className="flex flex-col items-center text-center mb-6">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-semibold">
                  Sync Successful! 🎉
                </h2>
                <p className="text-muted-foreground mt-2">
                  Your GitHub data has been updated
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center text-center mb-6">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-semibold">Sync Failed</h2>
                <p className="text-muted-foreground mt-2">
                  {syncResult?.error || "Something went wrong"}
                </p>
              </div>

              <div className="mb-6">
                <Card className="bg-red-500/5 border-red-500/20">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground text-center">
                      Please check your GitHub connection and try again. If the
                      problem persists, contact support.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Button
                onClick={() => setShowModal(false)}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Close
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}