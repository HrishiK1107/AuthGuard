import { useState } from "react";
import Card from "../components/ui/Card";
import { apiPost } from "../services/api";

type Status = "idle" | "running" | "success" | "error";

export default function AttackSimulator() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const run = async (endpoint: string, label: string) => {
    setStatus("running");
    setMessage(`Running ${label} simulation...`);

    try {
      const res = await apiPost(endpoint);
      setStatus("success");
      setMessage(`Simulation started: ${res.type}`);
    } catch {
      setStatus("error");
      setMessage("Simulation failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Attack Simulator</h1>
        <p className="text-sm text-neutral-400">
          Trigger controlled attack simulations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Brute Force Attack">
          <button
            onClick={() => run("/simulate/bruteforce", "Bruteforce")}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
          >
            Run Simulation
          </button>
        </Card>

        <Card title="Credential Stuffing">
          <button
            onClick={() =>
              run("/simulate/credential-stuffing", "Credential Stuffing")
            }
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
          >
            Run Simulation
          </button>
        </Card>

        <Card title="OTP Bombing">
          <button
            onClick={() => run("/simulate/otp-bombing", "OTP Bombing")}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
          >
            Run Simulation
          </button>
        </Card>
      </div>

      {status !== "idle" && (
        <div
          className={`text-sm ${
            status === "error"
              ? "text-red-400"
              : status === "success"
              ? "text-green-400"
              : "text-yellow-400"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
