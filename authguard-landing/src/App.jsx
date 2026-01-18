import { Routes, Route, Link } from "react-router-dom";
import WhyAuthGuard from "./WhyAuthGuard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/why" element={<WhyAuthGuard />} />
    </Routes>
  );
}

/* =========================
   Landing Page (UI UNCHANGED)
========================== */
function Landing() {
  return (
    <main className="h-screen w-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-7xl w-full px-8 flex flex-col items-center">

        {/* =========================
            Top: Identity
        ========================== */}
        <header className="mb-20 text-center">
          <h1 className="text-7xl font-bold tracking-tight">
            AuthGuard
          </h1>
          <p className="mt-6 text-2xl text-gray-400">
            Authentication Abuse Detection &amp; Enforcement System
          </p>
        </header>

        {/* =========================
            Center: Pillars
        ========================== */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full mb-24">

          {/* Detection */}
          <div
            className="rounded-2xl p-12 text-center transition-all duration-300
                       border border-emerald-500/40
                       hover:shadow-[0_0_50px_-10px_rgba(16,185,129,0.65)]"
          >
            <div className="mb-6 flex justify-center">
              <svg
                className="h-14 w-14 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeWidth="1.5"
                  d="M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4">
              DETECTION
            </h3>
            <p className="text-gray-400 text-base leading-relaxed">
              Behavioral authentication signal analysis across entities and time.
            </p>
          </div>

          {/* Risk Scoring */}
          <div
            className="rounded-2xl p-12 text-center transition-all duration-300
                       border border-amber-500/40
                       hover:shadow-[0_0_50px_-10px_rgba(245,158,11,0.65)]"
          >
            <div className="mb-6 flex justify-center">
              <svg
                className="h-14 w-14 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeWidth="1.5" d="M3 17l6-6 4 4 7-7" />
                <path strokeWidth="1.5" d="M14 7h7v7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4">
              RISK SCORING
            </h3>
            <p className="text-gray-400 text-base leading-relaxed">
              Entity-centric risk accumulation with decay and normalization.
            </p>
          </div>

          {/* Enforcement */}
          <div
            className="rounded-2xl p-12 text-center transition-all duration-300
                       border border-red-500/40
                       hover:shadow-[0_0_50px_-10px_rgba(239,68,68,0.65)]"
          >
            <div className="mb-6 flex justify-center">
              <svg
                className="h-14 w-14 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path strokeWidth="1.5" d="M8 11V7a4 4 0 118 0v4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4">
              ENFORCEMENT
            </h3>
            <p className="text-gray-400 text-base leading-relaxed">
              Real-time decisions: allow, challenge, temporary block, hard block.
            </p>
          </div>

        </section>

        {/* =========================
            Bottom: Actions
        ========================== */}
        <footer className="flex items-center gap-8">
          <a
            href="http://localhost:5173/dashboard"
            className="px-8 py-4 rounded-lg bg-emerald-600 text-black text-lg font-bold
                       hover:bg-emerald-500
                       hover:shadow-[0_0_35px_-8px_rgba(16,185,129,0.75)]
                       transition-all duration-300"
          >
            Enter Dashboard
          </a>

          <Link
            to="/why"
            className="px-8 py-4 rounded-lg border border-gray-600 text-gray-300 text-lg font-semibold
                       hover:border-gray-400 hover:text-white
                       hover:shadow-[0_0_30px_-10px_rgba(255,255,255,0.35)]
                       transition-all duration-300"
          >
            Why AuthGuard?
          </Link>
        </footer>

        {/* =========================
            Footer Note
        ========================== */}
        <div className="mt-12 text-sm text-gray-500">
          Operator Console · Demo Environment
        </div>

      </div>
    </main>
  );
}
