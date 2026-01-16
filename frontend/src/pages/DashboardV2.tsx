export default function DashboardV2() {
  return (
    <div className="auth-v2-root">

      {/* SIDEBAR */}
      <aside className="auth-v2-nav">
        <div>
          <div className="auth-v2-logo-main">AUTHGUARD</div>
          <div className="auth-v2-logo-sub">Auth Abuse Defense</div>
        </div>

        <nav className="auth-v2-nav-items">
          {[
            "Dashboard",
            "Events",
            "Campaigns",
            "Decisions",
            "Enforcement",
            "Rules",
            "System",
          ].map((item) => (
            <div key={item} className="auth-v2-nav-item">
              {item}
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <main className="auth-v2-main">

        <div className="auth-v2-topbar">
          <div>Authentication Abuse Detection System</div>
          <div className="auth-v2-top-right">
            <span className="auth-pill">MODE: FAIL-CLOSED</span>
            <span className="auth-pill">SYSTEM: HEALTHY</span>
            <span className="auth-pill">LAST UPDATED: 17s ago</span>
            <span className="auth-pill">RISK: LOW / HIGH</span>
          </div>
        </div>

        <div className="auth-v2-threat">
          ◆ THREAT LEVEL: ELEVATED
        </div>

        <div className="auth-v2-metrics">
          <div className="auth-card">
            <div className="auth-card-title">Total Events</div>
            <div className="auth-card-value">1,280</div>
          </div>

          <div className="auth-card">
            <div className="auth-card-title">Blocked Events</div>
            <div className="auth-card-value">148</div>
          </div>

          <div className="auth-card">
            <div className="auth-card-title">Mitigation Rate</div>
            <div className="auth-card-value accent">31%</div>
          </div>

          <div className="auth-card">
            <div className="auth-card-title">Defense Mode</div>
            <div className="auth-card-value">ACTIVE</div>
          </div>
        </div>

        <div className="auth-v2-grid-2">
          <div className="auth-card-elevated">
            <div className="auth-card-title">Decision Timeline</div>
            <div className="auth-placeholder">Timeline placeholder</div>
          </div>

          <div className="auth-card-elevated">
            <div className="auth-card-title">Recent Threats</div>
            <div className="auth-placeholder">Threat feed placeholder</div>
          </div>
        </div>

        <div className="auth-v2-grid-2">
          <div className="auth-card-elevated">
            <div className="auth-card-title">Risk Distribution</div>
            <div className="auth-bars">
              <div className="auth-bar" />
              <div className="auth-bar" />
              <div className="auth-bar" />
            </div>
          </div>

          <div className="auth-card-elevated">
            <div className="auth-card-title">Top Entities</div>
            <div className="auth-placeholder">Graph placeholder</div>
          </div>
        </div>

      </main>
    </div>
  );
}
