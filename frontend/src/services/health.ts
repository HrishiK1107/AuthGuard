import { apiGet } from "./api";

/* =========================
   System Health V2 Contracts
========================= */

/**
 * GET /dashboard/health
 * Lightweight backend + DB health
 */
export type BackendHealth = {
  status: "ok" | "degraded";
  db?: "reachable" | "unreachable";
  last_event_age_sec?: number | null;
  generated_at?: number;
};

/**
 * GET /dashboard
 * Canonical dashboard summary
 */
export type DashboardSummary = {
  total_events: number;
  decision_breakdown: {
    ALLOW: number;
    CHALLENGE: number;
    BLOCK: number;
  };
};

/**
 * GET /dashboard/metrics
 * Canonical metrics used by Dashboard + Health
 */
export type DashboardMetrics = {
  throughput: {
    total_requests: number;
    last_24h: number;
  };
  mitigation_rate: {
    blocked_percent: number;
  };
  risk_drift?: {
    avg_24h: number;
    avg_all_time: number;
    delta: number;
  };
  generated_at?: number;
};

/* =========================
   API (CANONICAL)
========================= */

/**
 * Backend + DB health
 * GET /dashboard/health
 */
export function getBackendHealth() {
  return apiGet<BackendHealth>("/dashboard/health");
}

/**
 * Dashboard summary (events + decisions)
 * GET /dashboard
 */
export function getDashboardSummary() {
  return apiGet<DashboardSummary>("/dashboard");
}

/**
 * Dashboard metrics (throughput + mitigation)
 * GET /dashboard/metrics
 */
export function getDashboardMetrics() {
  return apiGet<DashboardMetrics>("/dashboard/metrics");
}
