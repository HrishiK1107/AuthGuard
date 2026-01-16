import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/layout/layout";

/* ===== V1 PAGES ===== */
import Dashboard from "./pages/Dashboard";
import Logs from "./pages/Logs";
import Campaigns from "./pages/Campaigns";
import DetectionRules from "./pages/DetectionRules";
import ActiveBlocks from "./pages/ActiveBlocks";
import AttackSimulator from "./pages/AttackSimulator";
import SystemHealth from "./pages/SystemHealth";
import Settings from "./pages/Settings";
import DecisionExplorer from "./pages/DecisionExplorer";

export default function App() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Main App (V1 Layout) */}
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

        {/* Decision Explorer */}
        <Route
          path="/decision/:eventId"
          element={<DecisionExplorer />}
        />
      </Route>
    </Routes>
  );
}
