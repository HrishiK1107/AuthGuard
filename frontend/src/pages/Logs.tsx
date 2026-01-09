import { useEffect, useMemo, useState } from "react";
import Table from "../components/ui/Table";
import StatusBadge from "../components/ui/StatusBadge";
import { apiGet } from "../services/api";

/* =========================
   Types
========================= */
type LogEvent = {
  timestamp: number;
  entity: string;
  endpoint: string;
  decision: "ALLOW" | "CHALLENGE" | "BLOCK";
  risk?: number;
};

type BucketKey = "JUST_NOW" | "LAST_5_MIN" | "LAST_15_MIN" | "OLDER";

/* =========================
   Sparkline + Tooltip
========================= */
function Sparkline({ values, log }: { values: number[]; log: LogEvent }) {
  if (values.length < 2) return <span className="text-neutral-500">→</span>;

  const width = 60;
  const height = 16;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / (max - min || 1)) * height;
    return `${x},${y}`;
  });

  const trend =
    values.at(-1)! > values[0]
      ? "up"
      : values.at(-1)! < values[0]
      ? "down"
      : "flat";

  const color =
    trend === "up"
      ? "#ef4444"
      : trend === "down"
      ? "#22c55e"
      : "#a3a3a3";

  return (
    <div className="relative group">
      <svg width={width} height={height}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points.join(" ")}
        />
      </svg>

      <div className="pointer-events-none absolute z-20 hidden group-hover:block left-1/2 -translate-x-1/2 top-6 w-64 rounded border border-neutral-700 bg-neutral-900 p-3 text-xs text-neutral-200 shadow-lg">
        <div className="space-y-1">
          <div className="font-semibold text-neutral-100">
            Entity: {log.entity}
          </div>
          <div>Decision: <span className="font-mono">{log.decision}</span></div>
          <div>Risk: <span className="font-mono">{log.risk?.toFixed(2) ?? "0.00"}</span></div>
          <div>Endpoint: <span className="font-mono">{log.endpoint}</span></div>
          <div>Time: {new Date(log.timestamp).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Logs Page
========================= */
export default function Logs() {
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  /* ---------- Filters ---------- */
  const [entityFilter, setEntityFilter] = useState("");
  const [decisionFilter, setDecisionFilter] =
    useState<"ALL" | LogEvent["decision"]>("ALL");
  const [endpointFilter, setEndpointFilter] = useState<"ALL" | string>("ALL");

  /* ---------- Fetch logs ---------- */
  useEffect(() => {
    const fetchLogs = () => {
      apiGet<{ results: LogEvent[] }>("/logs/")
        .then((d) => setLogs(d.results));
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  /* ---------- Filtering ---------- */
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      if (entityFilter && !l.entity.toLowerCase().includes(entityFilter.toLowerCase()))
        return false;
      if (decisionFilter !== "ALL" && l.decision !== decisionFilter)
        return false;
      if (endpointFilter !== "ALL" && l.endpoint !== endpointFilter)
        return false;
      return true;
    });
  }, [logs, entityFilter, decisionFilter, endpointFilter]);

  /* ---------- CSV Export ---------- */
  const exportCSV = () => {
    const header = ["timestamp", "entity", "endpoint", "decision", "risk"];
    const rows = filteredLogs.map((l) => [
      new Date(l.timestamp).toISOString(),
      l.entity,
      l.endpoint,
      l.decision,
      l.risk ?? 0,
    ]);

    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `authguard-logs-${Date.now()}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  /* ---------- Endpoint list ---------- */
  const endpoints = useMemo(
    () => Array.from(new Set(logs.map((l) => l.endpoint))),
    [logs]
  );

  /* ---------- Risk history ---------- */
  const riskHistory = useMemo(() => {
    const map: Record<string, number[]> = {};
    [...filteredLogs]
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach((l) => {
        map[l.entity] ??= [];
        map[l.entity].push(l.risk ?? 0);
        if (map[l.entity].length > 10) map[l.entity].shift();
      });
    return map;
  }, [filteredLogs]);

  /* ---------- Time buckets ---------- */
  const buckets = useMemo(() => {
    const now = Date.now();
    const b: Record<BucketKey, LogEvent[]> = {
      JUST_NOW: [],
      LAST_5_MIN: [],
      LAST_15_MIN: [],
      OLDER: [],
    };

    for (const l of filteredLogs) {
      const age = (now - l.timestamp) / 1000;
      if (age <= 60) b.JUST_NOW.push(l);
      else if (age <= 300) b.LAST_5_MIN.push(l);
      else if (age <= 900) b.LAST_15_MIN.push(l);
      else b.OLDER.push(l);
    }
    return b;
  }, [filteredLogs]);

  /* ---------- Row renderer ---------- */
  const renderBucket = (title: string, rows: LogEvent[]) => {
    if (!rows.length) return null;

    return (
      <>
        <tr>
          <td colSpan={6} className="px-4 py-2 text-xs font-semibold uppercase bg-neutral-900 text-neutral-400">
            {title}
          </td>
        </tr>

        {rows.map((l, i) => {
          const key = `${l.timestamp}-${i}`;
          const expanded = expandedKey === key;

          return (
            <>
              <tr
                key={key}
                onClick={() => setExpandedKey(expanded ? null : key)}
                className="border-t border-neutral-800 hover:bg-neutral-800 cursor-pointer"
              >
                <td className="px-4 py-2">{new Date(l.timestamp).toLocaleString()}</td>
                <td className="px-4 py-2 font-mono">{l.entity}</td>
                <td className="px-4 py-2">{l.endpoint}</td>
                <td className="px-4 py-2">
                  <StatusBadge
                    label={l.decision}
                    status={
                      l.decision === "BLOCK"
                        ? "high"
                        : l.decision === "CHALLENGE"
                        ? "medium"
                        : "low"
                    }
                  />
                </td>
                <td className="px-4 py-2 font-mono">{l.risk?.toFixed(2) ?? "-"}</td>
                <td className="px-4 py-2">
                  <Sparkline values={riskHistory[l.entity] || []} log={l} />
                </td>
              </tr>

              {expanded && (
                <tr className="bg-neutral-950 border-t border-neutral-800">
                  <td colSpan={6} className="px-6 py-4 text-xs text-neutral-300 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono w-full">
                      <div><span className="text-neutral-500">Entity:</span> {l.entity}</div>
                      <div><span className="text-neutral-500">Endpoint:</span> {l.endpoint}</div>
                      <div><span className="text-neutral-500">Decision:</span> {l.decision}</div>
                      <div><span className="text-neutral-500">Risk:</span> {l.risk?.toFixed(2) ?? "0.00"}</div>
                      <div className="md:col-span-2">
                        <span className="text-neutral-500">Timestamp:</span>{" "}
                        {new Date(l.timestamp).toISOString()}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          );
        })}
      </>
    );
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Logs & Events</h1>
        <button
          onClick={exportCSV}
          className="px-3 py-1 text-sm rounded bg-neutral-800 border border-neutral-700 hover:bg-neutral-700"
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 text-sm">
        <input
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          placeholder="Filter entity"
          className="px-4 py-2 w-64 md:w-72 rounded bg-neutral-900 border border-neutral-700"
        />

        <select
          value={decisionFilter}
          onChange={(e) => setDecisionFilter(e.target.value as any)}
          className="px-3 py-2 rounded bg-neutral-900 border border-neutral-700"
        >
          <option value="ALL">All decisions</option>
          <option value="ALLOW">ALLOW</option>
          <option value="CHALLENGE">CHALLENGE</option>
          <option value="BLOCK">BLOCK</option>
        </select>

        <select
          value={endpointFilter}
          onChange={(e) => setEndpointFilter(e.target.value)}
          className="px-3 py-2 rounded bg-neutral-900 border border-neutral-700"
        >
          <option value="ALL">All endpoints</option>
          {endpoints.map((ep) => (
            <option key={ep} value={ep}>{ep}</option>
          ))}
        </select>
      </div>

      <Table headers={["Timestamp", "Entity", "Endpoint", "Decision", "Risk", "Trend"]}>
        {!filteredLogs.length ? (
          <tr>
            <td colSpan={6} className="px-4 py-6 text-center text-neutral-500 italic">
              No log data
            </td>
          </tr>
        ) : (
          <>
            {renderBucket("Just now", buckets.JUST_NOW)}
            {renderBucket("Last 5 minutes", buckets.LAST_5_MIN)}
            {renderBucket("Last 15 minutes", buckets.LAST_15_MIN)}
            {renderBucket("Older", buckets.OLDER)}
          </>
        )}
      </Table>
    </div>
  );
}
