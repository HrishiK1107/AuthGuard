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
   API
========================= */

export function getDashboardV2() {
  return apiGet<DashboardSummary>("/dashboard");
}
