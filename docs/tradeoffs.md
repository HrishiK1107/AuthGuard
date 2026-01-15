# AuthGuard — Design Tradeoffs (v2)

This document explains **intentional architectural decisions**, **rejected alternatives**, and
**why the current design is correct for AuthGuard’s goals**.

AuthGuard is not a generic SIEM, WAF, or IAM replacement.
It is a **behavior-based authentication abuse detection and enforcement system**
optimized for correctness, explainability, and operational safety.

---

## 1. Detection vs Enforcement

### Decision
AuthGuard separates **detection and decision-making** from **enforcement execution**.

### Why
- Detection systems must be observable and explainable
- Enforcement systems must be fast, isolated, and failure-tolerant
- Coupling both creates brittle failure modes

### Tradeoff
- Slight latency from an enforcement hop
- Additional service boundary

### Rejected Alternative
Embedding detection directly in authentication flows  
→ Rejected due to:
- Tight coupling
- Difficult rollback
- Risk of auth outages

---

## 2. Risk Accumulation vs Hard Thresholds

### Decision
Use **time-decayed risk scoring**, not static counters.

### Why
- Attackers exploit reset windows
- Users make mistakes
- Permanent blocks are operationally dangerous

### Tradeoff
- Risk math is less intuitive than counters
- Requires timestamped state and decay logic

### Rejected Alternative
- Fixed rate limits
- Reset-based counters

These fail under:
- Timing evasion
- Low-and-slow attacks
- Distributed abuse

---

## 3. Sliding Windows vs Global Counters

### Decision
All detection signals use **sliding time windows**.

### Why
- Preserve temporal behavior
- Prevent wait-and-reset evasion
- Allow natural recovery

### Tradeoff
- Slight memory overhead
- More complex state management

### Rejected Alternative
Static counters per minute/hour  
→ Too easy to game.

---

## 4. SQLite vs Distributed Databases

### Decision
Use **SQLite** for event logs and metrics.

### Why
- Single-node system
- Deterministic behavior
- Easy inspection
- Zero operational overhead

### Tradeoff
- No horizontal scaling
- Single-writer constraints

### Rejected Alternative
- Redis
- Postgres
- ClickHouse

Rejected because:
- Overkill at this stage
- Adds operational complexity
- Distracts from detection correctness

---

## 5. In-Memory Risk vs Persistent Risk

### Decision
Risk state is **in-memory**, enforcement state is **persisted**.

### Why
- Risk is transient by nature
- Persisted risk causes false positives
- Enforcement must survive restarts

### Tradeoff
- Risk resets on restart
- Behavior must be re-learned

### Rejected Alternative
Persisting all risk scores  
→ Leads to stale punishment and poor UX.

---

## 6. Go Enforcer vs Python Enforcement

### Decision
Enforcement is handled by a **separate Go service**.

### Why
- Concurrency-safe
- Low latency
- TTL handling is trivial
- Clean separation from detection

### Tradeoff
- Two languages
- IPC/network overhead

### Rejected Alternative
Python-based enforcement  
→ Rejected due to:
- GIL contention
- Harder concurrency guarantees

---

## 7. Fail-Open / Fail-Closed Modes

### Decision
Runtime-configurable enforcement modes.

### Why
- Different environments require different safety postures
- Detection must never unintentionally block authentication

### Tradeoff
- More logic paths
- Requires operator awareness

### Rejected Alternative
Hardcoded behavior  
→ Unsafe in real systems.

---

## 8. Operator Dashboards & Controls

### Decision
Dashboards are **mostly read-only**, with **explicit, isolated operator controls**.

### Why
- Read-only views reduce accidental damage
- Critical controls (mode toggle, unblock) must still exist
- Enforcement actions are intentionally narrow and auditable

### Tradeoff
- Limited operational flexibility
- Fewer “power-user” features

### Rejected Alternative
Fully interactive dashboards  
→ Rejected due to:
- Larger attack surface
- Audit complexity
- Risk of UI-driven outages

---

## 9. Tables-First Visualization

### Decision
Use **tables as the primary visualization**, with minimal charts.

### Why
- Precision over aesthetics
- Easier auditing
- Less misleading aggregation

### Tradeoff
- Less visual appeal
- Slower at-a-glance scanning

### Rejected Alternative
Chart-heavy dashboards  
→ Often hide edge cases and mislead operators.

---

## 10. Alerting as Best-Effort

### Decision
Alerts never affect authentication flow.

### Why
- Alerting systems fail
- Detection must remain stable

### Tradeoff
- Alerts may be dropped
- Alert reliability must be monitored separately

### Rejected Alternative
Blocking on alert delivery  
→ Dangerous and unacceptable.

---

## 11. Dashboard Authentication (Deferred)

### Decision
Dashboards are currently unauthenticated.

### Why
- Local / demo environment
- Focus on core detection correctness

### Tradeoff
- Not production-safe

### Planned
- Auth middleware
- Role separation
- Token-based access

---

## 12. Explicit Non-Goals

AuthGuard does **not** aim to:
- Replace SIEMs
- Replace IAM systems
- Detect application-layer fraud
- Perform deep packet inspection

Expanding scope would weaken the system.

---

## 13. Design Philosophy

AuthGuard prioritizes:
- Determinism over cleverness
- Safety over aggression
- Explainability over opacity
- Recovery over punishment
- Separation of concerns over convenience

Every tradeoff favors **operational trustworthiness**.

---

## 14. What Comes Next (Optional)

Possible extensions:
- Distributed risk sharing
- Authenticated dashboards
- Structured alert sinks
- Policy-as-code

**The core system is complete.**
