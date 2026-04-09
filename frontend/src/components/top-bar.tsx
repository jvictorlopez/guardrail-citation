"use client";

import { Shield, Wifi, WifiOff } from "lucide-react";

interface TopBarProps {
  connected: boolean | null;
}

export function TopBar({ connected }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-border/50">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
          <Shield className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold tracking-tight text-foreground leading-none">
            Citation Guardrail Console
          </h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            RAG Post-Processing Engine
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Connectivity indicator */}
        <div className="flex items-center gap-1.5 text-xs">
          {connected === null ? (
            <span className="text-muted-foreground">Checking...</span>
          ) : connected ? (
            <>
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-red-400" />
              <span className="text-red-400">Disconnected</span>
            </>
          )}
        </div>

        {/* Version badge */}
        <div className="flex items-center px-2 py-0.5 rounded-md bg-secondary text-[11px] font-mono text-muted-foreground">
          v1.0.0
        </div>
      </div>
    </header>
  );
}
