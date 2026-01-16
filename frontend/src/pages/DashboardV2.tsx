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
   OPERATOR STATE (SIMULATED)
========================= */
const ACTIVE_BLOCKS = 3; // > 0 => blink
const DEFENSE_MODE: "MONITOR" | "ACTIVE" | "BLOCKING" = "MONITOR";

export default function DashboardV2() {
  const [collapsed, setCollapsed] = useState(false);

  const handleCardClick = (target: string) => {
    console.log(`[INTENT] Navigate to ${target}`);
  };

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
          {NAV_ITEMS.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className={`auth-v2-nav-item ${
                label === "Dashboard" ? "active" : ""
              }`}
              tabIndex={0}
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

            <span className="auth-pill">LAST UPDATED: 17s ago</span>
            <span className="auth-pill">RISK: LOW / HIGH</span>
          </div>
        </div>

        {/* THREAT */}
        <div className="auth-v2-threat">◆ THREAT LEVEL: ELEVATED</div>

        {/* METRICS */}
        <div className="auth-v2-metrics">
          <div
            className="auth-card"
            tabIndex={0}
            data-tooltip="Total authentication events observed"
            onClick={() => handleCardClick("events")}
          >
            <div className="auth-card-title">Total Events</div>
            <div className="auth-card-value">238</div>
            <div className="auth-sparkline">
              <span style={{ height: "40%" }} />
              <span style={{ height: "55%" }} />
              <span style={{ height: "45%" }} />
              <span style={{ height: "70%" }} />
              <span style={{ height: "60%" }} />
            </div>
          </div>

          <div
            className="auth-card"
            tabIndex={0}
            data-tooltip="Authentication attempts blocked by enforcement"
            onClick={() => handleCardClick("blocked-events")}
          >
            <div className="auth-card-title">Blocked Events</div>
            <div className="auth-card-value critical">64</div>
            <div className="auth-sparkline">
              <span style={{ height: "30%" }} />
              <span style={{ height: "45%" }} />
              <span style={{ height: "50%" }} />
              <span style={{ height: "65%" }} />
              <span style={{ height: "70%" }} />
            </div>
          </div>

          {/* ACTIVE BLOCKS — BLINK WHEN > 0 */}
          <div
            className={`auth-card ${
              ACTIVE_BLOCKS > 0 ? "blink-critical" : ""
            }`}
            tabIndex={0}
            data-tooltip="Currently active enforcement blocks"
            onClick={() => handleCardClick("active-blocks")}
          >
            <div className="auth-card-title">Active Blocks</div>
            <div className="auth-card-value critical">
              {ACTIVE_BLOCKS}
            </div>
            <div className="auth-sparkline critical">
              <span style={{ height: "60%" }} />
              <span style={{ height: "60%" }} />
              <span style={{ height: "60%" }} />
              <span style={{ height: "60%" }} />
              <span style={{ height: "60%" }} />
            </div>
          </div>

          <div
            className="auth-card"
            tabIndex={0}
            data-tooltip="Percentage of malicious activity mitigated"
            onClick={() => handleCardClick("mitigation")}
          >
            <div className="auth-card-title">Mitigation Rate</div>
            <div className="auth-card-value warn">26.89%</div>
            <div className="auth-sparkline accent">
              <span style={{ height: "20%" }} />
              <span style={{ height: "35%" }} />
              <span style={{ height: "40%" }} />
              <span style={{ height: "55%" }} />
              <span style={{ height: "60%" }} />
            </div>
          </div>

          {/* DEFENSE MODE — AUTO COLOR */}
          <div
            className={`auth-card defense-${DEFENSE_MODE.toLowerCase()}`}
            tabIndex={0}
            data-tooltip="Current enforcement policy state"
            onClick={() => handleCardClick("enforcement")}
          >
            <div className="auth-card-title">Defense Mode</div>
            <div className="auth-card-value">
              {DEFENSE_MODE}
            </div>
            <div className="auth-sparkline warn">
              <span style={{ height: "50%" }} />
              <span style={{ height: "50%" }} />
              <span style={{ height: "50%" }} />
              <span style={{ height: "50%" }} />
              <span style={{ height: "50%" }} />
            </div>
          </div>
        </div>

        {/* REST UNCHANGED */}
        <div className="auth-v2-grid-2">
          <div className="auth-card-elevated">
            <div className="auth-card-title">Decision Timeline</div>
            <div className="auth-timeline">
              <span className="allow" />
              <span className="allow" />
              <span className="challenge" />
              <span className="block" />
              <span className="block" />
              <span className="allow" />
              <span className="challenge" />
            </div>
          </div>

          <div className="auth-card-elevated">
            <div className="auth-card-title">Recent Threats</div>
            <div className="auth-placeholder">Threat feed placeholder</div>
          </div>
        </div>

        <div className="auth-v2-grid-2">
          <div className="auth-card-elevated">
            <div className="auth-card-title">Risk Distribution</div>
            <div className="auth-bars filled">
              <div style={{ width: "25%" }} />
              <div style={{ width: "45%" }} />
              <div style={{ width: "70%" }} />
            </div>
          </div>

          <div className="auth-card-elevated">
            <div className="auth-card-title">Top Entities</div>
            <div className="auth-placeholder">Graph placeholder</div>
          </div>
        </div>
      </main>
    </div>
  );
}
