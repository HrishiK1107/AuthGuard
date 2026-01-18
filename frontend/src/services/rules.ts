import { apiGet, apiPost } from "./api";

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
  // @router.get("/")
  return apiGet<RulesResponse>("/rules/");
}

export function enableRule(ruleName: string) {
  // @router.post("/enable/{rule_name}")
  return apiPost(`/rules/enable/${ruleName}`);
}

export function disableRule(ruleName: string) {
  // @router.post("/disable/{rule_name}")
  return apiPost(`/rules/disable/${ruleName}`);
}

export function updateRuleThreshold(ruleName: string, threshold: number) {
  // @router.post("/threshold/{rule_name}")
  return apiPost(`/rules/threshold/${ruleName}`, { threshold });
}
