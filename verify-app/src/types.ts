export type SourceTier = "official" | "news" | "anecdotal";

export interface ResearcherFinding {
  agentName: "Vera" | "Vox" | "Trace";
  sourceTier: SourceTier;
  answer: string;
  sourceUrl: string;
  recency: string; // e.g. "2024-10-15" or "Unknown"
}

export interface JudgmentResult {
  agreementSummary: string;
  confidenceScore: number; // 0-99, computed as base(tier) + consistencyBonus, capped at 99
  breakdown: { baseScore: number; consistencyBonus: number }; // for optional "show the math" UI
  selectedAnswer: string;
  needsHumanReview: boolean; // true if confidenceScore < 50
}

export interface VerifyResult {
  question: string;
  findings: ResearcherFinding[];
  judgment: JudgmentResult;
  finalAnswer: string;
  trustExplanation: string;
}

export interface AppState {
  currentStep: number;
  question: string;
  isMockConflict: boolean; // Toggle for demo paths
  verifyResult: VerifyResult | null;
}
