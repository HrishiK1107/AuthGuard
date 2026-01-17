// frontend/pages/AttackSimulatorV2.tsx

import { useState } from "react";
import {
  simulateBruteforce,
  simulateCredentialStuffing,
  simulateOtpBombing,
} from "../services/simulator";

/* =========================
   TYPES
========================= */
type SimulatorType = "BRUTE_FORCE" | "CREDENTIAL_STUFFING" | "OTP_BOMBING";
type RunState = "idle" | "running" | "done" | "error";

const SYSTEM_STATUS: "healthy" | "degraded" | "down" = "healthy";

/* =========================
   ATTACK SIMULATOR V2
========================= */
export default function AttackSimulatorV2() {
  const [simulator, setSimulator] =
    useState<SimulatorType>("BRUTE_FORCE");
  const [acknowledged, setAcknowledged] = useState(false);
  const [runState, setRunState] = useState<RunState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* --- shared fields (UI only, backend uses defaults for now) --- */
  const [username, setUsername] = useState("admin");
  const [ip, setIp] = useState("10.0.0.200");
  const [attempts, setAttempts] = useState(10);
  const [delay, setDelay] = useState(0.5);
  const [userCount, setUserCount] = useState(5);

  const estimatedDuration =
    simulator === "CREDENTIAL_STUFFING"
      ? userCount * delay
      : attempts * delay;

  const canRun =
    acknowledged &&
    username &&
    ip &&
    attempts > 0 &&
    delay > 0 &&
    runState !== "running";

  /* =========================
     REAL EXECUTION
  ========================= */
  const runSimulation = async () => {
    setRunState("running");
    setErrorMsg(null);

    try {
      if (simulator === "BRUTE_FORCE") {
        await simulateBruteforce();
      } else if (simulator === "CREDENTIAL_STUFFING") {
        await simulateCredentialStuffing();
      } else if (simulator === "OTP_BOMBING") {
        await simulateOtpBombing();
      }

      setRunState("done");
    } catch (err) {
      console.error(err);
      setRunState("error");
      setErrorMsg("Failed to trigger simulation");
    }
  };

  return (
    <div className="auth-v2-root">
      {/* MAIN */}
      <main className="auth-v2-main">
        {/* TOP BAR */}
        <div className="auth-v2-topbar">
          <div className="auth-v2-title">
            AUTHENTICATION ABUSE DETECTION SYSTEM
          </div>
          <div className="auth-v2-top-right">
            <span className="auth-pill">MODE: FAIL-CLOSED</span>
            <span className={`auth-pill health ${SYSTEM_STATUS}`}>
              <span className="health-dot" />
              SYSTEM: {SYSTEM_STATUS.toUpperCase()}
            </span>
            <span className="auth-pill">RISK: LOW</span>
          </div>
        </div>

        <div className="logs-v2-divider" />

        {/* TITLE */}
        <h1 className="logs-v2-title">ATTACK SIMULATOR</h1>
        <p className="text-sm text-neutral-400 mb-6 max-w-3xl">
          Trigger controlled authentication abuse patterns for testing
          detection, risk scoring, and enforcement behavior.
        </p>

        {/* LAYOUT */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* ATTACK TYPE */}
          <div className="auth-card-elevated flex flex-col">
            <div className="auth-card-title mb-4">Attack Type</div>

            <div className="flex flex-col gap-4 flex-1">
              {[
                {
                  key: "BRUTE_FORCE",
                  label: "Brute Force",
                  desc: "Repeated attempts against a single account",
                },
                {
                  key: "CREDENTIAL_STUFFING",
                  label: "Credential Stuffing",
                  desc: "Multiple usernames from one source",
                },
                {
                  key: "OTP_BOMBING",
                  label: "OTP Bombing",
                  desc: "Rapid OTP failures",
                },
              ].map((a) => (
                <div
                  key={a.key}
                  onClick={() =>
                    setSimulator(a.key as SimulatorType)
                  }
                  className={`flex flex-col justify-center rounded-2xl border px-6 py-6 cursor-pointer transition
                    ${
                      simulator === a.key
                        ? "border-yellow-500 bg-neutral-800"
                        : "border-neutral-800 bg-neutral-950 hover:bg-neutral-900"
                    }`}
                  style={{ minHeight: "92px" }}
                >
                  <div className="text-lg font-semibold">
                    {a.label}
                  </div>
                  <div className="text-sm text-neutral-400 mt-1">
                    {a.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CONFIG */}
          <div className="auth-card-elevated xl:col-span-2">
            <div className="auth-card-title">Configuration</div>

            <div className="grid grid-cols-2 gap-4">
              <input
                className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
              />

              <input
                className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="Source IP"
              />

              {simulator === "CREDENTIAL_STUFFING" ? (
                <input
                  type="number"
                  className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm"
                  value={userCount}
                  onChange={(e) =>
                    setUserCount(Number(e.target.value))
                  }
                  placeholder="User count"
                />
              ) : (
                <input
                  type="number"
                  className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm"
                  value={attempts}
                  onChange={(e) =>
                    setAttempts(Number(e.target.value))
                  }
                  placeholder="Attempts"
                />
              )}

              <input
                type="number"
                step="0.1"
                className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm"
                value={delay}
                onChange={(e) =>
                  setDelay(Number(e.target.value))
                }
                placeholder="Delay (sec)"
              />
            </div>

            {/* WARNINGS */}
            <div className="mt-6 border border-yellow-700 bg-yellow-900/20 rounded-lg p-4 text-sm text-yellow-400">
              ⚠ This will inject authentication events into the system.
              <br />
              Use only in controlled environments.
            </div>

            <div className="mt-3 text-sm text-neutral-400">
              Estimated duration:{" "}
              <span className="font-mono">
                {estimatedDuration.toFixed(1)}s
              </span>
            </div>

            {/* ACK */}
            <label className="flex items-center gap-3 mt-4 text-sm">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) =>
                  setAcknowledged(e.target.checked)
                }
              />
              I understand this will generate simulated attack traffic.
            </label>

            {/* ERROR */}
            {runState === "error" && errorMsg && (
              <div className="mt-4 text-sm text-red-400">
                {errorMsg}
              </div>
            )}

            {/* RUN */}
            <div className="mt-6">
              <button
                disabled={!canRun}
                onClick={runSimulation}
                className={`px-6 py-3 rounded font-semibold ${
                  runState === "running"
                    ? "bg-yellow-600"
                    : runState === "done"
                    ? "bg-green-600"
                    : runState === "error"
                    ? "bg-red-700"
                    : "bg-red-600 hover:bg-red-500"
                } disabled:opacity-40`}
              >
                {runState === "idle" && "Run Simulation"}
                {runState === "running" && "Running…"}
                {runState === "done" && "Simulation Triggered"}
                {runState === "error" && "Failed"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
