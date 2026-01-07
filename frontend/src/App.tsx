import { Routes, Route, Navigate } from 'react-router-dom'

import Dashboard from './pages/Dashboard'
import Logs from './pages/Logs'
import DetectionRules from './pages/DetectionRules'
import ActiveBlocks from './pages/ActiveBlocks'
import AttackSimulator from './pages/AttackSimulator'
import Settings from './pages/Settings'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/rules" element={<DetectionRules />} />
        <Route path="/blocks" element={<ActiveBlocks />} />
        <Route path="/simulator" element={<AttackSimulator />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  )
}
