import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/layout/layout.tsx";

import Dashboard from "./pages/Dashboard";
import Logs from "./pages/Logs";
import DetectionRules from "./pages/DetectionRules";
import ActiveBlocks from "./pages/ActiveBlocks";
import AttackSimulator from "./pages/AttackSimulator";
import Settings from "./pages/Settings";
import DecisionExplorer from "./pages/DecisionExplorer";
import Campaigns from "./pages/Campaigns";
import SystemHealth from "./pages/SystemHealth";

/* ===== V2 PAGES ===== */
import DashboardV2 from "./pages/DashboardV2";
import LogsV2 from "./pages/LogsV2";
import CampaignsV2 from "./pages/CampaignsV2";
import DetectionRulesV2 from "./pages/DetectionRulesV2";
import ActiveBlocksV2 from "./pages/ActiveBlocksV2";
import AttackSimulatorV2 from "./pages/AttackSimulatorV2";
import SystemHealthV2 from "./pages/SystemHealthV2";
import SettingsV2 from "./pages/SettingsV2";// same file, v2 UI

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />

{/* ===== V2 STANDALONE ===== */}
<Route path="/dashboard-v2" element={<DashboardV2 />} />
<Route path="/logs-v2" element={<LogsV2 />} />
<Route path="/campaigns-v2" element={<CampaignsV2 />} />
<Route path="/rules-v2" element={<DetectionRulesV2 />} />
<Route path="/blocks-v2" element={<ActiveBlocksV2 />} />
<Route path="/simulator-v2" element={<AttackSimulatorV2 />} />
<Route path="/health-v2" element={<SystemHealthV2 />} />
<Route path="/enforcement-v2" element={<SettingsV2 />} />


      {/* ===== MAIN APP (LAYOUT WRAPPED) ===== */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/rules" element={<DetectionRules />} />
        <Route path="/blocks" element={<ActiveBlocks />} />
        <Route path="/simulator" element={<AttackSimulator />} />
        <Route path="/health" element={<SystemHealth />} />

        {/* Enforcement Control */}
        <Route path="/enforcement" element={<Settings />} />
        <Route path="/settings" element={<Settings />} />

        <Route
          path="/decision/:eventId"
          element={<DecisionExplorer />}
        />
      </Route>
    </Routes>
  );
}
