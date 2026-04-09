"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Shield,
  Activity,
  Loader2,
  Inbox,
  AlertCircle,
  Clock,
  Cpu,
  Tag,
  Search,
  MessageSquareText,
  Server,
  Blend,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { getStatusConfig } from "@/lib/status";
import { cn } from "@/lib/utils";
import type { GuardrailResponse } from "@/lib/types";

interface ResponsePanelProps {
  response: GuardrailResponse | null;
  loading: boolean;
  error: string | null;
}

const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export function ResponsePanel({ response, loading, error }: ResponsePanelProps) {
  return (
    <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          <Activity className="w-3 h-3" />
          Response
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 overflow-auto">
        <AnimatePresence mode="wait">
          {loading ? (
            <LoadingState key="loading" />
          ) : error ? (
            <ErrorState key="error" error={error} />
          ) : response ? (
            <ResponseContent key="response" response={response} />
          ) : (
            <EmptyState key="empty" />
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <motion.div
      {...fadeIn}
      className="flex flex-col items-center justify-center h-full text-center py-12"
    >
      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
        <Inbox className="w-5 h-5 text-muted-foreground/50" />
      </div>
      <p className="text-sm text-muted-foreground font-medium">
        No response yet
      </p>
      <p className="text-xs text-muted-foreground/60 mt-1 max-w-[260px]">
        Select a demo case and click{" "}
        <span className="font-semibold text-primary">Run Guardrail</span> to
        see results
      </p>
    </motion.div>
  );
}

function LoadingState() {
  return (
    <motion.div
      {...fadeIn}
      className="flex flex-col items-center justify-center h-full py-12"
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground font-medium">
        Processing guardrail...
      </p>
      <p className="text-xs text-muted-foreground/60 mt-1">
        Matching citations and evaluating rules
      </p>
    </motion.div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <motion.div
      {...fadeIn}
      className="flex flex-col items-center justify-center h-full py-12"
    >
      <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-5 h-5 text-red-400" />
      </div>
      <p className="text-sm text-red-400 font-medium">Request Failed</p>
      <p className="text-xs text-muted-foreground/60 mt-1 max-w-[320px] text-center">
        {error}
      </p>
    </motion.div>
  );
}

function ResponseContent({ response }: { response: GuardrailResponse }) {
  const { final_answer, citation_decision, metrics } = response;
  const statusCfg = getStatusConfig(citation_decision.status);
  const scoreBreakdown = citation_decision.score_breakdown;

  const glowClass =
    citation_decision.status === "injected"
      ? "glow-emerald"
      : citation_decision.status === "already_present"
        ? "glow-blue"
        : citation_decision.status === "skipped_chitchat"
          ? "glow-violet"
          : citation_decision.status === "skipped_ungrounded"
            ? "glow-amber"
            : "glow-zinc";

  const modelCalls = metrics.model_calls ?? metrics.llm_calls ?? 0;

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="space-y-4"
    >
      {/* Final Answer */}
      <motion.div variants={fadeIn}>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
            Final Answer
          </span>
        </div>
        <div className="rounded-lg bg-secondary/50 border border-border/50 p-4">
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {final_answer}
          </p>
        </div>
      </motion.div>

      {/* Citation Decision */}
      <motion.div variants={fadeIn}>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
            Citation Decision
          </span>
        </div>
        <div
          className={cn(
            "rounded-lg border p-4 space-y-3",
            statusCfg.border,
            statusCfg.bg,
            glowClass
          )}
        >
          {/* Status row */}
          <div className="flex items-center justify-between">
            <StatusBadge
              status={citation_decision.status}
              size="md"
              showIcon={true}
            />
            {citation_decision.matched_label && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Tag className="w-3 h-3" />
                {citation_decision.matched_label}
              </span>
            )}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-2">
            <DetailItem
              icon={<Search className="w-3 h-3" />}
              label="Strategy"
              value={citation_decision.strategy_used}
            />
            <DetailItem
              icon={<Activity className="w-3 h-3" />}
              label="Score"
              value={
                citation_decision.similarity_score !== null
                  ? citation_decision.similarity_score.toFixed(4)
                  : "—"
              }
            />
            {citation_decision.provider_used && (
              <DetailItem
                icon={<Server className="w-3 h-3" />}
                label="Provider"
                value={citation_decision.provider_used}
              />
            )}
          </div>

          {/* Score Breakdown for hybrid */}
          {scoreBreakdown && scoreBreakdown.hybrid_score !== null && (
            <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-border/30">
              <MiniStat
                label="Semantic"
                value={scoreBreakdown.semantic_score?.toFixed(4) ?? "—"}
              />
              <MiniStat
                label="BM25"
                value={scoreBreakdown.bm25_score?.toFixed(4) ?? "—"}
              />
              <MiniStat
                label="Hybrid"
                value={scoreBreakdown.hybrid_score?.toFixed(4) ?? "—"}
                highlight
              />
              <MiniStat
                label="Alpha"
                value={scoreBreakdown.alpha?.toFixed(2) ?? "—"}
              />
            </div>
          )}

          {/* Reason */}
          <div className="flex items-start gap-1.5 pt-2 border-t border-border/30">
            <MessageSquareText className="w-3 h-3 text-muted-foreground/40 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {citation_decision.reason}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Metrics */}
      <motion.div variants={fadeIn}>
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
            Metrics
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MetricTile
            icon={<Clock className="w-4 h-4" />}
            label="Latency"
            value={`${metrics.latency_ms}ms`}
          />
          <MetricTile
            icon={<Cpu className="w-4 h-4" />}
            label="Model Calls"
            value={String(modelCalls)}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-background/30 px-2.5 py-1.5">
      <span className="text-muted-foreground/50">{icon}</span>
      <div className="flex flex-col">
        <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider leading-none">
          {label}
        </span>
        <span className="text-xs font-mono font-medium text-foreground/80 mt-0.5">
          {value}
        </span>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center rounded-md bg-background/20 px-1.5 py-1.5">
      <span className="text-[9px] text-muted-foreground/40 uppercase tracking-wider leading-none">
        {label}
      </span>
      <span
        className={cn(
          "text-[11px] font-mono font-semibold mt-0.5 tabular-nums",
          highlight ? "text-primary" : "text-foreground/70"
        )}
      >
        {value}
      </span>
    </div>
  );
}

function MetricTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-secondary/50 border border-border/50 px-4 py-3">
      <div className="text-primary/60">{icon}</div>
      <div>
        <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider leading-none">
          {label}
        </p>
        <p className="text-lg font-semibold font-mono text-foreground/90 mt-0.5 leading-none">
          {value}
        </p>
      </div>
    </div>
  );
}
