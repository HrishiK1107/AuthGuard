// frontend/services/simulator.ts

import { apiPost } from "./api";

/* =========================
   Attack Simulator V2 Contract
========================= */

export type SimulatorResponse = {
  status: string;
  type: string;
};

/* =========================
   Payload Types
========================= */

type BruteforcePayload = {
  username: string;
  ip: string;
  attempts: number;
  delay: number;
};

type CredentialStuffingPayload = {
  usernames: string[];
  ip: string;
  delay: number;
};

type OtpBombingPayload = {
  username: string;
  ip: string;
  attempts: number;
  delay: number;
};

/* =========================
   API
========================= */

export function simulateBruteforce(payload: BruteforcePayload) {
  // @router.post("/bruteforce")
  return apiPost<SimulatorResponse>("/simulate/bruteforce", payload);
}

export function simulateCredentialStuffing(
  payload: CredentialStuffingPayload
) {
  // @router.post("/credential-stuffing")
  return apiPost<SimulatorResponse>(
    "/simulate/credential-stuffing",
    payload
  );
}

export function simulateOtpBombing(payload: OtpBombingPayload) {
  // @router.post("/otp-bombing")
  return apiPost<SimulatorResponse>("/simulate/otp-bombing", payload);
}
