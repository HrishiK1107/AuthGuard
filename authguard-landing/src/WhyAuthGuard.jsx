import { Link } from "react-router-dom";

export default function WhyAuthGuard() {
  return (
    <main className="min-h-screen bg-black text-white flex justify-center">
      <div className="max-w-5xl w-full px-8 py-24">

        <h1 className="text-5xl font-bold mb-6">
          Why AuthGuard?
        </h1>
        <p className="text-xl text-gray-400 mb-20">
          The motivation, problem space, and design philosophy behind the system.
        </p>

        {/* Problem */}
        <section className="mb-20 pl-6 border-l border-gray-800">
          <h2 className="text-3xl font-bold mb-6">The Problem</h2>

          <p className="text-gray-300 text-lg leading-loose mb-6">
            Modern authentication systems fail quietly.
          </p>

          <p className="text-gray-300 text-lg leading-loose mb-6">
            Rate limits are static. Alerts are delayed.
            Attacks adapt faster than defenses.
          </p>

          <p className="text-gray-300 text-lg leading-loose">
            Brute force, credential stuffing, OTP bombing, and low-and-slow abuse
            patterns often bypass traditional controls because they do not violate
            hard thresholds — they exploit behavior.
          </p>
        </section>

        {/* Existing defenses */}
        <section className="mb-20 pl-6 border-l border-gray-800">
          <h2 className="text-3xl font-bold mb-6">
            Why Existing Defenses Are Not Enough
          </h2>

          <p className="text-gray-300 text-lg leading-loose mb-6">
            Static rate limits ignore context.
            Per-request decisions miss campaigns.
            Alerts are reactive, not preventative.
          </p>

          <p className="text-gray-300 text-lg leading-loose">
            Detection and enforcement are often disconnected, leaving operators to
            respond after abuse has already escalated.
          </p>
        </section>

        {/* Approach */}
        <section className="mb-20 pl-6 border-l border-gray-800">
          <h2 className="text-3xl font-bold mb-6">
            The AuthGuard Approach
          </h2>

          <p className="text-gray-300 text-lg leading-loose mb-6">
            AuthGuard treats authentication abuse as a behavioral problem,
            not a request-counting problem.
          </p>

          <p className="text-gray-300 text-lg leading-loose">
            It continuously observes entities over time, accumulates risk with decay,
            correlates events into campaigns, and enforces decisions in real time —
            before abuse escalates.
          </p>
        </section>

        {/* What it solves */}
        <section className="mb-20 pl-6 border-l border-gray-800">
          <h2 className="text-3xl font-bold mb-6">
            What AuthGuard Solves
          </h2>

          <ul className="text-gray-300 text-lg leading-loose list-disc list-inside space-y-3">
            <li>Detects abuse patterns that evade static limits</li>
            <li>Responds in real time, not after compromise</li>
            <li>Correlates attacks across entities and time</li>
            <li>Reduces operator load with decisive enforcement</li>
          </ul>
        </section>

        {/* Why built */}
        <section className="mb-24 pl-6 border-l border-gray-800">
          <h2 className="text-3xl font-bold mb-6">
            Why This System Was Built
          </h2>

          <p className="text-gray-300 text-lg leading-loose mb-6">
            AuthGuard was built to explore how modern authentication abuse should be
            detected and stopped in real systems.
          </p>

          <p className="text-gray-300 text-lg leading-loose mb-6">
            It prioritizes clarity, explainability, and operator control — avoiding
            black-box machine learning or opaque third-party dependencies.
          </p>

          <p className="text-gray-300 text-lg leading-loose">
            Every decision is traceable. Every block is intentional.
          </p>
        </section>

        {/* Navigation */}
        <div className="flex gap-8">
          <a
            href="http://localhost:5173/dashboard"
            className="px-8 py-4 rounded-lg bg-emerald-600 text-black text-lg font-bold
                       hover:bg-emerald-500 transition-colors"
          >
            Enter Dashboard
          </a>

          <Link
            to="/"
            className="px-8 py-4 rounded-lg border border-gray-600 text-gray-300 text-lg font-semibold
                       hover:border-gray-400 hover:text-white transition-colors"
          >
            Back to Landing
          </Link>
        </div>

      </div>
    </main>
  );
}
    