// frontend/src/components/navigation/IconRail.tsx

import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Radar,
  ListChecks,
  Ban,
  Bug,
  HeartPulse,
  Shield,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Logs", icon: FileText, path: "/logs" },
  { label: "Campaigns", icon: Radar, path: "/campaigns" },
  { label: "Detection Rules", icon: ListChecks, path: "/rules" },
  { label: "Active Blocks", icon: Ban, path: "/blocks" },
  { label: "Attack Simulator", icon: Bug, path: "/simulator" },
  { label: "System Health", icon: HeartPulse, path: "/health" },
  { label: "Enforcement Control", icon: Shield, path: "/settings" },
];

export default function IconRail() {
  return (
    <aside className="auth-icon-rail">
      {/* TOP LOGO SLOT — emoji removed, structure intact */}
      <div className="auth-v2-nav-header flex items-center justify-center h-14">
        <NavLink
          to="/dashboard"
          title="AuthGuard — Dashboard"
          className="text-xl"
        >
          {/* intentionally empty */}
        </NavLink>
      </div>

      {/* ICONS */}
      <nav className="auth-v2-nav-items">
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={label}
            to={path}
            title={label}
            className={({ isActive }) =>
              `auth-v2-nav-item ${isActive ? "active" : ""}`
            }
          >
            <Icon size={22} className="auth-v2-nav-icon" />
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
