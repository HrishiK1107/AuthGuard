import { useEffect, useMemo, useState } from "react";
import Table from "../components/ui/Table";
import StatusBadge from "../components/ui/StatusBadge";
import { apiGet } from "../services/api";

type LogEvent = {
  timestamp: number;
  entity: string;
  endpoint: string;
  decision: string;
  risk?: number;
};

type BucketKey = "JUST_NOW" | "LAST_5_MIN" | "LAST_15_MIN" | "OLDER";

/* =========================
   Sparkline with Tooltip
========================= */
function Sparkline({
  values,
  log,
}: {
  values: number[];
  log: LogEvent;
}) {
  if (values.length < 2) {
    return <span className="text-neutral-500">→</span>;
  }

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
    values[values.length - 1] > values[0]
      ? "up"
      : values[values.length - 1] < values[0]
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
          <div>
            Decision: <span className="font-mono">{log.decision}</span>
          </div>
          <div>
            Risk:{" "}
            <span className="font-mono">
              {log.risk?.toFixed(2) ?? "0.00"}
            </span>
          </div>
          <div>
            Endpoint: <span className="font-mono">{log.endpoint}</span>
          </div>
          <div>
            Time: {new Date(log.timestamp).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Logs() {
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const [entityFilter, setEntityFilter] = useState("");
  const [decisionFilter, setDecisionFilter] = useState<"ALL" | string>("ALL");
  const [endpointFilter, setEndpointFilter] = useState<"ALL" | string>("ALL");

  useEffect(() => {
    const fetchLogs = () => {
      apiGet<{ count: number; results: LogEvent[] }>("/logs/")
        .then((data) => setLogs(data.results));
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (
        entityFilter &&
        !log.entity.toLowerCase().includes(entityFilter.toLowerCase())
      )
        return false;

      if (decisionFilter !== "ALL" && log.decision !== decisionFilter)
        return false;

      if (endpointFilter !== "ALL" && log.endpoint !== endpointFilter)
        return false;

      return true;
    });
  }, [logs, entityFilter, decisionFilter, endpointFilter]);

  const availableEndpoints = useMemo(() => {
    return Array.from(new Set(logs.map((l) => l.endpoint)));
  }, [logs]);

  const riskHistory = useMemo(() => {
    const map: Record<string, number[]> = {};

    [...filteredLogs]
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach((log) => {
        if (!map[log.entity]) map[log.entity] = [];
        map[log.entity].push(log.risk ?? 0);
        if (map[log.entity].length > 10) map[log.entity].shift();
      });

    return map;
  }, [filteredLogs]);

  /* =========================
     Time buckets (DEFENSIVE)
  ========================= */
  const bucketLogs = (): Record<BucketKey, LogEvent[]> => {
    const now = Date.now();

    const buckets: Record<BucketKey, LogEvent[]> = {
      JUST_NOW: [],
      LAST_5_MIN: [],
      LAST_15_MIN: [],
      OLDER: [],
    };

    for (const log of filteredLogs) {
      // Clamp future timestamps
      const safeTs = Math.min(log.timestamp, now);
      const ageSec = (now - safeTs) / 1000;

      if (ageSec <= 60) buckets.JUST_NOW.push(log);
      else if (ageSec <= 300) buckets.LAST_5_MIN.push(log);
      else if (ageSec <= 900) buckets.LAST_15_MIN.push(log);
      else buckets.OLDER.push(log);
    }

    return buckets;
  };

  const buckets = bucketLogs();

  const toggleExpand = (key: string) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  const renderBucket = (title: string, rows: LogEvent[]) => {
    if (rows.length === 0) return null;

    return (
      <>
        <tr>
          <td
            colSpan={6}
            className="px-4 py-2 text-xs font-semibold uppercase text-neutral-400 bg-neutral-900"
          >
            {title}
          </td>
        </tr>

        {rows.map((log, i) => {
          const key = `${log.timestamp}-${i}`;
          const expanded = expandedKey === key;

          return (
            <>
              <tr
                key={key}
                onClick={() => toggleExpand(key)}
                className="border-t border-neutral-800 hover:bg-neutral-800 cursor-pointer"
              >
                <td className="px-4 py-2">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-2 font-mono">{log.entity}</td>
                <td className="px-4 py-2">{log.endpoint}</td>
                <td className="px-4 py-2">
                  <StatusBadge
                    label={log.decision}
                    status={
                      log.decision === "BLOCK"
                        ? "high"
                        : log.decision === "CHALLENGE"
                        ? "medium"
                        : "low"
                    }
                  />
                </td>
                <td className="px-4 py-2 font-mono">
                  {log.risk?.toFixed(2) ?? "-"}
                </td>
                <td className="px-4 py-2">
                  <Sparkline
                    values={riskHistory[log.entity] || []}
                    log={log}
                  />
                </td>
              </tr>

              {expanded && (
                <tr className="bg-neutral-950">
                  <td colSpan={6} className="px-6 py-4 text-xs text-neutral-300">
                    <div className="grid grid-cols-2 gap-3 font-mono">
                      <div>
                        <span className="text-neutral-500">Entity:</span>{" "}
                        {log.entity}
                      </div>
                      <div>
                        <span className="text-neutral-500">Endpoint:</span>{" "}
                        {log.endpoint}
                      </div>
                      <div>
                        <span className="text-neutral-500">Decision:</span>{" "}
                        {log.decision}
                      </div>
                      <div>
                        <span className="text-neutral-500">Risk:</span>{" "}
                        {log.risk?.toFixed(2) ?? "0.00"}
                      </div>
                      <div>
                        <span className="text-neutral-500">Timestamp:</span>{" "}
                        {new Date(log.timestamp).toISOString()}
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

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Logs & Events</h1>

      <div className="flex flex-wrap gap-3 text-sm">
        <input
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          placeholder="Filter entity"
          className="px-3 py-1 rounded bg-neutral-900 border border-neutral-700"
        />

        <select
          value={decisionFilter}
          onChange={(e) => setDecisionFilter(e.target.value)}
          className="px-3 py-1 rounded bg-neutral-900 border border-neutral-700"
        >
          <option value="ALL">All decisions</option>
          <option value="ALLOW">ALLOW</option>
          <option value="CHALLENGE">CHALLENGE</option>
          <option value="BLOCK">BLOCK</option>
        </select>

        <select
          value={endpointFilter}
          onChange={(e) => setEndpointFilter(e.target.value)}
          className="px-3 py-1 rounded bg-neutral-900 border border-neutral-700"
        >
          <option value="ALL">All endpoints</option>
          {availableEndpoints.map((ep) => (
            <option key={ep} value={ep}>
              {ep}
            </option>
          ))}
        </select>
      </div>

      <Table
        headers={[
          "Timestamp",
          "Entity",
          "Endpoint",
          "Decision",
          "Risk",
          "Trend",
        ]}
      >
        {filteredLogs.length === 0 ? (
          <tr>
            <td
              colSpan={6}
              className="px-4 py-6 text-center text-neutral-500 italic"
            >
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
