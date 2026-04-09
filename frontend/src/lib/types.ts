// ── Backend API types (mirrors app/models.py) ──

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

  // Per-request overrides
  strategy?: "semantic" | "hybrid";
  provider?: "hf" | "openai";
  alpha?: number;
}

export interface ScoreBreakdown {
  semantic_score: number | null;
  bm25_score: number | null;
  hybrid_score: number | null;
  alpha: number | null;
}

export interface CitationDecision {
  status: CitationStatus;
  matched_label: string | null;
  strategy_used: string;
  similarity_score: number | null;
  reason: string;
  provider_used?: string | null;
  score_breakdown?: ScoreBreakdown | null;
}

export interface Metrics {
  latency_ms: number;
  llm_calls: number;
  model_calls: number;
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

// ── Status types ──

export type CitationStatus =
  | "injected"
  | "already_present"
  | "skipped_chitchat"
  | "skipped_ungrounded"
  | "skipped_no_match";

// ── Demo case types ──

export interface DemoCase {
  id: string;
  name: string;
  group: DemoCaseGroup;
  input: GuardrailRequest;
  expected: {
    status: CitationStatus;
    matched_label: string | null;
  };
}

export type DemoCaseGroup =
  | "Inject"
  | "Detect Existing"
  | "Skip Rules"
  | "Edge Cases";

// ── Search config ──

export type SearchStrategy = "semantic" | "hybrid";
export type EmbeddingProvider = "hf" | "openai";

export interface SearchConfig {
  strategy: SearchStrategy;
  provider: EmbeddingProvider;
  alpha: number;
}

// ── Status metadata ──

export interface StatusMeta {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  icon: string;
}
