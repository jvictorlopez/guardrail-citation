import type { CitationStatus } from "./types";

export const statusConfig: Record<
  CitationStatus,
  {
    label: string;
    icon: string;
    color: string;
    bg: string;
    border: string;
    glow: string;
    ringColor: string;
  }
> = {
  injected: {
    label: "Citation Injected",
    icon: "check-circle",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/5",
    ringColor: "ring-emerald-500/20",
  },
  already_present: {
    label: "Already Present",
    icon: "link",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    glow: "shadow-blue-500/5",
    ringColor: "ring-blue-500/20",
  },
  skipped_chitchat: {
    label: "Chitchat Skipped",
    icon: "message-circle",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    glow: "shadow-violet-500/5",
    ringColor: "ring-violet-500/20",
  },
  skipped_ungrounded: {
    label: "Ungrounded Skipped",
    icon: "alert-triangle",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    glow: "shadow-amber-500/5",
    ringColor: "ring-amber-500/20",
  },
  skipped_no_match: {
    label: "No Match Found",
    icon: "x-circle",
    color: "text-zinc-400",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/20",
    glow: "shadow-zinc-500/5",
    ringColor: "ring-zinc-500/20",
  },
};

export function getStatusConfig(status: string) {
  return (
    statusConfig[status as CitationStatus] ?? {
      label: status,
      icon: "circle",
      color: "text-zinc-400",
      bg: "bg-zinc-500/10",
      border: "border-zinc-500/20",
      glow: "shadow-zinc-500/5",
      ringColor: "ring-zinc-500/20",
    }
  );
}
