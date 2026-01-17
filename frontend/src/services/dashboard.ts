import { apiGet } from "./api";

/* =========================
   Dashboard V2 Contract
========================= */

export type DashboardSummary = {
  total_events: number;

  decision_breakdown: {
    ALLOW: number;
    CHALLENGE: number;
    BLOCK: number;
  };

  top_entities: {
    entity: string;
    count: number;
  }[];

  timeline: {
    ts: number; // unix timestamp (seconds)
    ALLOW: number;
    CHALLENGE: number;
    BLOCK: number;
  }[];
};

/* =========================
   Phase 4 Contracts
========================= */

export type RecentThreat = {
  entity: string;
  decision: "ALLOW" | "CHALLENGE" | "BLOCK";
  risk: "LOW" | "MEDIUM" | "HIGH";
  ts: number;
};

export type TopEntity = {
  entity: string;
  count: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
};

export type RiskDistribution = {
  low: number;
  medium: number;
  high: number;
};

export type DecisionTimelinePoint = {
  ts: number;
  entity: string;
  decision: "ALLOW" | "CHALLENGE" | "BLOCK";
  risk: "LOW" | "MEDIUM" | "HIGH";
};

/* =========================
   API
========================= */

export function getDashboardV2() {
  return apiGet<DashboardSummary>("/dashboard");
}

/* =========================
   Phase 4 API Calls
========================= */

export function getRecentThreats() {
  return apiGet<RecentThreat[]>("/dashboard/recent-threats");
}

export function getTopEntitiesV4() {
  return apiGet<TopEntity[]>("/dashboard/top-entities");
}

export function getRiskDistributionV4() {
  return apiGet<RiskDistribution>("/dashboard/risk-distribution-v4");
}

export function getDecisionTimelineV4() {
  return apiGet<DecisionTimelinePoint[]>("/dashboard/decision-timeline");
}
