import { apiGet, apiPost } from "./api";

/* =========================
   Active Blocks V2 Contract
========================= */

export type ActiveBlock = {
  id: string;
  entity: string;
  decision: string;
  risk: number | null;
  active: boolean;
  source: string;
  created_ts: number | null;
  expires_ts: number | null;
};

export type ActiveBlocksResponse = {
  count: number;
  blocks: ActiveBlock[];
};

/* =========================
   API
========================= */

export function getActiveBlocksV2() {
  return apiGet<ActiveBlocksResponse>("/blocks");
}

export function manualBlock(entity: string) {
  return apiPost("/blocks/block", { entity });
}

export function manualUnblock(entity: string) {
  return apiPost("/blocks/unblock", { entity });
}
