interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const statusColors: Record<string, { bg: string; text: string }> = {
  injected: { bg: "#064e3b", text: "#6ee7b7" },
  already_present: { bg: "#1e3a5f", text: "#93c5fd" },
  skipped_chitchat: { bg: "#4a4458", text: "#c4b5fd" },
  skipped_ungrounded: { bg: "#78350f", text: "#fcd34d" },
  skipped_no_match: { bg: "#3f3f46", text: "#a1a1aa" },
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const colors = statusColors[status] || { bg: "#3f3f46", text: "#a1a1aa" };
  const fontSize = size === "sm" ? "0.7rem" : "0.8rem";
  const padding = size === "sm" ? "2px 8px" : "4px 12px";

  return (
    <span
      style={{
        display: "inline-block",
        backgroundColor: colors.bg,
        color: colors.text,
        fontSize,
        fontWeight: 600,
        fontFamily: "'SF Mono', 'Fira Code', monospace",
        padding,
        borderRadius: "6px",
        letterSpacing: "0.02em",
      }}
    >
      {status}
    </span>
  );
}
