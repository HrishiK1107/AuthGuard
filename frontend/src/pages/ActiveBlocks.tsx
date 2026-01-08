import { useState } from "react";
import Card from "../components/ui/Card";
import { apiPost } from "../services/api";

export default function ActiveBlocks() {
  const [entity, setEntity] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const blockEntity = async () => {
    setMessage(null);
    setError(null);

    try {
      await apiPost("/blocks/block", { entity });
      setMessage(`Block request sent for ${entity}`);
      setEntity("");
    } catch (e: any) {
      setError("Enforcement service unavailable (port 8081)");
    }
  };

  const unblockEntity = async () => {
    setMessage(null);
    setError(null);

    try {
      await apiPost("/blocks/unblock", { entity });
      setMessage(`Unblock request sent for ${entity}`);
      setEntity("");
    } catch (e: any) {
      setError("Enforcement service unavailable (port 8081)");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Manual Enforcement</h1>
        <p className="text-sm text-neutral-400">
          Direct enforcement actions (requires Go rate limiter).
        </p>
      </div>

      <Card title="Target Entity">
        <input
          value={entity}
          onChange={(e) => setEntity(e.target.value)}
          placeholder="IP address or user ID"
          className="w-full rounded bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm"
        />

        <div className="mt-3 flex gap-3">
          <button
            onClick={blockEntity}
            disabled={!entity}
            className="rounded bg-red-600 px-4 py-2 text-sm hover:bg-red-500 disabled:opacity-50"
          >
            Block
          </button>

          <button
            onClick={unblockEntity}
            disabled={!entity}
            className="rounded bg-green-600 px-4 py-2 text-sm hover:bg-green-500 disabled:opacity-50"
          >
            Unblock
          </button>
        </div>
      </Card>

      {message && (
        <div className="rounded border border-green-700 bg-green-900/20 p-3 text-sm text-green-400">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded border border-yellow-700 bg-yellow-900/20 p-3 text-sm text-yellow-400">
          {error}
        </div>
      )}
    </div>
  );
}
