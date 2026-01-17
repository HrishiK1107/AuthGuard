import { useEffect, useMemo, useState } from "react";
import {
  getDashboardV2,
  getRecentThreats,
  getTopEntitiesV4,
  getRiskDistributionV4,
  getDecisionTimelineV4,
} from "../services/dashboard";
import {
  getEnforcementSettings,
  getEnforcerHealth,
} from "../services/enforcement";

import type {
  DashboardSummary,
  RecentThreat,
  TopEntity,
  RiskDistribution,
  DecisionTimelinePoint,
} from "../services/dashboard";

import type { EnforcementMode } from "../services/enforcement";

import DecisionTimelineChart from "../components/charts/DecisionTimelineChart";

export default function DashboardV2() {
  /* =========================
     STATE
  ========================= */
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [recentThreats, setRecentThreats] = useState<RecentThreat[]>([]);
  const [topEntities, setTopEntities] = useState<TopEntity[]>([]);
  const [riskDistribution, setRiskDistribution] =
    useState<RiskDistribution | null>(null);
  const [decisionEvents, setDecisionEvents] =
    useState<DecisionTimelinePoint[]>([]);

  const [mode, setMode] = useState<EnforcementMode>("fail-open");
  const [enforcerUp, setEnforcerUp] = useState<boolean>(false);

  /* =========================
     FETCHES
  ========================= */
  useEffect(() => {
    getDashboardV2()
      .then(setData)
      .catch(() => setError("Failed to load dashboard data"));

    getRecentThreats().then(setRecentThreats);
    getTopEntitiesV4().then(setTopEntities);
    getRiskDistributionV4().then(setRiskDistribution);
    getDecisionTimelineV4().then(setDecisionEvents);

    getEnforcementSettings().then((s) => setMode(s.mode));
    getEnforcerHealth().then((h) => setEnforcerUp(h.status === "up"));
  }, []);

  const isLoading = !data && !error;

  /* =========================
     DERIVED METRICS
  ========================= */
  const blockedEvents = data?.decision_breakdown.BLOCK ?? 0;
  const activeBlocks = blockedEvents;

  const mitigationRate =
    data && data.total_events > 0
      ? Math.round((blockedEvents / data.total_events) * 100)
      : 0;

  const defenseLabel = mode === "fail-closed" ? "ACTIVE" : "MONITOR";
  const systemStatus = enforcerUp ? "healthy" : "degraded";

  /* =========================
     THREAT LEVEL
  ========================= */
  const threatLevel = useMemo(() => {
    if (!riskDistribution) return "LOW";

    const { low, medium, high } = riskDistribution;

    if (high > medium + low) return "CRITICAL";
    if (medium > low) return "ELEVATED";
    return "LOW";
  }, [riskDistribution]);

  /* =========================
     DECISION TIMELINE (15 MIN)
  ========================= */
  const timelineData = useMemo(() => {
    const now = Date.now();
    const cutoff = now - 15 * 60 * 1000;

    const buckets = new Map<
      number,
      { time: string; ALLOW: number; CHALLENGE: number; BLOCK: number }
    >();

    decisionEvents.forEach((e) => {
      if (e.ts < cutoff) return;

      const minute = Math.floor(e.ts / 60000) * 60000;

      if (!buckets.has(minute)) {
        buckets.set(minute, {
          time: new Date(minute).toLocaleTimeString([], {
            minute: "2-digit",
            second: "2-digit",
          }),
          ALLOW: 0,
          CHALLENGE: 0,
          BLOCK: 0,
        });
      }

      buckets.get(minute)![e.decision]++;
    });

    return Array.from(buckets.values());
  }, [decisionEvents]);

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="auth-v2-root">
      <main className="auth-v2-main">
        {error && <div className="auth-error">{error}</div>}
        {isLoading && <div className="auth-loading">Loading dashboard…</div>}

        {!isLoading && !error && data && (
          <>
            {/* TOP BAR */}
            <div className="auth-v2-topbar">
              <div className="auth-v2-title">
                AUTHENTICATION ABUSE DETECTION SYSTEM
              </div>

              <div className="auth-v2-top-right">
                <span className="auth-pill">
                  MODE: {mode.toUpperCase()}
                </span>
                <span className={`auth-pill health ${systemStatus}`}>
                  <span className="health-dot" />
                  SYSTEM: {systemStatus.toUpperCase()}
                </span>
                <span className="auth-pill">LIVE DATA</span>
              </div>
            </div>

            {/* THREAT BANNER */}
            <div
              className={`auth-v2-threat threat-${threatLevel.toLowerCase()}`}
            >
              ◆ THREAT LEVEL: {threatLevel}
            </div>

            {/* METRICS */}
            <div className="auth-v2-metrics">
              <div className="auth-card">
                <div className="auth-card-title">Total Events</div>
                <div className="auth-card-value">
                  {data.total_events}
                </div>
              </div>

              <div className="auth-card">
                <div className="auth-card-title">Blocked Events</div>
                <div className="auth-card-value critical">
                  {blockedEvents}
                </div>
              </div>

              <div
                className={`auth-card ${
                  activeBlocks > 0 ? "blink-critical" : ""
                }`}
              >
                <div className="auth-card-title">Active Blocks</div>
                <div className="auth-card-value critical">
                  {activeBlocks}
                </div>
              </div>

              <div className="auth-card">
                <div className="auth-card-title">Mitigation Rate</div>
                <div className="auth-card-value warn">
                  {mitigationRate}%
                </div>
              </div>

              <div
                className={`auth-card defense-${defenseLabel.toLowerCase()}`}
              >
                <div className="auth-card-title">Defense Mode</div>
                <div className="auth-card-value">
                  {defenseLabel}
                </div>
              </div>
            </div>

            {/* TIMELINE + RECENT */}
            <div className="auth-v2-grid-2">
              <div className="auth-card-elevated">
                <div className="auth-card-title">
                  Decision Timeline (Last 15 min)
                </div>
                <div style={{ height: 220 }}>
                  <DecisionTimelineChart data={timelineData} />
                </div>
              </div>

              <div className="auth-card-elevated">
                <div className="auth-card-title">Recent Threats</div>
                <div className="recent-threats-list">
                  {recentThreats.slice(0, 5).map((t) => (
                    <div
                      key={t.ts}
                      className={`recent-threat-item ${t.risk.toLowerCase()}`}
                    >
                      <span className="rt-entity">{t.entity}</span>
                      <span className="rt-decision">{t.decision}</span>
                      <span className="rt-risk">{t.risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RISK + TOP ENTITIES */}
            <div className="auth-v2-grid-2">
              <div className="auth-card-elevated">
                <div className="auth-card-title">
                  Risk Distribution
                </div>

                {riskDistribution && (
                  <div className="mt-4 flex flex-col gap-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-green-400">LOW</span>
                        <span>{riskDistribution.low}</span>
                      </div>
                      <div className="h-2 w-full bg-neutral-800 rounded">
                        <div
                          className="h-2 rounded bg-green-500"
                          style={{
                            width: `${riskDistribution.low}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-yellow-400">
                          MEDIUM
                        </span>
                        <span>{riskDistribution.medium}</span>
                      </div>
                      <div className="h-2 w-full bg-neutral-800 rounded">
                        <div
                          className="h-2 rounded bg-yellow-500"
                          style={{
                            width: `${riskDistribution.medium}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-red-400">HIGH</span>
                        <span>{riskDistribution.high}</span>
                      </div>
                      <div className="h-2 w-full bg-neutral-800 rounded">
                        <div
                          className="h-2 rounded bg-red-500"
                          style={{
                            width: `${riskDistribution.high}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="auth-card-elevated">
                <div className="auth-card-title">Top Entities</div>
                <div className="recent-threats-list">
                  {topEntities.map((e) => (
                    <div
                      key={e.entity}
                      className={`recent-threat-item ${e.risk.toLowerCase()}`}
                    >
                      <span className="rt-entity">{e.entity}</span>
                      <span className="rt-decision">
                        {e.count} events
                      </span>
                      <span className="rt-risk">{e.risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
