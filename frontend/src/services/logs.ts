import { apiGet } from "./api";

/* =========================
   Logs V2 Contract
========================= */

export type LogEntry = {
  ts: number; // unix seconds
  entity: string;
  endpoint: string;
  outcome: string;
  decision: "ALLOW" | "CHALLENGE" | "BLOCK";
  risk: number;
  enforcement_allowed: boolean;
  enforcement_reason?: string | null;
};

export type LogsResponse = {
  count: number;
  results: LogEntry[];
};

/* =========================
   API
========================= */

type GetLogsParams = {
  limit?: number;
  decision?: "ALLOW" | "CHALLENGE" | "BLOCK";
  entity?: string;
};

export function getLogsV2(params: GetLogsParams = {}) {
  const search = new URLSearchParams();

  if (params.limit) search.set("limit", String(params.limit));
  if (params.decision) search.set("decision", params.decision);
  if (params.entity) search.set("entity", params.entity);

  const qs = search.toString();
  const path = qs ? `/logs?${qs}` : "/logs";

  return apiGet<LogsResponse>(path);
}
