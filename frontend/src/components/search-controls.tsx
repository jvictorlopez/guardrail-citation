"use client";

import { motion } from "framer-motion";
import { Settings2, Cpu, Blend } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SearchConfig, SearchStrategy, EmbeddingProvider } from "@/lib/types";

interface SearchControlsProps {
  config: SearchConfig;
  onChange: (config: SearchConfig) => void;
}

export function SearchControls({ config, onChange }: SearchControlsProps) {
  const setStrategy = (strategy: SearchStrategy) =>
    onChange({ ...config, strategy });

  const setProvider = (provider: EmbeddingProvider) =>
    onChange({ ...config, provider });

  const setAlpha = (alpha: number) =>
    onChange({ ...config, alpha });

  const semPct = Math.round(config.alpha * 100);
  const bm25Pct = 100 - semPct;

  return (
    <Card className="shrink-0">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          <Settings2 className="w-3 h-3" />
          Search Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Strategy selector */}
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold mb-1.5 block">
            Strategy
          </label>
          <div className="flex gap-1">
            <SegmentButton
              active={config.strategy === "semantic"}
              onClick={() => setStrategy("semantic")}
              icon={<Cpu className="w-3 h-3" />}
              label="Semantic"
            />
            <SegmentButton
              active={config.strategy === "hybrid"}
              onClick={() => setStrategy("hybrid")}
              icon={<Blend className="w-3 h-3" />}
              label="Hybrid"
            />
          </div>
        </div>

        {/* Provider selector */}
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold mb-1.5 block">
            Embedding Provider
          </label>
          <div className="flex gap-1">
            <SegmentButton
              active={config.provider === "hf"}
              onClick={() => setProvider("hf")}
              label="HuggingFace"
            />
            <SegmentButton
              active={config.provider === "openai"}
              onClick={() => setProvider("openai")}
              label="OpenAI"
            />
          </div>
        </div>

        {/* Alpha slider */}
        <div
          className={cn(
            "transition-opacity duration-200",
            config.strategy === "semantic" && "opacity-40 pointer-events-none"
          )}
        >
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold">
              Alpha (α)
            </label>
            <span className="text-[11px] font-mono text-primary font-semibold tabular-nums">
              {config.alpha.toFixed(2)}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={config.alpha}
            onChange={(e) => setAlpha(parseFloat(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer
              bg-secondary
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3.5
              [&::-webkit-slider-thumb]:h-3.5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-primary
              [&::-webkit-slider-thumb]:shadow-[0_0_8px_oklch(0.65_0.15_250_/_0.3)]
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-shadow
              [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_oklch(0.65_0.15_250_/_0.5)]"
          />

          {/* Live percentage readout */}
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-muted-foreground/50">
              {semPct}% semantic / {bm25Pct}% BM25
            </span>
          </div>

          {/* Helper copy */}
          <p className="text-[10px] text-muted-foreground/40 mt-1 leading-relaxed">
            α controls semantic weight. BM25 weight = 1 − α.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function SegmentButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
        active
          ? "bg-primary/15 text-primary ring-1 ring-primary/30"
          : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </motion.button>
  );
}
