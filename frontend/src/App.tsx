import { useState, useCallback } from "react";
import { postGuardrail } from "./lib/api";
import { demoCases } from "./lib/demoCases";
import type { GuardrailRequest, GuardrailResponse } from "./lib/types";
import { PayloadEditor } from "./components/PayloadEditor";
import { ResponsePanel } from "./components/ResponsePanel";
import { DemoCases } from "./components/DemoCases";
import { HealthPanel } from "./components/HealthPanel";
import "./App.css";

export function App() {
  const defaultPayload = JSON.stringify(demoCases[0].input, null, 2);
  const [payload, setPayload] = useState(defaultPayload);
  const [response, setResponse] = useState<GuardrailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCase, setActiveCase] = useState<string | null>(demoCases[0].id);
  const [healthKey, setHealthKey] = useState(0);

  const handleSelectCase = useCallback((input: GuardrailRequest) => {
    setPayload(JSON.stringify(input, null, 2));
    setResponse(null);
    setError(null);
    const found = demoCases.find(
      (c) => JSON.stringify(c.input) === JSON.stringify(input)
    );
    setActiveCase(found?.id || null);
  }, []);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const parsed = JSON.parse(payload) as GuardrailRequest;
      const res = await postGuardrail(parsed);
      setResponse(res);
      setHealthKey((k) => k + 1);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [payload]);

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">Citation Guardrail Console</h1>
          <span className="app-subtitle">RAG Post-Processing Engine</span>
        </div>
        <span className="header-badge">v1.0.0</span>
      </header>

      <main className="app-main">
        {/* Left Column */}
        <div className="col-left">
          <DemoCases onSelect={handleSelectCase} activeId={activeCase} />
          <PayloadEditor
            value={payload}
            onChange={(v) => {
              setPayload(v);
              setActiveCase(null);
            }}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        </div>

        {/* Right Column */}
        <div className="col-right">
          <ResponsePanel response={response} />
          <HealthPanel key={healthKey} />
        </div>
      </main>
    </div>
  );
}
