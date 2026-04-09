"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Heart, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStatusConfig } from "@/lib/status";
import { getHealth } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { CitationStatus } from "@/lib/types";

const counterOrder: CitationStatus[] = [
  "injected",
  "already_present",
  "skipped_chitchat",
  "skipped_ungrounded",
  "skipped_no_match",
];

interface HealthCountersPanelProps {
  refreshKey: number;
}

export function HealthCountersPanel({ refreshKey }: HealthCountersPanelProps) {
  const [counters, setCounters] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHealth();
      setCounters(data.counters);
      setLastFetched(new Date());
    } catch {
      // silently fail — connectivity indicator covers this
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and when refreshKey changes
  useEffect(() => {
    fetchHealth();
  }, [fetchHealth, refreshKey]);

  return (
    <Card className="shrink-0">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          <Heart className="w-3 h-3" />
          Health Counters
        </CardTitle>
        <CardAction>
          <div className="flex items-center gap-2">
            {lastFetched && (
              <span className="text-[10px] text-muted-foreground/40">
                {lastFetched.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={fetchHealth}
              disabled={loading}
              title="Refresh health counters"
            >
              {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {counterOrder.map((status) => {
            const config = getStatusConfig(status);
            const count = counters[status] ?? 0;

            return (
              <motion.div
                key={status}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2",
                  config.bg,
                  config.border
                )}
              >
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    config.color
                  )}
                >
                  {config.label}
                </span>
                <span
                  className={cn(
                    "font-mono text-sm font-bold tabular-nums",
                    config.color
                  )}
                >
                  {count}
                </span>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
