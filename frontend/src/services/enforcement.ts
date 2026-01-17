import { apiGet } from "./api";

/* =========================
   Types
========================= */

export type EnforcementMode = "fail-open" | "fail-closed";

export type ActiveBlock = {
  id: string;
  entity: string;
  scope: string;
  decision: "TEMP_BLOCK" | "HARD_BLOCK";
  risk: number | null;
  ttl_seconds: number;
  source: "auto" | "manual";
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
  return apiGet<{ mode: EnforcementMode }>("/settings");
}
