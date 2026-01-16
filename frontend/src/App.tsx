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

import DashboardV2 from "./pages/DashboardV2";
import LogsV2 from "./pages/LogsV2";
import CampaignsV2 from "./pages/CampaignsV2";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />

      {/* ===== V2 STANDALONE ===== */}
      <Route path="/dashboard-v2" element={<DashboardV2 />} />
      <Route path="/logs-v2" element={<LogsV2 />} />
      <Route path="/campaigns-v2" element={<CampaignsV2 />} />

      {/* ===== MAIN APP ===== */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/rules" element={<DetectionRules />} />
        <Route path="/blocks" element={<ActiveBlocks />} />
        <Route path="/simulator" element={<AttackSimulator />} />
        <Route path="/health" element={<SystemHealth />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/decision/:eventId" element={<DecisionExplorer />} />
      </Route>
    </Routes>
  );
}
