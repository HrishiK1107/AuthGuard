import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-4">
        <h2 className="text-lg font-semibold mb-6">AuthGuard</h2>
        <nav className="space-y-2 text-sm">
          <div className="text-gray-400">Dashboard</div>
          <div className="text-gray-400">Logs</div>
          <div className="text-gray-400">Detection Rules</div>
          <div className="text-gray-400">Active Blocks</div>
          <div className="text-gray-400">Attack Simulator</div>
          <div className="text-gray-400">Settings</div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
