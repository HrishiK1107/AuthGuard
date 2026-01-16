// frontend/src/layout/AppShell.tsx

import { Outlet } from "react-router-dom";
import IconRail from "../navigation/IconRail";


export default function AppShell() {
  return (
    <div className="flex h-screen bg-black text-white">
      <IconRail />
      <main className="auth-v2-main">
        <Outlet />
      </main>
    </div>
  );
}
