export interface Grounding {
  is_grounded: boolean;
  kb_grounded: boolean;
}

export interface CandidateLink {
  label: string;
  url: string;
  keywords: string[];
  description: string;
}

export interface GuardrailRequest {
  query: string;
  llm_answer: string;
  grounding: Grounding;
  is_chitchat: boolean;
  candidate_links: CandidateLink[];
}

export interface CitationDecision {
  status: string;
  matched_label: string | null;
  strategy_used: string;
  similarity_score: number | null;
  reason: string;
}

export interface Metrics {
  latency_ms: number;
  llm_calls: number;
}

export interface GuardrailResponse {
  final_answer: string;
  citation_decision: CitationDecision;
  metrics: Metrics;
}

export interface HealthResponse {
  status: string;
  counters: Record<string, number>;
}

export interface DemoCase {
  id: string;
  input: GuardrailRequest;
  expected: { status: string; matched_label: string | null };
  _note?: string;
}
