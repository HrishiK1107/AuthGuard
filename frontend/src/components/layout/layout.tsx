import { NavLink, Outlet } from 'react-router-dom'
import Header from './Header'

const navItems = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Logs', path: '/logs' },
  { name: 'Detection Rules', path: '/rules' },
  { name: 'Active Blocks', path: '/blocks' },
  { name: 'Attack Simulator', path: '/simulator' },
  { name: 'Settings', path: '/settings' },
]

export default function Layout() {
  return (
    <div className="flex h-screen bg-black text-white">
      
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 p-4 border-r border-neutral-800">
        <h2 className="text-lg font-semibold mb-6 tracking-wide">
  AuthGuard
  <div className="text-xs text-neutral-500 mt-1">
    Auth Abuse Defense
  </div>
</h2>


        <nav className="space-y-1 text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block px-3 py-2 rounded ${
                  isActive
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col bg-black">
  <Header />
  <div className="flex-1 p-6 overflow-auto">
    <Outlet />
  </div>
</main>

    </div>
  )
}
