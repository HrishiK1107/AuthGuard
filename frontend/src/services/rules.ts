import { apiGet } from "./api";

/* =========================
   Detection Rules V2 Contract
========================= */

export type DetectionRule = {
  name: string;
  entity: string;
  threshold: number;
  confidence: number;
  decay: string;
  window: string;
  last_triggered: number | null;
  trigger_count: number;
  status: string;
  version: string;
  loaded: boolean;
};

export type RulesResponse = {
  rules: DetectionRule[];
};

/* =========================
   API
========================= */

export function getDetectionRulesV2() {
  return apiGet<RulesResponse>("/rules");
}
