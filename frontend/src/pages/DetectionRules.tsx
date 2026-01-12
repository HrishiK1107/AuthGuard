import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import Table from "../components/ui/Table";
import EmptyState from "../components/ui/EmptyState";
import { apiGet } from "../services/api";

/* =========================
   Types
========================= */

type RuleStatus = "quiet" | "active" | "noisy";

type DetectionRule = {
  name: string;
  entity: string;
  threshold: number;
  confidence: number;
  decay: string;
  window: string;
  last_triggered: number | null;
  trigger_count: number;
  status: RuleStatus;
  version: string;
  loaded: boolean;
};

type RulesResponse = {
  rules: DetectionRule[];
};

/* =========================
   Helpers
========================= */

function statusBadge(status: RuleStatus) {
  switch (status) {
    case "active":
      return { label: "ACTIVE", status: "high" as const };
    case "noisy":
      return { label: "NOISY", status: "medium" as const };
    default:
      return { label: "QUIET", status: "low" as const };
  }
}

/* =========================
   Page
========================= */

export default function DetectionRules() {
  const [rules, setRules] = useState<DetectionRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<RulesResponse>("/rules")
      .then((res) => setRules(res.rules))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Card title="Detection Rules">Loading rules…</Card>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold">Detection Rules</h1>
        <p className="text-sm text-neutral-400">
          Read-only visibility into detection signals, confidence, and runtime behavior.
        </p>
      </div>

      {/* Rules Table */}
      <Card title="Rule Inventory">
        <Table
          headers={[
            "Rule",
            "Entity",
            "Threshold",
            "Confidence",
            "Decay",
            "Window",
            "Triggers",
            "Last Triggered",
            "Status",
            "Version",
            "Loaded",
          ]}
        >
          {rules.length === 0 ? (
            <EmptyState message="No rules loaded" colSpan={11} />
          ) : (
            rules.map((r) => (
              <tr key={r.name} className="border-t border-neutral-800">
                <td className="px-4 py-2 font-mono">{r.name}</td>
                <td className="px-4 py-2">{r.entity}</td>
                <td className="px-4 py-2">{r.threshold}</td>
                <td className="px-4 py-2">{Math.round(r.confidence * 100)}%</td>
                <td className="px-4 py-2">{r.decay}</td>
                <td className="px-4 py-2">{r.window}</td>
                <td className="px-4 py-2">{r.trigger_count}</td>
                <td className="px-4 py-2">
                  {r.last_triggered
                    ? new Date(r.last_triggered * 1000).toLocaleString()
                    : "—"}
                </td>
                <td className="px-4 py-2">
                  <StatusBadge {...statusBadge(r.status)} />
                </td>
                <td className="px-4 py-2 font-mono text-xs">{r.version}</td>
                <td className="px-4 py-2">
                  <StatusBadge
                    label={r.loaded ? "LOADED" : "STALE"}
                    status={r.loaded ? "active" : "medium"}
                  />
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>
    </div>
  );
}
