import { Link } from "react-router-dom";

export default function WhyAuthGuard() {
  return (
    <main className="min-h-screen bg-black text-white flex justify-center">
      <div className="max-w-3xl w-full px-6 py-20">

        <h1 className="text-4xl font-bold mb-4">
          Why AuthGuard?
        </h1>
        <p className="text-lg text-gray-400 mb-16">
          The motivation, problem space, and design philosophy behind the system.
        </p>

        {/* Problem */}
        <section className="mb-14">
          <h2 className="text-2xl font-semibold mb-4">The Problem</h2>
          <p className="text-gray-400 leading-relaxed">
            Modern authentication systems fail quietly.
            <br /><br />
            Rate limits are static. Alerts are delayed.
            Attacks adapt faster than defenses.
            <br /><br />
            Brute force, credential stuffing, OTP bombing, and low-and-slow abuse
            patterns often bypass traditional controls because they do not violate
            hard thresholds — they exploit behavior.
          </p>
        </section>

        {/* Why existing systems fail */}
        <section className="mb-14">
          <h2 className="text-2xl font-semibold mb-4">
            Why Existing Defenses Are Not Enough
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Static rate limits ignore context. Per-request decisions miss campaigns.
            Alerts are reactive, not preventative.
            <br /><br />
            Detection and enforcement are often disconnected, leaving operators to
            respond after abuse has already escalated.
          </p>
        </section>

        {/* Approach */}
        <section className="mb-14">
          <h2 className="text-2xl font-semibold mb-4">
            The AuthGuard Approach
          </h2>
          <p className="text-gray-400 leading-relaxed">
            AuthGuard treats authentication abuse as a behavioral problem,
            not a request-counting problem.
            <br /><br />
            It continuously observes entities over time, accumulates risk with decay,
            correlates events into campaigns, and enforces decisions in real time —
            before abuse escalates.
          </p>
        </section>

        {/* What it solves */}
        <section className="mb-14">
          <h2 className="text-2xl font-semibold mb-4">
            What AuthGuard Solves
          </h2>
          <ul className="text-gray-400 list-disc list-inside space-y-2">
            <li>Detects abuse patterns that evade static limits</li>
            <li>Responds in real time, not after compromise</li>
            <li>Correlates attacks across entities and time</li>
            <li>Reduces operator load with decisive enforcement</li>
          </ul>
        </section>

        {/* Why built */}
        <section className="mb-20">
          <h2 className="text-2xl font-semibold mb-4">
            Why This System Was Built
          </h2>
          <p className="text-gray-400 leading-relaxed">
            AuthGuard was built to explore how modern authentication abuse should be
            detected and stopped in real systems.
            <br /><br />
            It prioritizes clarity, explainability, and operator control — avoiding
            black-box machine learning or opaque third-party dependencies.
            <br /><br />
            Every decision is traceable. Every block is intentional.
          </p>
        </section>

        {/* Navigation */}
        <div className="flex gap-6">
          <a
            href="http://localhost:5173/dashboard"
            className="px-6 py-3 rounded-md bg-emerald-600 text-black font-semibold
                       hover:bg-emerald-500 transition-colors"
          >
            Enter Dashboard
          </a>

          <Link
            to="/"
            className="px-6 py-3 rounded-md border border-gray-600 text-gray-300
                       hover:border-gray-400 hover:text-white transition-colors"
          >
            Back to Landing
          </Link>
        </div>

      </div>
    </main>
  );
}
