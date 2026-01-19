import { apiGet } from "./api";

/* =========================
   Types (BACKEND-CANONICAL)
========================= */

export type EnforcementMode = "fail-open" | "fail-closed";

/**
 * Shape returned by backend /blocks
 */
export type ActiveBlock = {
  id: string;
  entity: string;
  decision: "BLOCK" | "HARD_BLOCK";
  risk: number | null;
  active: boolean;
  source: "manual" | "auto" | "unknown";
  created_ts: number | null;
  expires_ts: number | null;
};

export type BlocksResponse = {
  count: number;
  blocks: ActiveBlock[];
};

export type EnforcerHealth = {
  status: "up" | "down";
};

/* =========================
   API
========================= */

export function getActiveBlocks() {
  return apiGet<BlocksResponse>("/blocks");
}

export function getEnforcerHealth() {
  return apiGet<EnforcerHealth>("/blocks/enforcer/health");
}

export function getEnforcementSettings() {
  return apiGet<{ mode: EnforcementMode }>("/settings/");
}
