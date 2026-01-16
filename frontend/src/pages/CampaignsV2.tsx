import { useMemo } from "react";
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
   MOCK CAMPAIGN DATA
========================= */
type Campaign = {
  id: string;
  primaryVector: string;
  start: number;
  lastSeen: number;
  events: number;
  entities: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
  decisions: {
    allow: number;
    challenge: number;
    block: number;
  };
  state: "ACTIVE" | "COOLING" | "ENDED";
};

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "IP:10.0.0.69",
    primaryVector: "IP",
    start: Date.now() - 120_000,
    lastSeen: Date.now() - 120_000,
    events: 0,
    entities: 1,
    risk: "LOW",
    decisions: { allow: 0, challenge: 0, block: 0 },
    state: "ENDED",
  },
  {
    id: "IP:10.0.0.202",
    primaryVector: "IP",
    start: Date.now() - 90_000,
    lastSeen: Date.now() - 90_000,
    events: 0,
    entities: 1,
    risk: "LOW",
    decisions: { allow: 0, challenge: 0, block: 0 },
    state: "ENDED",
  },
  {
    id: "IP:10.0.0.203",
    primaryVector: "IP",
    start: Date.now() - 150_000,
    lastSeen: Date.now() - 150_000,
    events: 0,
    entities: 1,
    risk: "LOW",
    decisions: { allow: 0, challenge: 0, block: 0 },
    state: "ENDED",
  },
];

/* =========================
   HELPERS
========================= */
function formatTs(ts: number) {
  return new Date(ts).toLocaleString();
}

function riskColor(risk: Campaign["risk"]) {
  if (risk === "HIGH") return "text-red-400";
  if (risk === "MEDIUM") return "text-yellow-400";
  return "text-green-400";
}

function stateBadge(state: Campaign["state"]) {
  if (state === "ACTIVE")
    return "bg-green-900/40 text-green-400 border border-green-700";
  if (state === "COOLING")
    return "bg-yellow-900/40 text-yellow-400 border border-yellow-700";
  return "bg-neutral-900 text-neutral-300 border border-neutral-700";
}

/* =========================
   CAMPAIGNS V2
========================= */
export default function CampaignsV2() {
  const campaigns = useMemo(() => MOCK_CAMPAIGNS, []);

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
            <span className="auth-pill">RISK: LOW</span>
          </div>
        </div>

        <div className="logs-v2-divider" />

        {/* PAGE TITLE */}
        <h1 className="logs-v2-title">ATTACK CAMPAIGNS</h1>
        <p className="text-sm text-neutral-400 mb-6 max-w-3xl">
          Correlated authentication abuse patterns across entities and time.
        </p>

        {/* TABLE */}
        <div className="auth-card-elevated overflow-y-auto max-h-[65vh] px-2">
          <table className="w-full table-fixed">
            <thead className="sticky top-0 z-10 bg-neutral-900">
              <tr>
                <th className="p-4 text-left w-[18%]">Campaign ID</th>
                <th className="p-4 text-left w-[10%]">Vector</th>
                <th className="p-4 text-left w-[16%]">Start</th>
                <th className="p-4 text-left w-[16%]">Last Seen</th>
                <th className="p-4 text-left w-[8%]">Events</th>
                <th className="p-4 text-left w-[8%]">Entities</th>
                <th className="p-4 text-left w-[8%]">Risk</th>
                <th className="p-4 text-left w-[10%]">Decisions</th>
                <th className="p-4 text-left w-[6%]">State</th>
              </tr>
            </thead>

            <tbody>
              {campaigns.map((c) => (
                <>
                  <tr
                    key={c.id}
                    className="hover:bg-neutral-800 text-[0.98rem]"
                  >
                    <td className="px-4 py-[18px] font-mono text-sm">
                      {c.id}
                    </td>
                    <td className="px-4 py-[18px]">{c.primaryVector}</td>
                    <td className="px-4 py-[18px]">{formatTs(c.start)}</td>
                    <td className="px-4 py-[18px]">{formatTs(c.lastSeen)}</td>
                    <td className="px-4 py-[18px]">{c.events}</td>
                    <td className="px-4 py-[18px]">{c.entities}</td>
                    <td
                      className={`px-4 py-[18px] font-semibold ${riskColor(
                        c.risk
                      )}`}
                    >
                      {c.risk}
                    </td>
                    <td className="px-4 py-[18px] text-xs font-mono">
                      A:{c.decisions.allow} · C:{c.decisions.challenge} ·
                      B:{c.decisions.block}
                    </td>
                    <td className="px-4 py-[18px]">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold ${stateBadge(
                          c.state
                        )}`}
                      >
                        {c.state}
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={9} className="p-0">
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
