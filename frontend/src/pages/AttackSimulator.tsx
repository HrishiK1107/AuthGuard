import { useState } from "react";
import Card from "../components/ui/Card";
import { apiPost } from "../services/api";

type SimulationStatus = "idle" | "running" | "success" | "error";

export default function AttackSimulator() {
  const [status, setStatus] = useState<SimulationStatus>("idle");
  const [message, setMessage] = useState<string>("");

  const runBruteforce = async () => {
    setStatus("running");
    setMessage("Launching brute-force simulation...");

    try {
      const res = await apiPost("/simulate/bruteforce");
      setStatus("success");
      setMessage(`Simulation started: ${res.type}`);
    } catch (err) {
      setStatus("error");
      setMessage("Failed to start simulation");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Attack Simulator</h1>
        <p className="text-sm text-neutral-400">
          Trigger controlled attack simulations to test detection and enforcement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Brute Force */}
        <Card title="Brute Force Attack">
          <button
            onClick={runBruteforce}
            disabled={status === "running"}
            className="mt-2 rounded bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-500 disabled:opacity-50"
          >
            Run Simulation
          </button>
        </Card>

        {/* Credential Stuffing */}
        <Card title="Credential Stuffing">
          <button
            disabled
            className="mt-2 rounded bg-neutral-700 px-4 py-2 text-sm opacity-50 cursor-not-allowed"
          >
            Not wired yet
          </button>
        </Card>

        {/* OTP Bombing */}
        <Card title="OTP Bombing">
          <button
            disabled
            className="mt-2 rounded bg-neutral-700 px-4 py-2 text-sm opacity-50 cursor-not-allowed"
          >
            Not wired yet
          </button>
        </Card>
      </div>

      {/* Status */}
      {status !== "idle" && (
        <div
          className={`rounded border p-3 text-sm ${
            status === "success"
              ? "border-green-700 text-green-400"
              : status === "error"
              ? "border-red-700 text-red-400"
              : "border-neutral-700 text-neutral-300"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
