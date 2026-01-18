import { Routes, Route, Navigate } from "react-router-dom";

/* ===== APP SHELL ===== */
import AppShell from "./components/layout/AppShell";

/* ===== V2 PAGES ===== */
import DashboardV2 from "./pages/DashboardV2";
import LogsV2 from "./pages/LogsV2";
import CampaignsV2 from "./pages/CampaignsV2";
import DetectionRulesV2 from "./pages/DetectionRulesV2";
import ActiveBlocksV2 from "./pages/ActiveBlocksV2";
import AttackSimulatorV2 from "./pages/AttackSimulatorV2";
import SystemHealthV2 from "./pages/SystemHealthV2";
import SettingsV2 from "./pages/SettingsV2";

/* ===== SHARED ===== */
import DecisionExplorer from "./pages/DecisionExplorer";

export default function AppV2() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardV2 />} />
        <Route path="/logs" element={<LogsV2 />} />
        <Route path="/campaigns" element={<CampaignsV2 />} />
        <Route path="/rules" element={<DetectionRulesV2 />} />
        <Route path="/blocks" element={<ActiveBlocksV2 />} />
        <Route path="/simulator" element={<AttackSimulatorV2 />} />
        <Route path="/health" element={<SystemHealthV2 />} />
        <Route path="/enforcement" element={<SettingsV2 />} />
        <Route path="/settings" element={<SettingsV2 />} />
        <Route path="/decision/:eventId" element={<DecisionExplorer />} />
      </Route>
    </Routes>
  );
}
