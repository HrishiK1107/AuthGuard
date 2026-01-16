import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Logs", path: "/logs" },
  { label: "Campaigns", path: "/campaigns" },
  { label: "Detection Rules", path: "/rules" },
  { label: "Active Blocks", path: "/blocks" },
  { label: "Attack Simulator", path: "/simulator" },
  { label: "System Health", path: "/health" },
  { label: "Enforcement Control", path: "/settings" },
];

export default function SidebarV2() {
  return (
    <aside className="w-72 border-r border-neutral-800 bg-black p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold tracking-wide">AUTHGUARD</h1>
        <p className="text-xs text-neutral-500 mt-1">
          Auth Abuse Defense
        </p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-md transition ${
                isActive
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
