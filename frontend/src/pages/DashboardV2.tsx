import { useEffect, useState } from "react";
import { getDashboardV2 } from "../services/dashboard";
import type { DashboardSummary } from "../services/dashboard";

const SYSTEM_STATUS: "healthy" | "degraded" | "down" = "healthy";

/* =========================
   OPERATOR STATE (TEMP)
   (Will be wired later)
========================= */
const ACTIVE_BLOCKS = 3; // placeholder
const DEFENSE_MODE: "MONITOR" | "ACTIVE" | "BLOCKING" = "MONITOR";

export default function DashboardV2() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardV2()
      .then(setData)
      .catch((err) => {
        console.error(err);
        setError("Failed to load dashboard data");
      });
  }, []);

  const handleCardClick = (target: string) => {
    console.log(`[INTENT] Navigate to ${target}`);
  };

  if (error) {
    return <div className="auth-v2-root">{error}</div>;
  }

  if (!data) {
    return <div className="auth-v2-root">Loading dashboard…</div>;
  }

  const blockedEvents = data.decision_breakdown.BLOCK ?? 0;

  return (
    <div className="auth-v2-root">
      {/* MAIN */}
      <main className="auth-v2-main">
        {/* TOP BAR */}
        <div className="auth-v2-topbar">
          <div className="auth-v2-title">
            Authentication Abuse Detection System
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

        {/* THREAT */}
        <div className="auth-v2-threat">◆ THREAT LEVEL: ELEVATED</div>

        {/* METRICS */}
        <div className="auth-v2-metrics">
          <div
            className="auth-card"
            tabIndex={0}
            data-tooltip="Total authentication events observed"
            onClick={() => handleCardClick("events")}
          >
            <div className="auth-card-title">Total Events</div>
            <div className="auth-card-value">
              {data.total_events}
            </div>
            <div className="auth-sparkline">
              <span style={{ height: "40%" }} />
              <span style={{ height: "55%" }} />
              <span style={{ height: "45%" }} />
              <span style={{ height: "70%" }} />
              <span style={{ height: "60%" }} />
            </div>
          </div>

          <div
            className="auth-card"
            tabIndex={0}
            data-tooltip="Authentication attempts blocked by enforcement"
            onClick={() => handleCardClick("blocked-events")}
          >
            <div className="auth-card-title">Blocked Events</div>
            <div className="auth-card-value critical">
              {blockedEvents}
            </div>
            <div className="auth-sparkline">
              <span style={{ height: "30%" }} />
              <span style={{ height: "45%" }} />
              <span style={{ height: "50%" }} />
              <span style={{ height: "65%" }} />
              <span style={{ height: "70%" }} />
            </div>
          </div>

          {/* ACTIVE BLOCKS — BLINK WHEN > 0 */}
          <div
            className={`auth-card ${
              ACTIVE_BLOCKS > 0 ? "blink-critical" : ""
            }`}
            tabIndex={0}
            data-tooltip="Currently active enforcement blocks"
            onClick={() => handleCardClick("active-blocks")}
          >
            <div className="auth-card-title">Active Blocks</div>
            <div className="auth-card-value critical">
              {ACTIVE_BLOCKS}
            </div>
            <div className="auth-sparkline critical">
              <span style={{ height: "60%" }} />
              <span style={{ height: "60%" }} />
              <span style={{ height: "60%" }} />
              <span style={{ height: "60%" }} />
              <span style={{ height: "60%" }} />
            </div>
          </div>

          <div
            className="auth-card"
            tabIndex={0}
            data-tooltip="Percentage of malicious activity mitigated"
            onClick={() => handleCardClick("mitigation")}
          >
            <div className="auth-card-title">Mitigation Rate</div>
            <div className="auth-card-value warn">—</div>
            <div className="auth-sparkline accent">
              <span style={{ height: "20%" }} />
              <span style={{ height: "35%" }} />
              <span style={{ height: "40%" }} />
              <span style={{ height: "55%" }} />
              <span style={{ height: "60%" }} />
            </div>
          </div>

          {/* DEFENSE MODE */}
          <div
            className={`auth-card defense-${DEFENSE_MODE.toLowerCase()}`}
            tabIndex={0}
            data-tooltip="Current enforcement policy state"
            onClick={() => handleCardClick("enforcement")}
          >
            <div className="auth-card-title">Defense Mode</div>
            <div className="auth-card-value">
              {DEFENSE_MODE}
            </div>
            <div className="auth-sparkline warn">
              <span style={{ height: "50%" }} />
              <span style={{ height: "50%" }} />
              <span style={{ height: "50%" }} />
              <span style={{ height: "50%" }} />
              <span style={{ height: "50%" }} />
            </div>
          </div>
        </div>

        {/* TIMELINE + THREATS */}
        <div className="auth-v2-grid-2">
          <div className="auth-card-elevated">
            <div className="auth-card-title">Decision Timeline</div>
            <div className="auth-timeline">
              {data.timeline.map((row) => (
                <span
                  key={row.ts}
                  className={
                    row.BLOCK > 0
                      ? "block"
                      : row.CHALLENGE > 0
                      ? "challenge"
                      : "allow"
                  }
                />
              ))}
            </div>
          </div>

          <div className="auth-card-elevated">
            <div className="auth-card-title">Recent Threats</div>
            <div className="auth-placeholder">
              Wired in LogsV2
            </div>
          </div>
        </div>

        {/* RISK + ENTITIES */}
        <div className="auth-v2-grid-2">
          <div className="auth-card-elevated">
            <div className="auth-card-title">Risk Distribution</div>
            <div className="auth-placeholder">
              Wired in metrics phase
            </div>
          </div>

          <div className="auth-card-elevated">
            <div className="auth-card-title">Top Entities</div>
            <div className="auth-placeholder">
              {data.top_entities.map((e) => (
                <div key={e.entity}>
                  {e.entity} ({e.count})
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
