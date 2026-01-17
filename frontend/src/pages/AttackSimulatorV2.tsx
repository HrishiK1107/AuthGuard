// frontend/pages/AttackSimulatorV2.tsx

import { useState, useEffect } from "react";
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

  /* --- shared fields (UI only) --- */
  const [username, setUsername] = useState("admin");
  const [ip, setIp] = useState("10.0.0.200");
  const [attempts, setAttempts] = useState("10");
  const [delay, setDelay] = useState("0.5");
  const [userCount, setUserCount] = useState("5");

  /* reset run state when simulator changes */
  useEffect(() => {
    setRunState("idle");
    setErrorMsg(null);
  }, [simulator]);

  const parsedAttempts = Number(attempts);
  const parsedDelay = Number(delay);
  const parsedUserCount = Number(userCount);

  const estimatedDuration =
    simulator === "CREDENTIAL_STUFFING"
      ? (parsedUserCount || 0) * (parsedDelay || 0)
      : (parsedAttempts || 0) * (parsedDelay || 0);

  const canRun =
    acknowledged &&
    username &&
    ip &&
    parsedDelay > 0 &&
    (simulator === "CREDENTIAL_STUFFING"
      ? parsedUserCount > 0
      : parsedAttempts > 0) &&
    runState !== "running";

  /* =========================
     REAL EXECUTION
  ========================= */
  const runSimulation = async () => {
    setRunState("running");
    setErrorMsg(null);

    try {
      if (simulator === "BRUTE_FORCE") {
        await simulateBruteforce({
          username,
          ip,
          attempts: parsedAttempts,
          delay: parsedDelay,
        });
      } else if (simulator === "CREDENTIAL_STUFFING") {
        await simulateCredentialStuffing({
          usernames: Array.from(
            { length: parsedUserCount },
            (_, i) => `user${i + 1}`
          ),
          ip,
          delay: parsedDelay,
        });
      } else if (simulator === "OTP_BOMBING") {
        await simulateOtpBombing({
          username,
          ip,
          attempts: parsedAttempts,
          delay: parsedDelay,
        });
      }

      setRunState("done");

      // auto-reset after success
      setTimeout(() => {
        setRunState("idle");
      }, 2000);
    } catch (err) {
      console.error(err);
      setRunState("error");
      setErrorMsg("Failed to trigger simulation");

      // auto-reset after error
      setTimeout(() => {
        setRunState("idle");
      }, 2000);
    }
  };

  return (
    <div className="auth-v2-root">
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

        <h1 className="logs-v2-title">ATTACK SIMULATOR</h1>
        <p className="text-sm text-neutral-400 mb-6 max-w-3xl">
          Trigger controlled authentication abuse patterns for testing
          detection, risk scoring, and enforcement behavior.
        </p>

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

          {/* CONFIGURATION */}
          <div className="auth-card-elevated xl:col-span-2">
            <div className="auth-card-title mb-4">Configuration</div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">
                  Target Username
                </label>
                <input
                  className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 mb-1 block">
                  Source IP
                </label>
                <input
                  className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                />
              </div>

              {simulator === "CREDENTIAL_STUFFING" ? (
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">
                    User Count
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm"
                    value={userCount}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^\d*$/.test(v)) setUserCount(v);
                    }}
                  />
                </div>
              ) : (
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">
                    Attempts
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm"
                    value={attempts}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^\d*$/.test(v)) setAttempts(v);
                    }}
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-neutral-400 mb-1 block">
                  Delay (seconds)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm"
                  value={delay}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^\d*\.?\d*$/.test(v)) setDelay(v);
                  }}
                />
              </div>
            </div>

            {/* WARNING */}
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
