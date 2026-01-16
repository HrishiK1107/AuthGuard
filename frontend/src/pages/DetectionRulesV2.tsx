// frontend/pages/DetectionRulesV2.tsx

import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
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
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Logs", icon: FileText, path: "/logs" },
  { label: "Campaigns", icon: Radar, path: "/campaigns" },
  { label: "Detection Rules", icon: ListChecks, path: "/rules" },
  { label: "Active Blocks", icon: Ban, path: "/blocks" },
  { label: "Attack Simulator", icon: Bug, path: "/simulator" },
  { label: "System Health", icon: HeartPulse, path: "/health" },
  { label: "Enforcement Control", icon: Shield, path: "/settings" },
];

const SYSTEM_STATUS: "healthy" | "degraded" | "down" = "healthy";

/* =========================
   MOCK RULE DATA
========================= */
type RuleStatus = "QUIET" | "NOISY" | "ACTIVE";

type DetectionRule = {
  name: string;
  entity: string;
  threshold: number;
  confidence: number;
  decay: string;
  window: string;
  triggers: number;
  lastTriggered?: number;
  status: RuleStatus;
  version: string;
  loaded: boolean;
};

const MOCK_RULES: DetectionRule[] = [
  {
    name: "failed_login_velocity",
    entity: "username",
    threshold: 6,
    confidence: 0.82,
    decay: "linear",
    window: "5m",
    triggers: 18,
    lastTriggered: Date.now() - 92_000,
    status: "ACTIVE",
    version: "v2.1",
    loaded: true,
  },
  {
    name: "ip_fan_out",
    entity: "ip",
    threshold: 12,
    confidence: 0.64,
    decay: "exp",
    window: "10m",
    triggers: 4,
    lastTriggered: Date.now() - 420_000,
    status: "NOISY",
    version: "v2.0",
    loaded: true,
  },
  {
    name: "user_fan_in",
    entity: "account",
    threshold: 8,
    confidence: 0.91,
    decay: "linear",
    window: "15m",
    triggers: 0,
    status: "QUIET",
    version: "v1.9",
    loaded: false,
  },
];

/* =========================
   HELPERS
========================= */
function formatTs(ts?: number) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString();
}

function statusPill(status: RuleStatus) {
  if (status === "ACTIVE")
    return "bg-red-900/40 text-red-400 border border-red-700";
  if (status === "NOISY")
    return "bg-yellow-900/40 text-yellow-400 border border-yellow-700";
  return "bg-green-900/40 text-green-400 border border-green-700";
}

function loadedPill(loaded: boolean) {
  return loaded
    ? "bg-blue-900/40 text-blue-400 border border-blue-700"
    : "bg-yellow-900/40 text-yellow-400 border border-yellow-700";
}

/* =========================
   DETECTION RULES V2
========================= */
export default function DetectionRulesV2() {
  const [collapsed, setCollapsed] = useState(false);
  const rules = useMemo(() => MOCK_RULES, []);

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
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft size={18} className={collapsed ? "rotate" : ""} />
          </button>
        </div>

        <nav className="auth-v2-nav-items">
          {NAV_ITEMS.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={label}
              to={path}
              className={({ isActive }) =>
                `auth-v2-nav-item ${isActive ? "active" : ""}`
              }
              tabIndex={0}
            >
              <Icon size={22} className="auth-v2-nav-icon" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
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
        <h1 className="logs-v2-title">DETECTION RULES</h1>
        <p className="text-sm text-neutral-400 mb-6 max-w-3xl">
          Read-only visibility into detection signals, confidence, and runtime behavior.
        </p>

        {/* TABLE */}
        <div className="auth-card-elevated overflow-y-auto max-h-[65vh] px-2">
          <table className="w-full table-fixed">
            <thead className="sticky top-0 z-10 bg-neutral-900">
              <tr>
                <th className="p-4 text-left w-[16%]">Rule</th>
                <th className="p-4 text-left w-[10%]">Entity</th>
                <th className="p-4 text-left w-[8%]">Threshold</th>
                <th className="p-4 text-left w-[8%]">Confidence</th>
                <th className="p-4 text-left w-[8%]">Decay</th>
                <th className="p-4 text-left w-[8%]">Window</th>
                <th className="p-4 text-left w-[8%]">Triggers</th>
                <th className="p-4 text-left w-[14%]">Last Triggered</th>
                <th className="p-4 text-left w-[8%]">Status</th>
                <th className="p-4 text-left w-[6%]">Version</th>
                <th className="p-4 text-left w-[6%]">Loaded</th>
              </tr>
            </thead>

            <tbody>
              {rules.map((r) => (
                <>
                  <tr
                    key={r.name}
                    className="hover:bg-neutral-800 text-[0.98rem]"
                  >
                    <td className="px-4 py-[18px] font-mono text-sm">
                      {r.name}
                    </td>
                    <td className="px-4 py-[18px]">{r.entity}</td>
                    <td className="px-4 py-[18px]">{r.threshold}</td>
                    <td className="px-4 py-[18px]">
                      {Math.round(r.confidence * 100)}%
                    </td>
                    <td className="px-4 py-[18px]">{r.decay}</td>
                    <td className="px-4 py-[18px]">{r.window}</td>
                    <td className="px-4 py-[18px]">{r.triggers}</td>
                    <td className="px-4 py-[18px]">
                      {formatTs(r.lastTriggered)}
                    </td>
                    <td className="px-4 py-[18px]">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold ${statusPill(
                          r.status
                        )}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-[18px] font-mono text-xs">
                      {r.version}
                    </td>
                    <td className="px-4 py-[18px]">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold ${loadedPill(
                          r.loaded
                        )}`}
                      >
                        {r.loaded ? "LOADED" : "STALE"}
                      </span>
                    </td>
                  </tr>

                  {/* SUBTLE ROW SEPARATOR */}
                  <tr>
                    <td colSpan={11} className="p-0">
                      <div className="h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
                    </td>
                  </tr>
                </>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
