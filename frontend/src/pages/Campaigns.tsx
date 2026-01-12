import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import Table from "../components/ui/Table";
import EmptyState from "../components/ui/EmptyState";
import { apiGet } from "../services/api";

/* =========================
   Types
========================= */

type CampaignState = "active" | "cooling" | "ended";

type CampaignSummary = {
  id: string;
  start_time: number;
  last_seen: number;
  total_events: number;
  entities: number;
  aggregate_risk: number;
  state: CampaignState;
  decisions: {
    allow: number;
    challenge: number;
    block: number;
  };
  primary_vector: string;
};

/* =========================
   Helpers
========================= */

function stateBadge(state: CampaignState) {
  switch (state) {
    case "active":
      return { label: "ACTIVE", status: "high" as const };
    case "cooling":
      return { label: "COOLING", status: "medium" as const };
    default:
      return { label: "ENDED", status: "low" as const };
  }
}

/* =========================
   Page
========================= */

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ campaigns: CampaignSummary[] }>("/campaigns")
      .then((res) => setCampaigns(res.campaigns))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Card title="Campaigns">Loading campaigns…</Card>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold">Attack Campaigns</h1>
        <p className="text-sm text-neutral-400">
          Correlated authentication abuse patterns across entities and time.
        </p>
      </div>

      {/* Campaign Table */}
      <Card title="Campaign Overview">
        <Table
          headers={[
            "Campaign ID",
            "Primary Vector",
            "Start",
            "Last Seen",
            "Events",
            "Entities",
            "Risk",
            "Decisions",
            "State",
          ]}
        >
          {campaigns.length === 0 ? (
            <EmptyState message="No campaigns detected" colSpan={9} />
          ) : (
            campaigns.map((c) => (
              <tr key={c.id} className="border-t border-neutral-800">
                <td className="px-4 py-2 font-mono text-xs">{c.id}</td>
                <td className="px-4 py-2">{c.primary_vector}</td>
                <td className="px-4 py-2">
                  {new Date(c.start_time * 1000).toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  {new Date(c.last_seen * 1000).toLocaleString()}
                </td>
                <td className="px-4 py-2">{c.total_events}</td>
                <td className="px-4 py-2">{c.entities}</td>
                <td className="px-4 py-2">{c.aggregate_risk}</td>
                <td className="px-4 py-2 text-xs">
                  A:{c.decisions.allow} ·
                  C:{c.decisions.challenge} ·
                  B:{c.decisions.block}
                </td>
                <td className="px-4 py-2">
                  <StatusBadge {...stateBadge(c.state)} />
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>
    </div>
  );
}
