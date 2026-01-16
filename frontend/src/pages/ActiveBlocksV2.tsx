// frontend/pages/ActiveBlocksV2.tsx

import { useState } from "react";
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
   ACTIVE BLOCKS V2
========================= */
export default function ActiveBlocksV2() {
  const [collapsed, setCollapsed] = useState(false);
  const [entity, setEntity] = useState("");

  const blockDisabled = entity.trim().length === 0;

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
            aria-label="Toggle sidebar"
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
        <h1 className="logs-v2-title">MANUAL ENFORCEMENT</h1>
        <p className="text-sm text-neutral-400 mb-8 max-w-3xl">
          Direct operator-issued enforcement actions. This bypasses detection
          logic and applies immediately at the rate-limiter layer.
        </p>

        {/* ENFORCEMENT CARD */}
        <div className="auth-card-elevated max-w-3xl">
          <div className="auth-card-title">Target Entity</div>

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
            Actions are sent directly to the Go rate limiter. No validation or
            confirmation is performed at this layer.
          </div>
        </div>
      </main>
    </div>
  );
}
