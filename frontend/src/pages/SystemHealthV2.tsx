import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Radar,
  ListChecks,
  Ban,
  Bug,
  HeartPulse,
  Shield,
  ChevronLeft,
} from "lucide-react";

/* =========================
   SIDEBAR CONFIG
========================= */
const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Logs", icon: FileText },
  { label: "Campaigns", icon: Radar },
  { label: "Detection Rules", icon: ListChecks },
  { label: "Active Blocks", icon: Ban },
  { label: "Attack Simulator", icon: Bug },
  { label: "System Health", icon: HeartPulse },
  { label: "Enforcement Control", icon: Shield },
];

const SYSTEM_STATUS: "healthy" | "degraded" | "down" = "healthy";

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
  const [collapsed, setCollapsed] = useState(false);

  /* -------------------------
     MOCKED DATA (UI ONLY)
  ------------------------- */
  const defenseMode: "MONITOR" | "ACTIVE" = "MONITOR";

  const effectiveness: EffectivenessMetrics = {
    totalEvents: 238,
    mitigationRate: 26.89,
    blocked: 64,
    challenged: 151,
    allowed: 11,
    manualOverrides24h: 0,
    avgLatencyMs: 0,
  };

  const components: ComponentHealth[] = [
    { name: "backend", status: "UP", details: "API responsive" },
    { name: "enforcer", status: "UP", details: "Rate limiter reachable" },
  ];

  return (
    <div className="auth-v2-root">
      {/* SIDEBAR */}
      <aside className={`auth-v2-nav ${collapsed ? "collapsed" : ""}`}>
        <div className="auth-v2-nav-header">
          {!collapsed && (
            <div className="auth-v2-logo-wrap">
              <div className="auth-v2-logo-main">AUTHGUARD</div>
              <div className="auth-v2-logo-sub">Auth Abuse Defense</div>
            </div>
          )}

          <button
            className="auth-v2-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft size={18} className={collapsed ? "rotate" : ""} />
          </button>
        </div>

        <nav className="auth-v2-nav-items">
          {NAV_ITEMS.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className={`auth-v2-nav-item ${
                label === "System Health" ? "active" : ""
              }`}
            >
              <Icon size={22} className="auth-v2-nav-icon" />
              {!collapsed && <span>{label}</span>}
            </div>
          ))}
        </nav>
      </aside>

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
            <span className="auth-pill">RISK: LOW</span>
          </div>
        </div>

        <div className="logs-v2-divider" />

        {/* PAGE TITLE */}
        <h1 className="logs-v2-title">SYSTEM HEALTH & EFFECTIVENESS</h1>
        <p className="text-sm text-neutral-400 mb-2 max-w-3xl">
          Runtime integrity, enforcement safety, and real-world impact of AuthGuard.
        </p>

        {/* TOP METRICS */}
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
            <div className="auth-card-title">Mitigation Rate</div>
            <div className="text-3xl font-semibold mt-1">
              {effectiveness.mitigationRate}%
            </div>
          </div>
        </div>

        {/* COMPONENT HEALTH */}
        <div className="auth-card-elevated mt-3">
          <div className="auth-card-title mb-2">Component Health</div>

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
                  <td className="p-2.5 text-neutral-400">{c.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ENFORCEMENT EFFECTIVENESS */}
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
                <th className="p-2.5 text-left">Manual Overrides (24h)</th>
                <th className="p-2.5 text-left">Avg Latency (ms)</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-t border-neutral-800">
                <td className="p-2.5">{effectiveness.blocked}</td>
                <td className="p-2.5">{effectiveness.challenged}</td>
                <td className="p-2.5">{effectiveness.allowed}</td>
                <td className="p-2.5">{effectiveness.manualOverrides24h}</td>
                <td className="p-2.5">{effectiveness.avgLatencyMs}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
