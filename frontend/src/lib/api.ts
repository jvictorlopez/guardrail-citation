import type { GuardrailRequest, GuardrailResponse, HealthResponse, SearchConfig } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function postGuardrail(
  request: GuardrailRequest,
  searchConfig?: SearchConfig
): Promise<GuardrailResponse> {
  const body = {
    ...request,
    ...(searchConfig && {
      strategy: searchConfig.strategy,
      provider: searchConfig.provider,
      alpha: searchConfig.strategy === "hybrid" ? searchConfig.alpha : undefined,
    }),
  };

  const res = await fetch(`${API_URL}/guardrail`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`Guardrail API error (${res.status}): ${text}`);
  }
  return res.json();
}

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_URL}/health`);
  if (!res.ok) {
    throw new Error(`Health API error (${res.status})`);
  }
  return res.json();
}

export async function checkConnectivity(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
