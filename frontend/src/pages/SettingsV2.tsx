import { useEffect, useState } from "react";
import StatusBadge from "../components/ui/StatusBadge";
import Table from "../components/ui/Table";
import EmptyState from "../components/ui/EmptyState";

import {
  getActiveBlocks,
  getEnforcerHealth,
  getEnforcementSettings,
} from "../services/enforcement";

import type {
  ActiveBlock,
  EnforcementMode,
} from "../services/enforcement";


const SYSTEM_STATUS: "healthy" | "degraded" | "down" = "healthy";

/* =========================
   HELPERS
========================= */
function modeBadge(mode: EnforcementMode) {
  return mode === "fail-closed"
    ? { label: "ACTIVE", status: "active" as const }
    : { label: "MONITOR", status: "medium" as const };
}

function blockBadge(decision: string) {
  return decision === "HARD_BLOCK"
    ? { label: "HARD", status: "blocked" as const }
    : { label: "TEMP", status: "high" as const };
}

/* =========================
   ENFORCEMENT CONTROL V2
========================= */
export default function EnforcementControlV2() {
  const [mode, setMode] = useState<EnforcementMode>("fail-closed");
  const [blocks, setBlocks] = useState<ActiveBlock[]>([]);
  const [enforcerUp, setEnforcerUp] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      try {
        const [blocksRes, enforcer, settings] =
          await Promise.all([
            getActiveBlocks(),
            getEnforcerHealth(),
            getEnforcementSettings(),
          ]);

        setBlocks(blocksRes.blocks || []);
        setEnforcerUp(enforcer.status === "up");
        setMode(settings.mode);
      } catch (e) {
        console.error(e);
      }
    }

    load();
  }, []);

  const modeStatus = modeBadge(mode);

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
            <span className="auth-pill">LIVE DATA</span>
          </div>
        </div>

        <div className="logs-v2-divider" />

        {/* PAGE TITLE */}
        <h1 className="logs-v2-title">ENFORCEMENT CONTROL</h1>
        <p className="text-sm text-neutral-400 mb-4">
          Live enforcement mode, system health, and active interventions.
        </p>

        {/* TOP METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="auth-card-elevated">
            <div className="auth-card-title">Defense Mode</div>
            <div className="flex items-center justify-between mt-1">
              <StatusBadge {...modeStatus} />
              <button
                disabled
                className="text-xs px-3 py-1 rounded bg-neutral-800 opacity-50 cursor-not-allowed"
              >
                Toggle
              </button>
            </div>
          </div>

          <div className="auth-card-elevated">
            <div className="auth-card-title">Enforcer Status</div>
            <StatusBadge
              label={enforcerUp ? "UP" : "DOWN"}
              status={enforcerUp ? "active" : "high"}
            />
          </div>

          <div className="auth-card-elevated">
            <div className="auth-card-title">Active Blocks</div>
            <div className="text-3xl font-semibold mt-1">
              {blocks.length}
            </div>
          </div>
        </div>

        {/* ACTIVE ENFORCEMENT */}
        <div className="auth-card-elevated mt-4">
          <div className="auth-card-title mb-3">
            Active Enforcement
          </div>

          <Table
            headers={[
              "Entity",
              "Scope",
              "Type",
              "Risk",
              "TTL (s)",
              "Source",
              "Action",
            ]}
          >
            {blocks.length === 0 ? (
              <EmptyState
                message="No active blocks. Enforcement is armed and monitoring."
                colSpan={7}
              />
            ) : (
              blocks.map((b) => (
                <tr
                  key={b.id}
                  className="border-t border-neutral-800"
                >
                  <td className="px-3 py-2">{b.entity}</td>
                  <td className="px-3 py-2">{b.scope}</td>
                  <td className="px-3 py-2">
                    <StatusBadge {...blockBadge(b.decision)} />
                  </td>
                  <td className="px-3 py-2">
                    {b.risk ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    {b.ttl_seconds}
                  </td>
                  <td className="px-3 py-2">
                    {b.source}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      disabled
                      className="text-xs px-3 py-1 rounded bg-red-900 text-red-300 opacity-60 cursor-not-allowed"
                    >
                      Unblock
                    </button>
                  </td>
                </tr>
              ))
            )}
          </Table>
        </div>
      </main>
    </div>
  );
}
