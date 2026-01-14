import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import Table from "../components/ui/Table";
import EmptyState from "../components/ui/EmptyState";
import { apiGet } from "../services/api";

/* =========================
   Types
========================= */

type HealthStatus = "up" | "down";

type ComponentHealth = {
  name: string;
  status: HealthStatus;
  details?: string;
};

type EffectivenessMetrics = {
  total_events: number;
  mitigated_percent: number;
  blocked: number;
  challenged: number;
  allowed: number;
  manual_overrides_24h: number;
  avg_latency_ms: number;
};

type HealthResponse = {
  mode?: "fail-open" | "fail-closed";
  components?: ComponentHealth[];
  effectiveness?: EffectivenessMetrics;
};

/* =========================
   Helpers
========================= */

function healthBadge(status: HealthStatus) {
  return status === "up"
    ? { label: "UP", status: "active" as const }
    : { label: "DOWN", status: "high" as const };
}

function normalizeHealth(data: HealthResponse) {
  return {
    mode: data.mode ?? "fail-open",
    components: data.components ?? [],
    effectiveness: {
      total_events: data.effectiveness?.total_events ?? 0,
      mitigated_percent: data.effectiveness?.mitigated_percent ?? 0,
      blocked: data.effectiveness?.blocked ?? 0,
      challenged: data.effectiveness?.challenged ?? 0,
      allowed: data.effectiveness?.allowed ?? 0,
      manual_overrides_24h: data.effectiveness?.manual_overrides_24h ?? 0,
      avg_latency_ms: data.effectiveness?.avg_latency_ms ?? 0,
    },
  };
}

/* =========================
   Page
========================= */

export default function SystemHealth() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<HealthResponse>("/health/summary")
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Card title="System Health">Loading system health…</Card>;
  }

  if (!data) {
    return (
      <Card title="System Health">
        <Table headers={["Status"]}>
          <EmptyState message="Health data unavailable" colSpan={1} />
        </Table>
      </Card>
    );
  }

  const health = normalizeHealth(data);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold">System Health & Effectiveness</h1>
        <p className="text-sm text-neutral-400">
          Runtime integrity, enforcement safety, and real-world impact of AuthGuard.
        </p>
      </div>

      {/* System Mode */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Defense Mode">
          <StatusBadge
            label={health.mode === "fail-closed" ? "ACTIVE" : "MONITOR"}
            status={health.mode === "fail-closed" ? "active" : "medium"}
          />
        </Card>

        <Card title="Total Events">
          <span className="text-2xl font-bold">
            {health.effectiveness.total_events}
          </span>
        </Card>

        <Card title="Mitigation Rate">
          <span className="text-2xl font-bold">
            {health.effectiveness.mitigated_percent}%
          </span>
        </Card>
      </div>

      {/* Component Health */}
      <Card title="Component Health">
        <Table headers={["Component", "Status", "Details"]}>
          {health.components.length === 0 ? (
            <EmptyState message="No components reported" colSpan={3} />
          ) : (
            health.components.map((c) => (
              <tr key={c.name} className="border-t border-neutral-800">
                <td className="px-4 py-2">{c.name}</td>
                <td className="px-4 py-2">
                  <StatusBadge {...healthBadge(c.status)} />
                </td>
                <td className="px-4 py-2 text-sm text-neutral-400">
                  {c.details ?? "—"}
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>

      {/* Effectiveness */}
      <Card title="Enforcement Effectiveness">
        <Table
          headers={[
            "Blocked",
            "Challenged",
            "Allowed",
            "Manual Overrides (24h)",
            "Avg Latency (ms)",
          ]}
        >
          <tr className="border-t border-neutral-800">
            <td className="px-4 py-2">{health.effectiveness.blocked}</td>
            <td className="px-4 py-2">{health.effectiveness.challenged}</td>
            <td className="px-4 py-2">{health.effectiveness.allowed}</td>
            <td className="px-4 py-2">
              {health.effectiveness.manual_overrides_24h}
            </td>
            <td className="px-4 py-2">
              {Math.round(health.effectiveness.avg_latency_ms)}
            </td>
          </tr>
        </Table>
      </Card>
    </div>
  );
}
