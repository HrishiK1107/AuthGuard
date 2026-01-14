import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import Table from "../components/ui/Table";
import EmptyState from "../components/ui/EmptyState";
import { apiGet, apiPost } from "../services/api";

/* =========================
   Types
========================= */

type EnforcementMode = "fail-open" | "fail-closed";

type SettingsResponse = {
  mode: EnforcementMode;
};

type ActiveBlock = {
  id: string;
  entity: string;
  scope: string;
  decision: "TEMP_BLOCK" | "HARD_BLOCK";
  risk: number;
  ttl_seconds: number;
  active: boolean;
  source: "auto" | "manual";
};

/* =========================
   Helpers
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
   Page
========================= */

export default function Settings() {
  const [mode, setMode] = useState<EnforcementMode | null>(null);
  const [blocks, setBlocks] = useState<ActiveBlock[]>([]);
  const [enforcerUp, setEnforcerUp] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  /* =========================
     Fetchers
  ========================= */

  const fetchMode = async () => {
    const res = await apiGet<SettingsResponse>("/settings");
    setMode(res.mode);
  };

  const fetchBlocks = async () => {
    const res = await apiGet<ActiveBlock[]>("/blocks/active");
    setBlocks(res);
  };

  const checkEnforcer = async () => {
    try {
      const res = await apiGet<{ status: "up" | "down" }>(
        "/blocks/enforcer/health"
      );
      setEnforcerUp(res.status === "up");
    } catch {
      setEnforcerUp(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchMode(), fetchBlocks(), checkEnforcer()]).finally(() =>
      setLoading(false)
    );

    const interval = setInterval(() => {
      fetchMode();
      fetchBlocks();
      checkEnforcer();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /* =========================
     Actions
  ========================= */

  const toggleMode = async () => {
    if (!mode) return;

    const next = mode === "fail-open" ? "fail-closed" : "fail-open";
    await apiPost("/settings/mode", {
      mode: next,
      reason: "Operator toggle",
    });
    setMode(next);
  };

  const unblock = async (blockId: string) => {
    await apiPost(`/blocks/${blockId}/unblock`, {
      reason: "Manual override",
    });
    fetchBlocks();
  };

  /* =========================
     Render
  ========================= */

  if (loading || !mode) {
    return <Card title="Enforcement Control">Loading…</Card>;
  }

  const modeStatus = modeBadge(mode);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold">Enforcement Control</h1>
        <p className="text-sm text-neutral-400">
          Live enforcement mode, system health, and active interventions.
        </p>
      </div>

      {/* Global Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Defense Mode">
          <div className="flex items-center justify-between">
            <StatusBadge {...modeStatus} />
            <button
              onClick={toggleMode}
              className="text-xs px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700"
            >
              Toggle
            </button>
          </div>
        </Card>

        <Card title="Enforcer Status">
          <StatusBadge
            label={enforcerUp ? "UP" : "DOWN"}
            status={enforcerUp ? "active" : "high"}
          />
        </Card>

        <Card title="Active Blocks">
          <span className="text-2xl font-bold">{blocks.length}</span>
        </Card>
      </div>

      {/* Active Enforcement */}
      <Card title="Active Enforcement">
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
            <EmptyState message="No active blocks" colSpan={7} />
          ) : (
            blocks.map((b) => (
              <tr key={b.id} className="border-t border-neutral-800">
                <td className="px-4 py-2">{b.entity}</td>
                <td className="px-4 py-2">{b.scope}</td>
                <td className="px-4 py-2">
                  <StatusBadge {...blockBadge(b.decision)} />
                </td>
                <td className="px-4 py-2">{b.risk}</td>
                <td className="px-4 py-2">{b.ttl_seconds}</td>
                <td className="px-4 py-2">{b.source}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => unblock(b.id)}
                    className="text-xs px-3 py-1 rounded bg-red-900 text-red-300 hover:bg-red-800"
                  >
                    Unblock
                  </button>
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>
    </div>
  );
}
