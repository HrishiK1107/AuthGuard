import { Routes, Route, Navigate } from 'react-router-dom'

import Layout from './components/layout/layout.tsx'
import Dashboard from './pages/Dashboard'
import Logs from './pages/Logs'
import DetectionRules from './pages/DetectionRules'
import ActiveBlocks from './pages/ActiveBlocks'
import AttackSimulator from './pages/AttackSimulator'
import Settings from './pages/Settings'
import DecisionExplorer from './pages/DecisionExplorer'

export default function App() {
  return (
    <Routes>
      {/* Redirect root */}
      <Route path="/" element={<Navigate to="/dashboard" />} />

      {/* Layout wrapper */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/rules" element={<DetectionRules />} />
        <Route path="/blocks" element={<ActiveBlocks />} />
        <Route path="/simulator" element={<AttackSimulator />} />
        <Route path="/settings" element={<Settings />} />

        {/* Phase 6.2 — Decision Explorer */}
        <Route path="/decision/:eventId" element={<DecisionExplorer />} />
      </Route>
    </Routes>
  )
}
