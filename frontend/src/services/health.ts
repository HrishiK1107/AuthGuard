import { apiGet } from "./api";

/* =========================
   System Health V2 Contracts
========================= */

export type BackendHealth = {
  status: string; // ok | degraded
  service?: string;
  version?: string;
};

export type HealthSummary = {
  status: string; // ok | degraded
  db?: string;
  last_event_age_sec?: number | null;
  generated_at?: number;
};

export type DashboardSummary = {
  total_events: number;
  decision_breakdown: Record<string, number>;
};

export type DashboardMetrics = {
  mitigation_rate: {
    blocked_percent: number;
  };
};

/* =========================
   API
========================= */

export function getBackendHealth() {
  return apiGet<BackendHealth>("/health");
}

export function getHealthSummary() {
  return apiGet<HealthSummary>("/health/summary");
}

export function getDashboardSummary() {
  return apiGet<DashboardSummary>("/dashboard");
}

export function getDashboardMetrics() {
  return apiGet<DashboardMetrics>("/dashboard/metrics");
}