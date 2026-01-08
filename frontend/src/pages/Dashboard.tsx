import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import { apiGet } from "../services/api";

type DashboardSummary = {
  total_events: number;
  decision_breakdown: Record<string, number>;
  top_entities: { entity: string; count: number }[];
};

type SettingsResponse = {
  mode: "fail-open" | "fail-closed";
};

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary>({
    total_events: 0,
    decision_breakdown: {},
    top_entities: [],
  });

  const [defenseMode, setDefenseMode] = useState<"MONITOR" | "ACTIVE">("MONITOR");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboard = await apiGet<DashboardSummary>("/dashboard/");
        setSummary(dashboard);

        const settings = await apiGet<SettingsResponse>("/settings/");
        setDefenseMode(settings.mode === "fail-closed" ? "ACTIVE" : "MONITOR");
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-sm text-neutral-400">
          Real-time security overview and system status.
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total Events">
          <span className="text-2xl font-bold">
            {summary.total_events}
          </span>
        </Card>

        <Card title="Blocked Events">
          <span className="text-2xl font-bold text-red-500">
            {summary.decision_breakdown["BLOCK"] ?? 0}
          </span>
        </Card>

        <Card title="Defense Mode">
          <span
            className={`text-2xl font-bold ${
              defenseMode === "ACTIVE"
                ? "text-green-500"
                : "text-yellow-400"
            }`}
          >
            {defenseMode}
          </span>
        </Card>
      </div>

      {/* Top entities */}
      <div className="rounded border border-neutral-800 p-4">
        <h2 className="text-sm font-medium text-neutral-300 mb-3">
          Top Active Entities
        </h2>

        <ul className="space-y-2 text-sm">
          {summary.top_entities.map((item) => (
            <li
              key={item.entity}
              className="flex justify-between font-mono"
            >
              <span>{item.entity}</span>
              <span className="text-neutral-400">
                {item.count}
              </span>
            </li>
          ))}

          {summary.top_entities.length === 0 && (
            <li className="text-neutral-500 italic">
              No data
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
