import { useState, useEffect, useCallback } from "react";
import { getHealth } from "../lib/api";
import type { HealthResponse } from "../lib/types";
import { StatusBadge } from "./StatusBadge";

export function HealthPanel() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHealth();
      setHealth(data);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const counters = health?.counters || {};
  const allStatuses = [
    "injected",
    "already_present",
    "skipped_chitchat",
    "skipped_ungrounded",
    "skipped_no_match",
  ];

  return (
    <div className="panel">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 className="panel-title" style={{ margin: 0 }}>
          Health Counters
        </h2>
        <button
          className="refresh-btn"
          onClick={fetchHealth}
          disabled={loading}
          title="Refresh counters"
        >
          {loading ? "..." : "Refresh"}
        </button>
      </div>
      {error && (
        <div style={{ color: "#f87171", fontSize: "0.8rem", marginTop: "8px" }}>
          {error}
        </div>
      )}
      <div className="counters-grid">
        {allStatuses.map((status) => (
          <div key={status} className="counter-item">
            <StatusBadge status={status} size="sm" />
            <span className="counter-value">{counters[status] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
