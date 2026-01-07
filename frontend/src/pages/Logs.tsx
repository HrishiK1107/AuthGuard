import { useEffect, useState } from "react";
import Table from "../components/ui/Table";
import StatusBadge from "../components/ui/StatusBadge";
import { apiGet } from "../services/api";

type LogEvent = {
  timestamp: number;
  entity: string;
  endpoint: string;
  decision: string;
};

export default function Logs() {
  const [logs, setLogs] = useState<LogEvent[]>([]);

  useEffect(() => {
  const fetchLogs = () => {
    apiGet<{ count: number; results: LogEvent[] }>("/logs/").then((data) => {
      setLogs(data.results);
    });
  };

  fetchLogs(); // initial load

  const interval = setInterval(fetchLogs, 5000);

  return () => clearInterval(interval);
}, []);


  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Logs & Events</h1>

<div className="flex gap-4 text-sm text-neutral-300">
  <div className="flex items-center gap-2">
    <span className="w-3 h-3 rounded bg-green-600" />
    <span>ALLOW</span>
  </div>

  <div className="flex items-center gap-2">
    <span className="w-3 h-3 rounded bg-yellow-500" />
    <span>CHALLENGE</span>
  </div>

  <div className="flex items-center gap-2">
    <span className="w-3 h-3 rounded bg-red-600" />
    <span>BLOCK</span>
  </div>
</div>

      <Table
        headers={[
          "Timestamp",
          "Entity",
          "Endpoint",
          "Decision",
        ]}
      >
        {logs.length === 0 ? (
          <tr>
            <td
              colSpan={4}
              className="px-4 py-6 text-center text-neutral-500 italic"
            >
              No log data
            </td>
          </tr>
        ) : (
          logs.map((log, i) => (
            <tr
              key={i}
              className="border-t border-neutral-800 hover:bg-neutral-800"
            >
              <td className="px-4 py-2">
                {new Date(log.timestamp).toLocaleString()}
              </td>
              <td className="px-4 py-2">{log.entity}</td>
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
            </tr>
          ))
        )}
      </Table>
    </div>
  );
}
