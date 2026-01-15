# AuthGuard — System Architecture

## 1. Overview

AuthGuard is a **behavior-based authentication abuse detection and enforcement system**
designed to identify, score, correlate, and mitigate malicious authentication activity
in real time.

Unlike traditional rate-limiting systems that rely on static counters, AuthGuard uses:

- **Event-driven behavioral signals**
- **Sliding time windows**
- **Time-decayed risk modeling**
- **Campaign-level correlation**

to produce **deterministic, explainable decisions**:

- `ALLOW`
- `CHALLENGE`
- `BLOCK`

The system is intentionally designed to be:

- **Stateful**
- **Explainable**
- **Restart-resilient**
- **Operationally safe**

AuthGuard is a security control, not an authentication provider.

---

## 2. High-Level Architecture

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
| - Behavioral Signals   |
| - Sliding Windows      |
+------------------------+
        |
        v
+------------------------+
| Campaign Correlation   |
| - Multi-event linking  |
+------------------------+
        |
        v
+------------------------+
| Risk Engine            |
| - Time decay           |
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
| (TTL control)  |    | (Webhooks)        |
+----------------+    +-------------------+
        |
        v
+------------------------+
| Persistent Storage     |
| (SQLite event_log)     |
+------------------------+

---

## 3. Core Components

### 3.1 FastAPI Ingest Layer

**Purpose**
- Accept authentication events from simulators or real systems
- Validate and normalize attacker-controlled input
- Provide a stateless ingress boundary

**Key properties**
- Stateless request handling
- Strict canonical schema (`AuthEvent`)
- Defensive parsing (timestamps, IPs, usernames)

**Design rule**
> Detection logic never operates on raw input.

---

### 3.2 Event Normalization

Raw authentication events are **untrusted input**.

Normalization enforces:
- Required fields
- Safe timestamps
- Consistent entity identifiers

This prevents:
- Timestamp poisoning
- Schema drift
- Detection bypass via malformed events

Canonical events are the **only source of truth** downstream.

---

### 3.3 Detection Engine (Signals)

Signals model **behavior over time**, not individual failures.

Implemented signals include:
- Failed login velocity
- IP fan-out (many users from one IP)
- User fan-in (many IPs targeting one user)

Each signal:
- Operates on a **sliding time window**
- Emits a bounded score
- Is independently configurable

Signals are **orthogonal** and composable.

---

### 3.4 Sliding Window State Store

AuthGuard maintains in-memory temporal state using:
- Deques
- Hash maps
- Timestamp-based eviction

**Why sliding windows**
- Fixed counters are easy to evade
- Windows preserve temporal structure
- Burst behavior becomes observable

Eviction is **time-driven**, not request-driven.

---

### 3.5 Campaign Correlation Layer

AuthGuard introduces **campaign-level correlation**.

A campaign represents:
- Sustained or coordinated malicious behavior
- Across time
- Across entities (IP, user, endpoint)

Campaigns track:
- First and last seen timestamps
- Decision distribution
- Affected entities
- Primary attack vector
- Campaign state (active / cooling / ended)

Campaigns provide **context**, not enforcement.

---

### 3.6 Risk Engine

Risk is modeled as a **continuous, decaying value**.

Properties:
- Risk increases with suspicious behavior
- Risk decays when traffic stops
- Sustained attacks overpower decay
- Normal users recover naturally

Risk is scoped per entity (IP or user),
and the **maximum effective risk** drives decisions.

---

### 3.7 Decision Engine (Pure Logic)

The decision engine maps risk to actions:

| Risk Level | Decision  |
|------------|-----------|
| Low        | ALLOW     |
| Medium     | CHALLENGE |
| High       | BLOCK     |

Key properties:
- No I/O
- No persistence
- No side effects
- Fully deterministic

This separation guarantees auditability and testability.

---

### 3.8 Enforcement Layer (Go)

AuthGuard **does not enforce blocks directly**.

Enforcement is delegated to a separate Go service to ensure:
- Isolation from detection failures
- Concurrency safety
- Production-style enforcement semantics

The enforcer:
- Applies TTL-based blocks
- Persists active blocks
- Replays blocks on restart

Detection and enforcement are **intentionally decoupled**.

---

### 3.9 Fail-Open / Fail-Closed Modes

Runtime defense modes:
- **Fail-open**: enforcement failure downgrades BLOCK → CHALLENGE
- **Fail-closed**: enforcement continues even if degraded

Modes are configurable at runtime via `/settings`.

This allows posture changes without redeployments.

---

### 3.10 Alerting Engine

Alerts are generated when:
- An entity is BLOCKed
- Suspicious behavior persists

Alerting is:
- Non-blocking
- Best-effort
- Webhook-based

Alert delivery failures never impact authentication flow.

---

### 3.11 Persistence Layer

AuthGuard persists all security-relevant events:

Stored data includes:
- Timestamp
- Entity
- Endpoint
- Outcome
- Decision
- Risk
- Enforcement metadata
- Raw event snapshot

Persistence enables:
- Dashboards
- Metrics
- Forensics
- Replayability

SQLite is used intentionally for determinism and simplicity.

---

## 4. Operator Dashboards

Dashboards are **read-only by design**.

They are composed from real backend sources:
- `/dashboard` — summary stats
- `/dashboard/metrics` — aggregations
- `/logs` — raw events
- `/blocks` — active enforcement

Derived metrics are explicit and never fabricated.

---

## 5. Restart & Recovery Guarantees

On backend startup:
- Persisted blocks are replayed into the enforcer
- Campaign and risk state resumes
- No enforcement gaps are introduced

Restart safety is a core design requirement.

---

## 6. Deployment Architecture 

AuthGuard runs as a **three-service stack**:

- FastAPI backend (detection, risk, decision)
- Go enforcer (TTL enforcement)
- Frontend (operator dashboards)

All services are containerized and orchestrated via Docker Compose.

---

## 7. Non-Goals (Intentional)

AuthGuard does **not**:
- Perform authentication
- Store credentials
- Replace IAM systems
- Act as an identity provider

It is a **defensive security control**.

---

## 8. Design Philosophy

- Behavior > counters
- Explainability > black boxes
- Separation of concerns
- Safe failure modes
- Minimal magic

---

## 9. Summary

AuthGuard reflects how **real security systems are built**:

- Adaptive
- Stateful
- Observable
- Restart-safe
- Operationally coherent

This architecture is designed to be extended without violating its core guarantees.
