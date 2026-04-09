import { demoCases } from "../lib/demoCases";
import type { GuardrailRequest } from "../lib/types";
import { StatusBadge } from "./StatusBadge";

interface DemoCasesProps {
  onSelect: (payload: GuardrailRequest) => void;
  activeId: string | null;
}

export function DemoCases({ onSelect, activeId }: DemoCasesProps) {
  return (
    <div className="panel">
      <h2 className="panel-title">Demo Cases</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {demoCases.map((c) => (
          <button
            key={c.id}
            className={`demo-case-btn ${activeId === c.id ? "active" : ""}`}
            onClick={() => onSelect(c.input)}
            data-id={c.id}
          >
            <span className="demo-case-label">
              {c.id.replace(/_/g, " ").replace(/^(seed|edge) \d+ /, "")}
            </span>
            <StatusBadge status={c.expected.status} size="sm" />
          </button>
        ))}
      </div>
    </div>
  );
}
