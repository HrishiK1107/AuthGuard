Here is a **complete, production-grade `tradeoffs.md`** tailored exactly to **AuthGuard as it exists today**.
Drop this directly into `docs/tradeoffs.md`.

---

# AuthGuard — Design Tradeoffs

This document explains **intentional decisions**, **rejected alternatives**, and **why the current architecture is correct for AuthGuard’s goals**.

AuthGuard is not a generic SIEM, WAF, or IAM replacement.
It is a **behavioral abuse detection and enforcement system** optimized for clarity, correctness, and survivability.

---

## 1. Detection vs Prevention

### Decision

AuthGuard separates **detection** from **authentication enforcement**.

### Why

* Detection systems must be **observable and explainable**
* Auth systems must be **fast and deterministic**
* Coupling both creates brittle failure modes

### Tradeoff

* Slight latency added by enforcement hop
* More components to reason about

### Rejected Alternative

Embedding detection logic directly inside auth flows
→ Rejected due to:

* Tight coupling
* Difficult rollback
* Risk of auth outages

---

## 2. Risk Accumulation vs Hard Thresholds

### Decision

Use **decaying risk scores**, not fixed counters.

### Why

* Attackers exploit reset windows
* Users make mistakes
* Permanent blocks are operationally dangerous

### Tradeoff

* Risk math is harder to reason about than counters
* Requires timestamps and decay logic

### Rejected Alternative

* Fixed rate limits
* Reset-based counters

These fail under:

* Timing evasion
* Slow attacks
* Distributed abuse

---

## 3. Sliding Windows vs Global Counters

### Decision

All detection signals use **sliding windows**.

### Why

* Sliding windows model *behavior over time*
* Prevent “wait-and-reset” attacks
* Allow gradual recovery

### Tradeoff

* Slight memory overhead
* More complex state management

### Rejected Alternative

Static counters per minute/hour
→ Too easy to game.

---

## 4. SQLite vs Distributed Databases

### Decision

Use **SQLite** for logs and metrics.

### Why

* Single-node system
* Deterministic behavior
* Easy inspection
* Zero operational overhead

### Tradeoff

* No horizontal scaling
* Single-writer limitations

### Rejected Alternative

* Redis
* Postgres
* ClickHouse

Rejected because:

* Overkill at this stage
* Introduces ops complexity
* Distracts from detection logic

---

## 5. In-Memory State vs Persistent Risk

### Decision

Risk engine state is **in-memory**, blocks are persisted.

### Why

* Risk is transient by nature
* Persistence increases false positives
* Blocks must survive restarts

### Tradeoff

* Risk resets on restart
* Requires re-learning behavior

### Rejected Alternative

Persisting all risk scores
→ Causes:

* Stale risk
* Accidental long-term punishment

---

## 6. Go Enforcer vs Python Enforcement

### Decision

Enforcement is handled by a **Go service**.

### Why

* Concurrency-safe
* Low latency
* TTL handling is trivial
* Clean separation from detection

### Tradeoff

* Two languages
* IPC overhead

### Rejected Alternative

Python-based enforcement
→ Rejected due to:

* GIL contention
* Harder concurrency guarantees

---

## 7. Fail-Open / Fail-Closed Modes

### Decision

Runtime-configurable enforcement modes.

### Why

* Different environments require different safety guarantees
* Detection must never block auth unintentionally

### Tradeoff

* Slightly more logic paths
* Requires operator awareness

### Rejected Alternative

Hardcoded behavior
→ Unsafe in real systems.

---

## 8. Read-Only Dashboards

### Decision

Dashboards are **strictly read-only**.

### Why

* Prevent privilege escalation
* Avoid UI-driven state changes
* Reduce attack surface

### Tradeoff

* No manual overrides from UI

### Rejected Alternative

Interactive dashboards
→ Rejected due to:

* Security risk
* Audit complexity

---

## 9. No Charts by Default

### Decision

Tables > charts for initial UX.

### Why

* Precision over aesthetics
* Easier to audit
* Lower frontend complexity

### Tradeoff

* Less visual appeal

### Rejected Alternative

Chart-heavy dashboards
→ Often hide anomalies and mislead operators.

---

## 10. Alerting as Best-Effort

### Decision

Alerts **never affect auth flow**.

### Why

* Alerting systems fail
* Detection must remain stable

### Tradeoff

* Alerts may be dropped
* Requires monitoring alert health separately

### Rejected Alternative

Blocking on alert delivery
→ Dangerous and unacceptable.

---

## 11. No Authentication on Dashboards (Yet)

### Decision

Dashboards are currently unauthenticated.

### Why

* Local / demo environment
* Focus on core detection

### Tradeoff

* Not production-safe

### Planned

* Auth middleware
* Role separation
* Token-based access

---

## 12. Explicit Non-Goals

AuthGuard **does not aim to**:

* Replace SIEMs
* Replace IAM systems
* Detect application-layer fraud
* Perform DPI or payload inspection

Trying to do these would **weaken** the system.

---

## 13. Summary of Philosophy

AuthGuard prioritizes:

* Determinism over cleverness
* Safety over aggression
* Observability over opacity
* Recovery over punishment
* Separation of concerns over convenience

Every tradeoff favors **operational trustworthiness**.

---

## 14. What Comes Next (Optional)

If extended further, the natural next steps are:

* Multi-node risk sharing
* Authenticated dashboards
* Structured alert sinks (Slack, PagerDuty)
* Policy-as-code

But **the core system is complete**.

---


