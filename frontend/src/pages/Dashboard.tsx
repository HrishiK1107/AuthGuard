import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import StatusBadge from "../components/ui/StatusBadge";
import { apiGet } from "../services/api";

/* =========================
   Types
========================= */

type DashboardSummary = {
  total_events: number;
  decision_breakdown: Record<string, number>;
  top_entities: { entity: string; count: number }[];
};

type SettingsResponse = {
  mode: "fail-open" | "fail-closed";
};

type ThreatEvent = {
  entity: string;
  decision: string;
  risk: number;
  endpoint: string;
  timestamp: number;
};

type TimelineRow = {
  hour: string;
  ALLOW: number;
  CHALLENGE: number;
  BLOCK: number;
};

type MetricsResponse = {
  mitigation_rate: {
    blocked_percent: number;
  };
  threat_feed: ThreatEvent[];
  timeline: TimelineRow[];
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
  };
};

type Block = {
  active: boolean;
};

/* =========================
   Dashboard
========================= */

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary>({
    total_events: 0,
    decision_breakdown: {},
    top_entities: [],
  });

  const [defenseMode, setDefenseMode] =
    useState<"MONITOR" | "ACTIVE">("MONITOR");

  const [blockedPercent, setBlockedPercent] =
    useState<number | null>(null);

  const [threats, setThreats] = useState<ThreatEvent[]>([]);
  const [timeline, setTimeline] = useState<TimelineRow[]>([]);
  const [riskDistribution, setRiskDistribution] = useState({
    low: 0,
    medium: 0,
    high: 0,
  });

  const [activeBlocksCount, setActiveBlocksCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboard =
          await apiGet<DashboardSummary>("/dashboard/");
        setSummary(dashboard);

        const settings =
          await apiGet<SettingsResponse>("/settings/");
        setDefenseMode(
          settings.mode === "fail-closed" ? "ACTIVE" : "MONITOR"
        );

        const metrics =
          await apiGet<MetricsResponse>("/dashboard/metrics");

        setBlockedPercent(
          metrics.mitigation_rate.blocked_percent
        );
        setThreats(metrics.threat_feed);
        setTimeline(metrics.timeline);
        setRiskDistribution(metrics.risk_distribution);

        const blocksRes =
          await apiGet<{ blocks: Block[] }>("/blocks/");
        const activeCount = blocksRes.blocks.filter(
          (b) => b.active
        ).length;
        setActiveBlocksCount(activeCount);

        setLastUpdated(Date.now());
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const updatedAgo =
    lastUpdated !== null
      ? `${Math.floor((Date.now() - lastUpdated) / 1000)}s ago`
      : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-sm text-neutral-400">
          Real-time authentication abuse detection · Sliding window
        </p>
        <p className="text-xs text-neutral-500">
          Last updated: {updatedAgo}
        </p>
      </div>

      {/* =========================
         Top Stats
      ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card title="Total Events">
          <span className="text-2xl font-bold">
            {summary.total_events}
          </span>
          <p className="text-xs text-neutral-500 mt-1">
            Last 15 min · sliding window
          </p>
        </Card>

        <Card title="Blocked Events">
          <span className="text-2xl font-bold text-red-500">
            {summary.decision_breakdown["BLOCK"] ?? 0}
          </span>
          <p className="text-xs text-neutral-500 mt-1">
            Enforced decisions
          </p>
        </Card>

        <Card title="Active Blocks">
          <span className="text-2xl font-bold text-red-400">
            {activeBlocksCount}
          </span>
          <p className="text-xs text-neutral-500 mt-1">
            Live enforcement rules
          </p>
        </Card>

        <Card title="Mitigation Rate">
          <span className="text-2xl font-bold text-orange-400">
            {blockedPercent !== null
              ? `${blockedPercent}%`
              : "—"}
          </span>
          <p className="text-xs text-neutral-500 mt-1">
            Blocked + challenged events
          </p>
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
          <p className="text-xs text-neutral-500 mt-1">
            Policy: {defenseMode === "ACTIVE" ? "Fail-Closed" : "Fail-Open"}
          </p>
        </Card>
      </div>

      {/* =========================
         Timeline (Hourly)
      ========================= */}
      <div>
        <h2 className="text-sm font-medium text-neutral-300 mb-2">
          Decision Timeline (Hourly)
        </h2>

        <Table headers={["Hour", "ALLOW", "CHALLENGE", "BLOCK"]}>
          {timeline.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="px-4 py-6 text-center text-neutral-500 italic"
              >
                Waiting for live authentication traffic…
              </td>
            </tr>
          ) : (
            timeline.map((row) => (
              <tr
                key={row.hour}
                className="border-t border-neutral-800 hover:bg-neutral-800"
              >
                <td className="px-4 py-2 font-mono">
                  {row.hour}
                </td>
                <td className="px-4 py-2">
                  <StatusBadge label={String(row.ALLOW)} status="low" />
                </td>
                <td className="px-4 py-2">
                  <StatusBadge label={String(row.CHALLENGE)} status="medium" />
                </td>
                <td className="px-4 py-2">
                  <StatusBadge label={String(row.BLOCK)} status="high" />
                </td>
              </tr>
            ))
          )}
        </Table>
      </div>

      {/* =========================
         Risk Distribution
      ========================= */}
      <div>
        <h2 className="text-sm font-medium text-neutral-300 mb-2">
          Risk Distribution
        </h2>

        <Table headers={["Risk Level", "Events", "Meaning"]}>
          <tr className="border-t border-neutral-800">
            <td className="px-4 py-2 font-mono">LOW</td>
            <td className="px-4 py-2">{riskDistribution.low}</td>
            <td className="px-4 py-2 text-neutral-400">
              Normal background noise
            </td>
          </tr>

          <tr className="border-t border-neutral-800">
            <td className="px-4 py-2 font-mono">MEDIUM</td>
            <td className="px-4 py-2">{riskDistribution.medium}</td>
            <td className="px-4 py-2 text-neutral-400">
              Suspicious patterns
            </td>
          </tr>

          <tr className="border-t border-neutral-800">
            <td className="px-4 py-2 font-mono">HIGH</td>
            <td className="px-4 py-2">{riskDistribution.high}</td>
            <td className="px-4 py-2 text-neutral-400">
              Active abuse
            </td>
          </tr>
        </Table>
      </div>

      {/* =========================
         Threat Feed
      ========================= */}
      <div>
        <h2 className="text-sm font-medium text-neutral-300 mb-2">
          Recent Threats (Risk-Weighted)
        </h2>

        <Table headers={["Time", "Entity", "Endpoint", "Risk", "Decision"]}>
          {threats.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-6 text-center text-neutral-500 italic"
              >
                No active abuse detected
              </td>
            </tr>
          ) : (
            threats.map((t, i) => (
              <tr
                key={i}
                className="border-t border-neutral-800 hover:bg-neutral-800"
              >
                <td className="px-4 py-2">
                  {new Date(t.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-2 font-mono">
                  {t.entity}
                </td>
                <td className="px-4 py-2">
                  {t.endpoint}
                </td>
                <td className="px-4 py-2 font-mono">
                  {t.risk.toFixed(2)}
                </td>
                <td className="px-4 py-2">
                  <StatusBadge label={t.decision} status="high" />
                </td>
              </tr>
            ))
          )}
        </Table>
      </div>

      {/* =========================
         Top Active Entities
      ========================= */}
      <div>
        <h2 className="text-sm font-medium text-neutral-300 mb-2">
          Top Active Entities
        </h2>

        <Table headers={["Entity", "Events"]}>
          {summary.top_entities.length === 0 ? (
            <tr>
              <td
                colSpan={2}
                className="px-4 py-6 text-center text-neutral-500 italic"
              >
                No entities exceeding baseline
              </td>
            </tr>
          ) : (
            summary.top_entities.map((item) => (
              <tr
                key={item.entity}
                className="border-t border-neutral-800 hover:bg-neutral-800"
              >
                <td className="px-4 py-2 font-mono">
                  {item.entity}
                </td>
                <td className="px-4 py-2 text-right font-mono pr-6">
                  {item.count}
                </td>
              </tr>
            ))
          )}
        </Table>
      </div>
    </div>
  );
}
