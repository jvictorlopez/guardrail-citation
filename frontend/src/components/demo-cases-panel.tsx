"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { demoCases, demoCaseGroups } from "@/lib/demo-cases";
import { cn } from "@/lib/utils";
import type { DemoCase } from "@/lib/types";

interface DemoCasesPanelProps {
  activeCase: DemoCase | null;
  onSelectCase: (demoCase: DemoCase) => void;
}

export function DemoCasesPanel({
  activeCase,
  onSelectCase,
}: DemoCasesPanelProps) {
  return (
    <Card className="shrink-0">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          <Play className="w-3 h-3" />
          Demo Cases
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {demoCaseGroups.map((group) => {
          const cases = demoCases.filter((c) => c.group === group);
          if (cases.length === 0) return null;

          return (
            <div key={group}>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold mb-1.5 pl-1">
                {group}
              </p>
              <div className="space-y-1">
                {cases.map((demoCase) => {
                  const isActive = activeCase?.id === demoCase.id;
                  return (
                    <motion.button
                      key={demoCase.id}
                      onClick={() => onSelectCase(demoCase)}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left transition-colors",
                        "hover:bg-accent/60",
                        isActive && "bg-accent ring-1 ring-primary/30"
                      )}
                    >
                      <span
                        className={cn(
                          "text-sm font-medium truncate",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {demoCase.name}
                      </span>
                      <StatusBadge
                        status={demoCase.expected.status}
                        size="sm"
                        showIcon={false}
                      />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
