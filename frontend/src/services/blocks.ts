import { apiGet } from "./api";

/* =========================
   Active Blocks V2 Contract
========================= */

export type ActiveBlock = {
  id: string;
  entity: string;
  decision: string; // e.g. HARD_BLOCK
  risk: number | null;
  active: boolean;
  source: string;
  created_ts: number | null; // unix seconds
  expires_ts: number | null; // unix seconds
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
