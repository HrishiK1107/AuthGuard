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
  details: string;
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

/* =========================
   Page
========================= */

export default function SystemHealth() {
  const [loading, setLoading] = useState(true);

  const [mode, setMode] =
    useState<"fail-open" | "fail-closed">("fail-open");

  const [components, setComponents] =
    useState<ComponentHealth[]>([]);

  const [effectiveness, setEffectiveness] =
    useState<EffectivenessMetrics>({
      total_events: 0,
      mitigated_percent: 0,
      blocked: 0,
      challenged: 0,
      allowed: 0,
      manual_overrides_24h: 0,
      avg_latency_ms: 0,
    });

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        /* =========================
           Defense Mode
        ========================= */
        const settings =
          await apiGet<{ mode: "fail-open" | "fail-closed" }>("/settings");
        setMode(settings.mode);

        /* =========================
           Dashboard Summary
        ========================= */
        const dashboard = await apiGet<{
          total_events: number;
          decision_breakdown: Record<string, number>;
        }>("/dashboard/");

        /* =========================
           Metrics
        ========================= */
        const metrics = await apiGet<{
          mitigation_rate: { blocked_percent: number };
        }>("/dashboard/metrics");

        setEffectiveness({
          total_events: dashboard.total_events ?? 0,
          mitigated_percent:
            metrics.mitigation_rate?.blocked_percent ?? 0,
          blocked: dashboard.decision_breakdown?.BLOCK ?? 0,
          challenged: dashboard.decision_breakdown?.CHALLENGE ?? 0,
          allowed: dashboard.decision_breakdown?.ALLOW ?? 0,
          manual_overrides_24h: 0,
          avg_latency_ms: 0,
        });

        /* =========================
           Component Health
        ========================= */
        const comps: ComponentHealth[] = [];

        // Backend
        comps.push({
          name: "backend",
          status: "up",
          details: "API responsive",
        });

        // Enforcer
        try {
          const enforcer =
            await apiGet<{ status: "up" | "down" }>(
              "/blocks/enforcer/health"
            );
          comps.push({
            name: "enforcer",
            status: enforcer.status,
            details:
              enforcer.status === "up"
                ? "Rate limiter reachable"
                : "Rate limiter unreachable",
          });
        } catch {
          comps.push({
            name: "enforcer",
            status: "down",
            details: "Health check failed",
          });
        }

        setComponents(comps);
      } catch (err) {
        console.error("System health fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <Card title="System Health">Loading system health…</Card>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold">
          System Health & Effectiveness
        </h1>
        <p className="text-sm text-neutral-400">
          Runtime integrity, enforcement safety, and real-world impact of AuthGuard.
        </p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Defense Mode">
          <StatusBadge
            label={mode === "fail-closed" ? "ACTIVE" : "MONITOR"}
            status={mode === "fail-closed" ? "active" : "medium"}
          />
        </Card>

        <Card title="Total Events">
          <span className="text-2xl font-bold">
            {effectiveness.total_events}
          </span>
        </Card>

        <Card title="Mitigation Rate">
          <span className="text-2xl font-bold">
            {effectiveness.mitigated_percent}%
          </span>
        </Card>
      </div>

      {/* Component Health */}
      <Card title="Component Health">
        <Table headers={["Component", "Status", "Details"]}>
          {components.length === 0 ? (
            <EmptyState message="No component health reported" colSpan={3} />
          ) : (
            components.map((c) => (
              <tr key={c.name} className="border-t border-neutral-800">
                <td className="px-4 py-2">{c.name}</td>
                <td className="px-4 py-2">
                  <StatusBadge
                    label={c.status.toUpperCase()}
                    status={c.status === "up" ? "active" : "high"}
                  />
                </td>
                <td className="px-4 py-2 text-sm text-neutral-400">
                  {c.details}
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>

      {/* Enforcement Effectiveness */}
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
            <td className="px-4 py-2">{effectiveness.blocked}</td>
            <td className="px-4 py-2">{effectiveness.challenged}</td>
            <td className="px-4 py-2">{effectiveness.allowed}</td>
            <td className="px-4 py-2">
              {effectiveness.manual_overrides_24h}
            </td>
            <td className="px-4 py-2">
              {effectiveness.avg_latency_ms}
            </td>
          </tr>
        </Table>
      </Card>
    </div>
  );
}
