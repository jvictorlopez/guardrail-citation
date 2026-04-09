"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Play,
  RotateCcw,
  AlignLeft,
  FileCode,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Lazy load Monaco to avoid SSR issues and reduce initial bundle
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] flex items-center justify-center text-muted-foreground text-xs">
      Loading editor...
    </div>
  ),
});

interface PayloadEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onFormat: () => void;
  onReset: () => void;
  onLoadSample: () => void;
  loading: boolean;
}

export function PayloadEditor({
  value,
  onChange,
  onRun,
  onFormat,
  onReset,
  onLoadSample,
  loading,
}: PayloadEditorProps) {
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Validate JSON on change
  useEffect(() => {
    if (!value.trim()) {
      setJsonError(null);
      return;
    }
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (err) {
      setJsonError(
        err instanceof Error ? err.message : "Invalid JSON"
      );
    }
  }, [value]);

  // Keyboard shortcut: Cmd+Enter to run
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        onRun();
      }
    },
    [onRun]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <CardHeader className="pb-2 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            <FileCode className="w-3 h-3" />
            Request Payload
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onLoadSample}
              title="Load sample"
            >
              <FileCode className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onFormat}
              title="Format JSON"
            >
              <AlignLeft className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onReset}
              title="Reset"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 gap-3">
        {/* Monaco Editor */}
        <div
          className={cn(
            "flex-1 min-h-0 rounded-lg overflow-hidden border",
            jsonError ? "border-red-500/30" : "border-border/50"
          )}
        >
          <MonacoEditor
            height="100%"
            language="json"
            theme="vs-dark"
            value={value}
            onChange={(val) => onChange(val ?? "")}
            options={{
              minimap: { enabled: false },
              fontSize: 12,
              lineNumbers: "off",
              glyphMargin: false,
              folding: true,
              lineDecorationsWidth: 8,
              lineNumbersMinChars: 0,
              scrollBeyondLastLine: false,
              wordWrap: "on",
              tabSize: 2,
              renderLineHighlight: "none",
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              overviewRulerBorder: false,
              scrollbar: {
                vertical: "auto",
                horizontal: "hidden",
                verticalScrollbarSize: 6,
              },
              padding: { top: 8, bottom: 8 },
            }}
          />
        </div>

        {/* JSON validation error */}
        {jsonError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-1.5 text-[11px] text-red-400"
          >
            <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{jsonError}</span>
          </motion.div>
        )}

        {/* Run button */}
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            onClick={onRun}
            disabled={loading || !value.trim() || !!jsonError}
            className={cn(
              "w-full h-9 gap-2 font-semibold text-sm",
              "bg-primary hover:bg-primary/90 text-primary-foreground",
              "shadow-[0_0_15px_oklch(0.65_0.15_250_/_0.15)]",
              "transition-all duration-200"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                Run Guardrail
                <span className="text-[10px] opacity-60 ml-1">
                  {"\u2318"}Enter
                </span>
              </>
            )}
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}
