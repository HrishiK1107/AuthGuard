import { useEffect, useMemo, useState } from "react";
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

import { getLogsV2 } from "../services/logs";
import type { LogEntry } from "../services/logs";

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
   SPARKLINE
========================= */
function Sparkline({ values }: { values: number[] }) {
  const width = 60;
  const height = 16;
  const max = Math.max(...values, 1);

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - (v / max) * height;
    return `${x},${y}`;
  });

  return (
    <svg width={width} height={height}>
      <polyline
        fill="none"
        stroke="#ef4444"
        strokeWidth="2"
        points={points.join(" ")}
      />
    </svg>
  );
}

/* =========================
   LOGS V2
========================= */
export default function LogsV2() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const [entityFilter, setEntityFilter] = useState("");
  const [decisionFilter, setDecisionFilter] =
    useState<"ALL" | LogEntry["decision"]>("ALL");
  const [endpointFilter, setEndpointFilter] = useState("ALL");

  useEffect(() => {
    getLogsV2({ limit: 200 })
      .then((res) => setLogs(res.results))
      .catch((err) => {
        console.error(err);
        setError("Failed to load logs");
      });
  }, []);

  const endpoints = useMemo(
    () => Array.from(new Set(logs.map((l) => l.endpoint))),
    [logs]
  );

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      if (entityFilter && !l.entity.includes(entityFilter)) return false;
      if (decisionFilter !== "ALL" && l.decision !== decisionFilter)
        return false;
      if (endpointFilter !== "ALL" && l.endpoint !== endpointFilter)
        return false;
      return true;
    });
  }, [logs, entityFilter, decisionFilter, endpointFilter]);

  const toggleExpand = (key: string) =>
    setExpandedKey((prev) => (prev === key ? null : key));

  if (error) {
    return <div className="auth-v2-root">{error}</div>;
  }

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
            <span className="auth-pill">LIVE DATA</span>
          </div>
        </div>

        <div className="logs-v2-divider" />

        <h1 className="logs-v2-title">LOGS & EVENTS</h1>

        {/* FILTERS */}
        <div className="flex items-center gap-4 mb-4">
          <input
            className="h-10 w-56 px-4 rounded-md bg-neutral-900 border border-neutral-700 text-sm font-medium text-neutral-200 focus:outline-none"
            placeholder="Filter entity"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
          />

          <div className="relative">
            <select
              className="h-10 w-44 px-4 pr-10 rounded-md bg-neutral-900 border border-neutral-700 text-sm font-medium text-neutral-200 appearance-none focus:outline-none"
              value={decisionFilter}
              onChange={(e) =>
                setDecisionFilter(e.target.value as any)
              }
            >
              <option value="ALL">All decisions</option>
              <option value="ALLOW">ALLOW</option>
              <option value="CHALLENGE">CHALLENGE</option>
              <option value="BLOCK">BLOCK</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
              ▼
            </span>
          </div>

          <div className="relative">
            <select
              className="h-10 w-44 px-4 pr-10 rounded-md bg-neutral-900 border border-neutral-700 text-sm font-medium text-neutral-200 appearance-none focus:outline-none"
              value={endpointFilter}
              onChange={(e) => setEndpointFilter(e.target.value)}
            >
              <option value="ALL">All endpoints</option>
              {endpoints.map((ep) => (
                <option key={ep} value={ep}>
                  {ep}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
              ▼
            </span>
          </div>
        </div>

        {/* TABLE */}
        <div className="auth-card-elevated overflow-y-auto max-h-[65vh]">
          <table className="w-full text-base font-semibold table-fixed">
            <thead className="sticky top-0 z-10 bg-neutral-900 text-neutral-300">
              <tr>
                <th className="p-4 text-left w-[22%]">
                  Timestamp
                </th>
                <th className="p-4 text-left w-[18%]">
                  Entity
                </th>
                <th className="p-4 text-left w-[18%]">
                  Endpoint
                </th>
                <th className="p-4 text-left w-[14%]">
                  Decision
                </th>
                <th className="p-4 text-left w-[12%]">
                  Risk
                </th>
                <th className="p-4 text-left w-[16%]">
                  Trend
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.map((log, i) => {
                const key = `${log.ts}-${i}`;
                const expanded = expandedKey === key;

                const severityColor =
                  log.decision === "BLOCK"
                    ? "bg-red-500"
                    : log.decision === "CHALLENGE"
                    ? "bg-yellow-400"
                    : "bg-green-500";

                return (
                  <>
                    <tr
                      key={key}
                      onClick={() => toggleExpand(key)}
                      className="cursor-pointer border-t border-neutral-800 hover:bg-neutral-800"
                    >
                      <td className="p-4 relative pl-6">
                        <span
                          className={`absolute left-0 top-2 bottom-2 w-1.5 rounded-full ${severityColor}`}
                        />
                        {new Date(
                          log.ts * 1000
                        ).toLocaleString()}
                      </td>
                      <td className="p-4 font-mono">
                        {log.entity}
                      </td>
                      <td className="p-4">
                        {log.endpoint}
                      </td>
                      <td className="p-4">
                        <span
                          className={
                            log.decision === "BLOCK"
                              ? "text-red-400"
                              : log.decision ===
                                "CHALLENGE"
                              ? "text-yellow-400"
                              : "text-green-400"
                          }
                        >
                          {log.decision}
                        </span>
                      </td>
                      <td className="p-4 font-mono">
                        {log.risk.toFixed(2)}
                      </td>
                      <td className="p-4">
                        <Sparkline
                          values={[
                            5,
                            12,
                            30,
                            log.risk,
                          ]}
                        />
                      </td>
                    </tr>

                    {expanded && (
                      <tr className="bg-neutral-950 border-t border-neutral-800">
                        <td
                          colSpan={6}
                          className="px-6 py-5 text-sm"
                        >
                          <div className="grid grid-cols-3 gap-6 font-mono">
                            <div>
                              <div className="text-xs uppercase text-neutral-500 mb-2">
                                Request
                              </div>
                              <div>
                                Entity: {log.entity}
                              </div>
                              <div>
                                Endpoint: {log.endpoint}
                              </div>
                              <div>
                                Time:{" "}
                                {new Date(
                                  log.ts * 1000
                                ).toISOString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs uppercase text-neutral-500 mb-2">
                                Decision
                              </div>
                              <div>
                                Outcome: {log.decision}
                              </div>
                              <div>
                                Risk Score:{" "}
                                {log.risk.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs uppercase text-neutral-500 mb-2">
                                Enforcement
                              </div>
                              <div>
                                Action:{" "}
                                {log.decision ===
                                "BLOCK"
                                  ? "Traffic Blocked"
                                  : log.decision ===
                                    "CHALLENGE"
                                  ? "Additional Verification"
                                  : "Request Allowed"}
                              </div>
                              <div>
                                Policy: Adaptive Auth Guard
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
