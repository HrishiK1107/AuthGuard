import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Card from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import Table from "../components/ui/Table";
import EmptyState from "../components/ui/EmptyState";
import { apiGet } from "../services/api";

/* =========================
   Types
========================= */

type SignalContribution = {
  name: string;
  triggered: boolean;
  raw_value: number;
  confidence: number;
  decay_factor: number;
  contribution: number;
  window: string;
};

type RiskBreakdown = {
  base_risk: number;
  signal_risk: number;
  entity_adjustment: number;
  decay_applied: number;
  final_risk: number;
  ceiling_hit: boolean;
};

type EnforcementDetails = {
  action: "ALLOW" | "CHALLENGE" | "TEMP_BLOCK" | "HARD_BLOCK";
  scope: string;
  ttl_seconds: number;
  active: boolean;
  block_id?: string;
};

type DecisionEvent = {
  event_id: string;
  timestamp: number;
  entity: string;
  endpoint: string;
  outcome: string;
  decision: string;
  risk_score: number;
  policy: string;
  fail_mode: string;
  signals: SignalContribution[];
  risk: RiskBreakdown;
  enforcement: EnforcementDetails;
};

/* =========================
   Helpers
========================= */

function decisionToBadge(decision: string) {
  switch (decision) {
    case "ALLOW":
      return { label: "ALLOW", status: "low" as const };
    case "CHALLENGE":
      return { label: "CHALLENGE", status: "medium" as const };
    case "TEMP_BLOCK":
      return { label: "TEMP BLOCK", status: "high" as const };
    case "HARD_BLOCK":
      return { label: "HARD BLOCK", status: "blocked" as const };
    default:
      return { label: decision, status: "medium" as const };
  }
}

/* =========================
   Page
========================= */

export default function DecisionExplorer() {
  const { eventId } = useParams();
  const [data, setData] = useState<DecisionEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;

    apiGet(`/decision/${eventId}`)
      .then((res) => setData(res as DecisionEvent))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return <Card title="Decision Explorer">Loading decision…</Card>;
  }

  if (!data) {
    return (
      <Card title="Decision Explorer">
        <Table headers={["Info"]}>
          <EmptyState message="Decision not found" colSpan={1} />
        </Table>
      </Card>
    );
  }

  const decisionBadge = decisionToBadge(data.decision);
  const enforcementBadge = decisionToBadge(data.enforcement.action);

  return (
    <div className="space-y-6">
      {/* Event Summary */}
      <Card title="Event Summary">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><b>Event ID:</b> {data.event_id}</div>
          <div><b>Timestamp:</b> {new Date(data.timestamp * 1000).toLocaleString()}</div>
          <div><b>Entity:</b> {data.entity}</div>
          <div><b>Endpoint:</b> {data.endpoint}</div>
          <div><b>Outcome:</b> {data.outcome}</div>
          <div className="flex items-center gap-2">
            <b>Decision:</b>
            <StatusBadge {...decisionBadge} />
          </div>
          <div><b>Risk Score:</b> {data.risk_score}</div>
        </div>
      </Card>

      {/* Decision Verdict */}
      <Card title="Decision Verdict">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><b>Policy Matched:</b> {data.policy}</div>
          <div><b>Fail Mode:</b> {data.fail_mode}</div>
        </div>
      </Card>

      {/* Signal Breakdown */}
      <Card title="Signal Breakdown">
        <Table
          headers={[
            "Signal",
            "Triggered",
            "Raw",
            "Confidence",
            "Decay",
            "Contribution",
            "Window",
          ]}
        >
          {data.signals.length === 0 ? (
            <EmptyState message="No signals triggered" colSpan={7} />
          ) : (
            data.signals
              .sort((a, b) => b.contribution - a.contribution)
              .map((s) => (
                <tr key={s.name} className="border-t border-neutral-800">
                  <td className="px-4 py-2">{s.name}</td>
                  <td className="px-4 py-2">{s.triggered ? "Yes" : "No"}</td>
                  <td className="px-4 py-2">{s.raw_value}</td>
                  <td className="px-4 py-2">{Math.round(s.confidence * 100)}%</td>
                  <td className="px-4 py-2">{Math.round(s.decay_factor * 100)}%</td>
                  <td className="px-4 py-2">{s.contribution}</td>
                  <td className="px-4 py-2">{s.window}</td>
                </tr>
              ))
          )}
        </Table>
      </Card>

      {/* Risk Calculation */}
      <Card title="Risk Calculation">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><b>Base Risk:</b> {data.risk.base_risk}</div>
          <div><b>Signal Risk:</b> {data.risk.signal_risk}</div>
          <div><b>Entity Adjustment:</b> {data.risk.entity_adjustment}</div>
          <div><b>Decay Applied:</b> {data.risk.decay_applied}</div>
          <div><b>Final Risk:</b> {data.risk.final_risk}</div>
          <div><b>Ceiling Hit:</b> {data.risk.ceiling_hit ? "Yes" : "No"}</div>
        </div>
      </Card>

      {/* Enforcement Details */}
      <Card title="Enforcement Details">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <b>Action:</b>
            <StatusBadge {...enforcementBadge} />
          </div>
          <div><b>Scope:</b> {data.enforcement.scope}</div>
          <div><b>TTL (seconds):</b> {data.enforcement.ttl_seconds}</div>
          <div><b>Status:</b> {data.enforcement.active ? "Active" : "Expired"}</div>
          {data.enforcement.block_id && (
            <div><b>Block ID:</b> {data.enforcement.block_id}</div>
          )}
        </div>
      </Card>
    </div>
  );
}
