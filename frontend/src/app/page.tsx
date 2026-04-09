"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { TopBar } from "@/components/top-bar";
import { DemoCasesPanel } from "@/components/demo-cases-panel";
import { SearchControls } from "@/components/search-controls";
import { PayloadEditor } from "@/components/payload-editor";
import { ResponsePanel } from "@/components/response-panel";
import { HealthCountersPanel } from "@/components/health-counters-panel";
import { postGuardrail, checkConnectivity } from "@/lib/api";
import { demoCases } from "@/lib/demo-cases";
import type { GuardrailResponse, DemoCase, SearchConfig } from "@/lib/types";

export default function Home() {
  const [activeCase, setActiveCase] = useState<DemoCase | null>(null);
  const [payload, setPayload] = useState<string>("");
  const [response, setResponse] = useState<GuardrailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [healthRefreshKey, setHealthRefreshKey] = useState(0);
  const [searchConfig, setSearchConfig] = useState<SearchConfig>({
    strategy: "semantic",
    provider: "hf",
    alpha: 0.7,
  });

  // Check backend connectivity on mount
  useEffect(() => {
    checkConnectivity().then(setConnected);
    const interval = setInterval(() => {
      checkConnectivity().then(setConnected);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectCase = useCallback((demoCase: DemoCase) => {
    setActiveCase(demoCase);
    setPayload(JSON.stringify(demoCase.input, null, 2));
    setResponse(null);
    setError(null);
  }, []);

  const handleRun = useCallback(async () => {
    if (!payload.trim()) {
      toast.error("Payload is empty");
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(payload);
    } catch {
      toast.error("Invalid JSON payload");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await postGuardrail(parsed, searchConfig);
      setResponse(result);
      setHealthRefreshKey((k) => k + 1);
      toast.success("Guardrail processed", {
        description: result.citation_decision.status.replace(/_/g, " "),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      toast.error("Request failed", { description: message });
    } finally {
      setLoading(false);
    }
  }, [payload, searchConfig]);

  const handleFormat = useCallback(() => {
    try {
      const parsed = JSON.parse(payload);
      setPayload(JSON.stringify(parsed, null, 2));
      toast.success("JSON formatted");
    } catch {
      toast.error("Cannot format — invalid JSON");
    }
  }, [payload]);

  const handleReset = useCallback(() => {
    setPayload("");
    setResponse(null);
    setError(null);
    setActiveCase(null);
  }, []);

  const handleLoadSample = useCallback(() => {
    const sample = demoCases[0];
    setActiveCase(sample);
    setPayload(JSON.stringify(sample.input, null, 2));
    setResponse(null);
    setError(null);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden ambient-bg">
      <TopBar connected={connected} />

      <main className="flex-1 flex gap-4 p-4 pt-0 overflow-hidden">
        {/* Left Column — Demo Cases + Search Config + Playground */}
        <div className="flex flex-col gap-3 w-[440px] min-w-[400px] overflow-y-auto overflow-x-hidden pr-1">
          <DemoCasesPanel
            activeCase={activeCase}
            onSelectCase={handleSelectCase}
          />
          <SearchControls
            config={searchConfig}
            onChange={setSearchConfig}
          />
          <PayloadEditor
            value={payload}
            onChange={setPayload}
            onRun={handleRun}
            onFormat={handleFormat}
            onReset={handleReset}
            onLoadSample={handleLoadSample}
            loading={loading}
          />
        </div>

        {/* Right Column — Response + Health */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden min-w-0">
          <ResponsePanel
            response={response}
            loading={loading}
            error={error}
          />
          <HealthCountersPanel refreshKey={healthRefreshKey} />
        </div>
      </main>
    </div>
  );
}
