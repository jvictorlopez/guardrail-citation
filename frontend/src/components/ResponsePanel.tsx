import type { GuardrailResponse } from "../lib/types";
import { StatusBadge } from "./StatusBadge";

interface ResponsePanelProps {
  response: GuardrailResponse | null;
}

export function ResponsePanel({ response }: ResponsePanelProps) {
  if (!response) {
    return (
      <div className="panel" style={{ flex: 1 }}>
        <h2 className="panel-title">Response</h2>
        <div className="empty-state">
          Select a demo case and click <strong>Run Guardrail</strong> to see
          results.
        </div>
      </div>
    );
  }

  const { final_answer, citation_decision, metrics } = response;

  return (
    <div className="panel" style={{ flex: 1 }}>
      <h2 className="panel-title">Response</h2>

      {/* Final Answer */}
      <div className="response-section">
        <label className="field-label">Final Answer</label>
        <div className="final-answer">{final_answer}</div>
      </div>

      {/* Citation Decision */}
      <div className="response-section">
        <label className="field-label">Citation Decision</label>
        <div className="decision-grid">
          <div className="decision-row">
            <span className="decision-key">Status</span>
            <StatusBadge status={citation_decision.status} />
          </div>
          <div className="decision-row">
            <span className="decision-key">Matched Label</span>
            <span className="decision-value">
              {citation_decision.matched_label || "—"}
            </span>
          </div>
          <div className="decision-row">
            <span className="decision-key">Strategy</span>
            <span className="decision-value mono">
              {citation_decision.strategy_used}
            </span>
          </div>
          <div className="decision-row">
            <span className="decision-key">Score</span>
            <span className="decision-value mono">
              {citation_decision.similarity_score != null
                ? citation_decision.similarity_score.toFixed(4)
                : "—"}
            </span>
          </div>
          <div className="decision-row">
            <span className="decision-key">Reason</span>
            <span className="decision-value reason-text">
              {citation_decision.reason}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="response-section">
        <label className="field-label">Metrics</label>
        <div style={{ display: "flex", gap: "24px" }}>
          <div className="metric-box">
            <span className="metric-value">{metrics.latency_ms}</span>
            <span className="metric-label">ms latency</span>
          </div>
          <div className="metric-box">
            <span className="metric-value">{metrics.llm_calls}</span>
            <span className="metric-label">LLM calls</span>
          </div>
        </div>
      </div>
    </div>
  );
}
