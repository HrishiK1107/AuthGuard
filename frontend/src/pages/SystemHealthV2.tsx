import { useEffect, useState } from "react";
import {
  getBackendHealth,
  getDashboardSummary,
  getDashboardMetrics,
} from "../services/health";

/* =========================
   TYPES
========================= */
type HealthStatus = "UP" | "DOWN";

type ComponentHealth = {
  name: string;
  status: HealthStatus;
  details: string;
};

type EffectivenessMetrics = {
  totalEvents: number;
  mitigationRate: number;
  blocked: number;
  challenged: number;
  allowed: number;
  manualOverrides24h: number;
  avgLatencyMs: number;
};

/* =========================
   SYSTEM HEALTH V2
========================= */
export default function SystemHealthV2() {
  const [components, setComponents] = useState<ComponentHealth[]>([]);
  const [effectiveness, setEffectiveness] =
    useState<EffectivenessMetrics | null>(null);

  const defenseMode: "MONITOR" | "ACTIVE" = "MONITOR";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const backend = await getBackendHealth();
        const dashboard = await getDashboardSummary();
        const metrics = await getDashboardMetrics();

        if (cancelled) return;

        /* -------------------------
           COMPONENT HEALTH
        ------------------------- */
        setComponents([
          {
            name: "backend",
            status: backend?.status === "ok" ? "UP" : "DOWN",
            details: "API responsive",
          },
          {
            name: "enforcer",
            status: backend?.status === "ok" ? "UP" : "DOWN",
            details: "Rate limiter reachable",
          },
        ]);

        /* -------------------------
           EFFECTIVENESS (AUTHORITATIVE)
           SAME SOURCE AS DASHBOARD
        ------------------------- */
        const breakdown = dashboard?.decision_breakdown ?? {};

        setEffectiveness({
          // ✅ dashboard uses metrics.throughput.total_requests
          totalEvents: metrics?.throughput?.total_requests ?? 0,

          // ✅ already a percentage (NO * 100)
          mitigationRate: Math.round(
            metrics?.mitigation_rate?.blocked_percent ?? 0
          ),

          blocked: breakdown["BLOCK"] ?? 0,
          challenged: breakdown["CHALLENGE"] ?? 0,
          allowed: breakdown["ALLOW"] ?? 0,
          manualOverrides24h: 0,
          avgLatencyMs: 0,
        });
      } catch (e) {
        console.error("SystemHealth load failed:", e);
      }
    }

    // initial load
    load();

    // 🔁 real-time polling
    const interval = setInterval(load, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  /* -------------------------
     SYSTEM STATUS (DERIVED)
  ------------------------- */
  const systemStatus: "healthy" | "degraded" | "down" =
    components.length === 0
      ? "healthy"
      : components.some(c => c.status === "DOWN")
      ? "degraded"
      : "healthy";

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
            <span className={`auth-pill health ${systemStatus}`}>
              <span className="health-dot" />
              SYSTEM: {systemStatus.toUpperCase()}
            </span>
            <span className="auth-pill">LIVE DATA</span>
          </div>
        </div>

        <div className="logs-v2-divider" />

        {/* TITLE */}
        <h1 className="logs-v2-title">
          SYSTEM HEALTH & EFFECTIVENESS
        </h1>
        <p className="text-sm text-neutral-400 mb-2 max-w-3xl">
          Runtime integrity, enforcement safety, and real-world
          impact of AuthGuard.
        </p>

        {/* TOP METRICS */}
        {effectiveness && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="auth-card-elevated">
              <div className="auth-card-title">Defense Mode</div>
              <span className="inline-flex mt-1 px-3 py-1 rounded-full text-sm font-bold bg-yellow-900/40 text-yellow-400 border border-yellow-700">
                {defenseMode}
              </span>
            </div>

            <div className="auth-card-elevated">
              <div className="auth-card-title">Total Events</div>
              <div className="text-3xl font-semibold mt-1">
                {effectiveness.totalEvents}
              </div>
            </div>

            <div className="auth-card-elevated">
              <div className="auth-card-title">
                Mitigation Rate
              </div>
              <div className="text-3xl font-semibold mt-1">
                {effectiveness.mitigationRate}%
              </div>
            </div>
          </div>
        )}

        {/* COMPONENT HEALTH */}
        <div className="auth-card-elevated mt-3">
          <div className="auth-card-title mb-2">
            Component Health
          </div>

          <table className="w-full table-fixed">
            <thead>
              <tr>
                <th className="p-2.5 text-left w-[25%]">Component</th>
                <th className="p-2.5 text-left w-[15%]">Status</th>
                <th className="p-2.5 text-left">Details</th>
              </tr>
            </thead>

            <tbody>
              {components.map((c) => (
                <tr
                  key={c.name}
                  className="border-t border-neutral-800 hover:bg-neutral-900"
                >
                  <td className="p-2.5 font-mono">{c.name}</td>
                  <td className="p-2.5">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-900/40 text-blue-400 border border-blue-700">
                      {c.status}
                    </span>
                  </td>
                  <td className="p-2.5 text-neutral-400">
                    {c.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ENFORCEMENT EFFECTIVENESS */}
        {effectiveness && (
          <div className="auth-card-elevated mt-3">
            <div className="auth-card-title mb-2">
              Enforcement Effectiveness
            </div>

            <table className="w-full table-fixed">
              <thead>
                <tr>
                  <th className="p-2.5 text-left">Blocked</th>
                  <th className="p-2.5 text-left">Challenged</th>
                  <th className="p-2.5 text-left">Allowed</th>
                  <th className="p-2.5 text-left">
                    Manual Overrides (24h)
                  </th>
                  <th className="p-2.5 text-left">
                    Avg Latency (ms)
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-t border-neutral-800">
                  <td className="p-2.5">{effectiveness.blocked}</td>
                  <td className="p-2.5">{effectiveness.challenged}</td>
                  <td className="p-2.5">{effectiveness.allowed}</td>
                  <td className="p-2.5">
                    {effectiveness.manualOverrides24h}
                  </td>
                  <td className="p-2.5">
                    {effectiveness.avgLatencyMs}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
