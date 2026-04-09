"use client";

import {
  CheckCircle,
  Link,
  MessageCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { getStatusConfig } from "@/lib/status";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "check-circle": CheckCircle,
  link: Link,
  "message-circle": MessageCircle,
  "alert-triangle": AlertTriangle,
  "x-circle": XCircle,
  circle: XCircle,
};

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
  showIcon?: boolean;
  showLabel?: boolean;
}

export function StatusBadge({
  status,
  size = "sm",
  showIcon = true,
  showLabel = true,
}: StatusBadgeProps) {
  const config = getStatusConfig(status);
  const Icon = iconMap[config.icon] ?? XCircle;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md font-medium",
        config.bg,
        config.color,
        config.border,
        "border",
        size === "sm" && "px-1.5 py-0.5 text-[10px]",
        size === "md" && "px-2 py-0.5 text-xs"
      )}
    >
      {showIcon && (
        <Icon
          className={cn(
            size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"
          )}
        />
      )}
      {showLabel && (
        <span>{config.label}</span>
      )}
    </span>
  );
}
