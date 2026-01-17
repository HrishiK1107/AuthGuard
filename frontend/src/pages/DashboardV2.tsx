import { useEffect, useMemo, useState } from "react";
import {
  getDashboardV2,
  getRecentThreats,
  getTopEntitiesV4,
  getRiskDistributionV4,
  getDecisionTimelineV4,
} from "../services/dashboard";
import type {
  DashboardSummary,
  RecentThreat,
  TopEntity,
  RiskDistribution,
  DecisionTimelinePoint,
} from "../services/dashboard";

import DecisionTimelineChart from "../components/charts/DecisionTimelineChart";

const SYSTEM_STATUS: "healthy" | "degraded" | "down" = "healthy";

const ACTIVE_BLOCKS = 3;
const DEFENSE_MODE: "MONITOR" | "ACTIVE" | "BLOCKING" = "MONITOR";

export default function DashboardV2() {
  /* =========================
     STATE
  ========================= */
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [recentThreats, setRecentThreats] = useState<RecentThreat[]>([]);
  const [topEntitiesV4, setTopEntitiesV4] = useState<TopEntity[]>([]);
  const [riskDistribution, setRiskDistribution] =
    useState<RiskDistribution | null>(null);
  const [decisionEvents, setDecisionEvents] = useState<
    DecisionTimelinePoint[]
  >([]);

  /* =========================
     FETCHES
  ========================= */
  useEffect(() => {
    getDashboardV2()
      .then(setData)
      .catch(() => setError("Failed to load dashboard data"));
  }, []);

  useEffect(() => {
    getRecentThreats().then(setRecentThreats);
    getTopEntitiesV4().then(setTopEntitiesV4);
    getRiskDistributionV4().then(setRiskDistribution);
    getDecisionTimelineV4().then(setDecisionEvents);
  }, []);

  /* =========================
     DERIVED FLAGS (NO EARLY RETURNS)
  ========================= */
  const isLoading = !data && !error;

  const blockedEvents = data?.decision_breakdown.BLOCK ?? 0;

  /* ======================================================
     DECISION TIMELINE — FRONTEND AGGREGATION (LAST 15 MIN)
  ====================================================== */
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

      const bucket = buckets.get(minute)!;
      bucket[e.decision]++;
    });

    return Array.from(buckets.values()).sort((a, b) =>
      a.time.localeCompare(b.time)
    );
  }, [decisionEvents]);

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="auth-v2-root">
      <main className="auth-v2-main">
        {/* ERROR STATE */}
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {/* LOADING STATE */}
        {isLoading && (
          <div className="auth-loading">
            Loading dashboard…
          </div>
        )}

        {/* MAIN DASHBOARD */}
        {!isLoading && !error && data && (
          <>
            {/* TOP BAR */}
            <div className="auth-v2-topbar">
              <div className="auth-v2-title">
                AUTHENTICATION ABUSE DETECTION SYSTEM
              </div>

              <div className="auth-v2-top-right">
                <span className="auth-pill">MODE: FAIL-CLOSED</span>
                <span className={`auth-pill health ${SYSTEM_STATUS}`}>
                  <span className="health-dot" />
                  SYSTEM: {SYSTEM_STATUS.toUpperCase()}
                </span>
                <span className="auth-pill">LIVE DATA</span>
                <span className="auth-pill">RISK: VARIABLE</span>
              </div>
            </div>

            <div className="auth-v2-threat">◆ THREAT LEVEL: ELEVATED</div>

            {/* METRICS */}
            <div className="auth-v2-metrics">
              <div className="auth-card">
                <div className="auth-card-title">Total Events</div>
                <div className="auth-card-value">{data.total_events}</div>
              </div>

              <div className="auth-card">
                <div className="auth-card-title">Blocked Events</div>
                <div className="auth-card-value critical">
                  {blockedEvents}
                </div>
              </div>

              <div
                className={`auth-card ${
                  ACTIVE_BLOCKS > 0 ? "blink-critical" : ""
                }`}
              >
                <div className="auth-card-title">Active Blocks</div>
                <div className="auth-card-value critical">
                  {ACTIVE_BLOCKS}
                </div>
              </div>

              <div className="auth-card">
                <div className="auth-card-title">Mitigation Rate</div>
                <div className="auth-card-value warn">—</div>
              </div>

              <div className={`auth-card defense-${DEFENSE_MODE.toLowerCase()}`}>
                <div className="auth-card-title">Defense Mode</div>
                <div className="auth-card-value">{DEFENSE_MODE}</div>
              </div>
            </div>

            {/* TIMELINE + RECENT THREATS */}
            <div className="auth-v2-grid-2">
              <div className="auth-card-elevated">
                <div className="auth-card-title">
                  Decision Timeline (Last 15 min)
                </div>
                <DecisionTimelineChart data={timelineData} />
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
                <div className="auth-card-title">Risk Distribution</div>
                {/* existing bar UI untouched */}
              </div>

              <div className="auth-card-elevated">
                <div className="auth-card-title">Top Entities</div>
                <div className="recent-threats-list">
                  {topEntitiesV4.map((e) => (
                    <div
                      key={e.entity}
                      className={`recent-threat-item ${e.risk.toLowerCase()}`}
                    >
                      <span className="rt-entity">{e.entity}</span>
                      <span className="rt-decision">{e.count} events</span>
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
