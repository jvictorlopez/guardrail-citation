import type { GuardrailRequest, GuardrailResponse, HealthResponse } from "./types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function postGuardrail(
  request: GuardrailRequest
): Promise<GuardrailResponse> {
  const res = await fetch(`${BASE_URL}/guardrail`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) {
    throw new Error(`${res.status}: ${await res.text()}`);
  }
  return res.json();
}
