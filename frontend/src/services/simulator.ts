import { apiPost } from "./api";

/* =========================
   Attack Simulator V2 Contract
========================= */

export type SimulatorResponse = {
  status: string; // "started"
  type: string;   // bruteforce | credential-stuffing | otp-bombing
};

/* =========================
   API
========================= */

export function simulateBruteforce() {
  return apiPost<SimulatorResponse>("/simulate/bruteforce");
}

export function simulateCredentialStuffing() {
  return apiPost<SimulatorResponse>("/simulate/credential-stuffing");
}

export function simulateOtpBombing() {
  return apiPost<SimulatorResponse>("/simulate/otp-bombing");
}
