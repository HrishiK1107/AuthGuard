import { useEffect, useState } from "react";
import { getActiveBlocksV2 } from "../services/blocks";
import type { ActiveBlock } from "../services/blocks";

/* =========================
   ACTIVE BLOCKS V2
========================= */
const SYSTEM_STATUS: "healthy" | "degraded" | "down" = "healthy";

function formatTs(ts: number | null) {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleString();
}

export default function ActiveBlocksV2() {
  const [entity, setEntity] = useState("");
  const [blocks, setBlocks] = useState<ActiveBlock[]>([]);
  const [error, setError] = useState<string | null>(null);

  const blockDisabled = entity.trim().length === 0;

  useEffect(() => {
    getActiveBlocksV2()
      .then((res) => setBlocks(res.blocks))
      .catch((err) => {
        console.error(err);
        setError("Failed to load active blocks");
      });
  }, []);

  return (
    <div className="auth-v2-root">
      {/* MAIN */}
      <main className="auth-v2-main">
        {/* TOP BAR */}
        <div className="auth-v2-topbar">
          <div className="auth-v2-title">
            Authentication Abuse Detection System
          </div>

          <div className="auth-v2-top-right">
            <span className="auth-pill">MODE: FAIL-CLOSED</span>
            <span className={`auth-pill health ${SYSTEM_STATUS}`}>
              <span className="health-dot" />
              SYSTEM: {SYSTEM_STATUS.toUpperCase()}
            </span>
            <span className="auth-pill">LIVE DATA</span>
          </div>
        </div>

        <div className="logs-v2-divider" />

        {/* PAGE TITLE */}
        <h1 className="logs-v2-title">ACTIVE BLOCKS</h1>
        <p className="text-sm text-neutral-400 mb-8 max-w-3xl">
          Currently enforced blocks applied at the rate-limiter layer.
          Read-only visibility. Manual actions are handled separately.
        </p>

        {/* ACTIVE BLOCKS TABLE */}
        <div className="auth-card-elevated overflow-y-auto max-h-[45vh] px-2 mb-10">
          {error && (
            <div className="text-sm text-red-400 p-4">{error}</div>
          )}

          {!error && blocks.length === 0 && (
            <div className="text-sm text-neutral-500 p-4">
              No active blocks.
            </div>
          )}

          {blocks.length > 0 && (
            <table className="w-full table-fixed">
              <thead className="sticky top-0 z-10 bg-neutral-900">
                <tr>
                  <th className="p-4 text-left w-[22%]">Entity</th>
                  <th className="p-4 text-left w-[14%]">Decision</th>
                  <th className="p-4 text-left w-[14%]">Source</th>
                  <th className="p-4 text-left w-[25%]">Created</th>
                  <th className="p-4 text-left w-[25%]">Expires</th>
                </tr>
              </thead>

              <tbody>
                {blocks.map((b) => (
                  <tr
                    key={b.id}
                    className="border-t border-neutral-800 hover:bg-neutral-800"
                  >
                    <td className="px-4 py-[18px] font-mono text-sm">
                      {b.entity}
                    </td>
                    <td className="px-4 py-[18px] text-red-400 font-semibold">
                      {b.decision}
                    </td>
                    <td className="px-4 py-[18px]">
                      {b.source}
                    </td>
                    <td className="px-4 py-[18px]">
                      {formatTs(b.created_ts)}
                    </td>
                    <td className="px-4 py-[18px]">
                      {formatTs(b.expires_ts)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* MANUAL ENFORCEMENT */}
        <div className="auth-card-elevated max-w-3xl">
          <div className="auth-card-title">Manual Enforcement</div>

          <input
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
            placeholder="IP address or user ID"
            className="w-full mt-4 h-12 rounded-xl bg-neutral-900 border border-neutral-700 px-4 text-base font-medium text-neutral-200 focus:outline-none focus:border-neutral-500"
          />

          <div className="mt-6 flex gap-4">
            <button
              disabled={blockDisabled}
              className={`h-11 px-6 rounded-xl font-semibold tracking-wide
                ${
                  blockDisabled
                    ? "bg-red-900/40 text-red-300 opacity-40 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-500 text-white"
                }`}
            >
              BLOCK
            </button>

            <button
              disabled={blockDisabled}
              className={`h-11 px-6 rounded-xl font-semibold tracking-wide
                ${
                  blockDisabled
                    ? "bg-green-900/40 text-green-300 opacity-40 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-500 text-white"
                }`}
            >
              UNBLOCK
            </button>
          </div>

          <div className="mt-6 text-xs text-neutral-500 leading-relaxed">
            Actions are sent directly to the Go rate limiter. No confirmation
            or validation is performed at this layer.
          </div>
        </div>
      </main>
    </div>
  );
}
