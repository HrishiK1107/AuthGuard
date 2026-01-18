import { apiGet } from "./api";

/* =========================
   TYPES (USED BY DASHBOARDV2)
========================= */

export type DecisionBreakdown = {
  ALLOW: number;
  CHALLENGE: number;
  BLOCK: number;
};

export type DashboardSummary = {
  total_events: number;
  decision_breakdown: DecisionBreakdown;
  top_entities: { entity: string; count: number }[];
  timeline: {
    ts: number;
    ALLOW: number;
    CHALLENGE: number;
    BLOCK: number;
  }[];
};

export type DashboardMetrics = {
  throughput: {
    total_requests: number;
    last_24h: number;
  };
  mitigation_rate: {
    blocked_percent: number;
  };
  risk_drift: {
    avg_24h: number;
    avg_all_time: number;
    delta: number;
  };
  timeline: any[];
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
  };
  top_entities: {
    entity: string;
    risk: number;
  }[];
  threat_feed: any[];
  generated_at: number;
};

export type RecentThreat = {
  entity: string;
  decision: string;
  risk: string;
  ts: number;
};

export type TopEntity = {
  entity: string;
  count: number;
  risk: string;
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
  risk: string;
};

/* =========================
   API — CANONICAL
========================= */

// ORIGINAL (kept)
export function getDashboardSummary() {
  return apiGet<DashboardSummary>("/dashboard/");
}

export function getDashboardMetrics() {
  return apiGet<DashboardMetrics>("/dashboard/metrics");
}

/* =========================
   API — DASHBOARD V2 ALIASES
   (NO LOGIC CHANGE)
========================= */

export function getDashboardV2() {
  return getDashboardSummary();
}

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
  return apiGet<DecisionTimelinePoint[]>(
    "/dashboard/decision-timeline"
  );
}
