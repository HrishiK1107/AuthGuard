Good.
Below is a **complete, production-grade `architecture.md`** for **AuthGuard**, written to match **your exact system**, codebase, and decisions.
No filler. No assumptions. No marketing fluff.

You can drop this directly into `docs/architecture.md`.

---

# AuthGuard — System Architecture

## 1. Overview

AuthGuard is a **behavior-based authentication abuse detection and enforcement system** designed to identify, score, and mitigate malicious authentication activity in real time.

Unlike traditional rate-limiting systems that rely on static thresholds, AuthGuard uses **event-driven behavioral signals**, **sliding windows**, and a **decaying risk engine** to make adaptive decisions such as:

* `ALLOW`
* `CHALLENGE`
* `BLOCK`

The system is built to be:

* **Stateful**
* **Explainable**
* **Fail-safe**
* **Restart-resilient**

---

## 2. High-Level Architecture

```
Client / Simulator
        |
        v
+--------------------+
| FastAPI Ingest API |
|  (/events/auth)   |
+--------------------+
        |
        v
+------------------------+
| Event Normalization    |
| (Raw → Canonical)      |
+------------------------+
        |
        v
+------------------------+
| Detection Engine       |
| - Signals              |
| - Sliding Windows      |
+------------------------+
        |
        v
+------------------------+
| Risk Engine            |
| - Decay                |
| - Aggregation          |
+------------------------+
        |
        v
+------------------------+
| Decision Engine        |
| - ALLOW / CHALLENGE / |
|   BLOCK                |
+------------------------+
        |
        +--------------------+
        |                    |
        v                    v
+----------------+    +-------------------+
| Go Enforcer    |    | Alerting Engine   |
| (rate control) |    | (webhook/Slack)   |
+----------------+    +-------------------+
        |
        v
+------------------------+
| Persistent Storage     |
| (SQLite event_log)     |
+------------------------+
```

---

## 3. Core Components

### 3.1 FastAPI Ingest Layer (Python)

**Purpose**

* Accept authentication events from simulators or real systems
* Normalize attacker-controlled input
* Guarantee internal consistency

**Key properties**

* Stateless at the API level
* Strict canonical schema (`AuthEvent`)
* Defensive parsing (timestamps, IPs, usernames)

**Why FastAPI**

* Async-friendly
* Typed models
* Clean router separation
* Easy observability

---

### 3.2 Event Normalization

AuthGuard separates **raw input** from **internal truth**.

* Raw events are attacker-controlled
* Canonical events are strictly validated

This prevents:

* Timestamp poisoning
* Missing field crashes
* Schema drift

**Design decision**

> Never let detection logic operate on raw input.

---

### 3.3 Detection Engine (Signals)

Signals represent **behavioral patterns**, not single failures.

Current signals include:

* Failed login velocity
* IP fan-out (many users from one IP)
* User fan-in (many IPs targeting one user)

Each signal:

* Uses a **sliding time window**
* Produces a **risk score**
* Is independently configurable

Signals are **orthogonal** and composable.

---

### 3.4 Sliding Window State Store

AuthGuard maintains in-memory state using:

* Deques
* Hash maps
* Time-based eviction

**Why sliding windows**

* Fixed-rate counters are easy to evade
* Windows preserve temporal behavior
* Enable burst detection

Eviction is timestamp-driven, not request-count-driven.

---

### 3.5 Risk Engine

Risk is not binary.

AuthGuard aggregates signals into a **continuous risk score** per entity.

Key properties:

* Scores **decay over time**
* Multiple signals stack
* Entity-scoped (IP or username)

This enables:

* Cool-down behavior after attacks stop
* Persistent attackers to stay blocked
* Natural recovery for benign users

---

### 3.6 Decision Engine

Risk scores are mapped to actions:

| Risk Range | Decision  |
| ---------- | --------- |
| Low        | ALLOW     |
| Medium     | CHALLENGE |
| High       | BLOCK     |

The decision engine is **pure logic**:

* No I/O
* No side effects
* Fully testable

---

### 3.7 Enforcement Layer (Go)

AuthGuard separates **detection** from **enforcement**.

* Detection runs in Python
* Enforcement runs in Go

**Why Go**

* Concurrency-safe
* Low latency
* Production-style service
* Clear separation of concerns

The enforcer:

* Receives decisions
* Applies TTL-based blocks
* Is restart-resilient

---

### 3.8 Fail-Open / Fail-Closed Modes

AuthGuard supports runtime defense modes:

* **Fail-open**: enforcement failure downgrades BLOCK → CHALLENGE
* **Fail-closed**: BLOCK remains BLOCK even if enforcement fails

This is configurable via `/settings`.

**Reason**

> Security posture must be adjustable without redeploys.

---

### 3.9 Alerting Engine

Alerts are emitted when:

* An entity is BLOCKed
* Sustained CHALLENGE activity occurs

Properties:

* Non-blocking
* Best-effort delivery
* Webhook-based
* Cannot break auth flow

Alerting is **observability**, not enforcement.

---

### 3.10 Persistence Layer

AuthGuard persists **everything** relevant to decisions:

Stored fields include:

* Timestamp
* Entity
* Endpoint
* Outcome
* Decision
* Risk
* Enforcement metadata
* Raw event snapshot

This enables:

* Post-incident analysis
* Dashboards
* Replayability
* Metrics computation

SQLite is used intentionally:

* Deterministic
* Zero external dependency
* Easy to replace later

---

## 4. Dashboard Architecture

The dashboard is **read-only** by design.

* `/dashboard` → summary stats
* `/dashboard/metrics` → aggregated analytics
* `/logs` → raw event timeline

Key rules:

* No mutations
* No side effects
* Safe math only
* Missing columns handled gracefully

Frontend polls periodically; backend remains stateless.

---

## 5. Restart & Recovery Guarantees

On backend startup:

* Existing blocks are replayed into the Go enforcer
* No attacker bypass via restart
* System resumes previous security posture

This is critical for real deployments.

---

## 6. Non-Goals (Intentional)

AuthGuard does **not**:

* Replace IAM systems
* Perform credential validation
* Store secrets
* Act as an authentication provider

It is a **security control**, not an auth service.

---

## 7. Design Philosophy

* Behavior > counters
* Explainability > black boxes
* Separation of concerns
* Safe failure modes
* Minimal magic

---

## 8. Future Extensions (Planned)

* Distributed state backend (Redis)
* Prometheus metrics export
* Authenticated dashboard
* Multi-tenant support
* Policy-driven rule DSL

---

## 9. Summary

AuthGuard is designed as a **real security system**, not a demo:

* Adaptive
* Stateful
* Observable
* Restart-safe
* Production-minded

This architecture intentionally mirrors how modern security controls are built in real environments.

---


