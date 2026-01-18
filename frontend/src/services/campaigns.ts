import { apiGet } from "./api";

/* =========================
   Campaigns V2 Contract
========================= */

export type Campaign = {
  campaign_id: string;
  entity: string;
  decision: "ALLOW" | "CHALLENGE" | "BLOCK" | "UNKNOWN";
  risk_score: number;
  signals: string[];
  start_ts: number | null;     // unix seconds
  last_seen_ts: number | null; // unix seconds
};

export type CampaignsResponse = {
  campaigns: Campaign[];
};

/* =========================
   API
========================= */

export function getCampaignsV2() {
  // @router.get("/")
  return apiGet<CampaignsResponse>("/campaigns/");
}
