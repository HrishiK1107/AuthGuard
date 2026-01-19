# AuthGuard

### Behavior-Based Authentication Abuse Detection & Enforcement System

AuthGuard is a **real-time authentication abuse detection system** that identifies, scores, and mitigates malicious login behavior using **behavioral signals and time-decayed risk modeling**.

It is designed for **correctness, explainability, and operational safety**, avoiding static rate limits and opaque machine-learning models.

AuthGuard is a **defensive security control**, not an authentication provider.

---

## Visual Documentation

> Screenshots reflect the real operator UI and system behavior.

<img width="1898" height="860" alt="Dashboard Overview" src="https://github.com/user-attachments/assets/d36d41d7-298e-4604-b2f5-a8169dc93998" />
<img width="1896" height="936" alt="Detection & Enforcement Views" src="https://github.com/user-attachments/assets/15cd741f-c61c-4a48-9c47-159d451007a2" />
<img width="1560" height="576" alt="Campaign Correlation" src="https://github.com/user-attachments/assets/004d4cf5-0b77-4fe0-9399-873e37cb3ae7" />

---

## Overview

Authentication endpoints are a primary attack surface for:

* Brute-force attacks
* Credential stuffing
* OTP abuse
* Distributed login abuse

AuthGuard observes authentication activity, evaluates **behavioral patterns over time**, and produces **deterministic, explainable enforcement decisions**.

All enforcement is:

* Temporary
* TTL-based
* Reversible
* Resilient to infrastructure failures

---

## System Architecture

```

                         ┌─────────────────────────┐
                         │        Client /          │
                         │   Attack Simulator       │
                         │  (Login / OTP / API)     │
                         └─────────────┬───────────┘
                                       │
                                       v
        ┌──────────────────────────────────────────────────┐
        │                NGINX (Docker)                     │
        │  - Serves Landing Page                             │
        │  - Routes /dashboard → Frontend SPA                │
        │  - Proxies /api → FastAPI Backend                  │
        └─────────────┬────────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          │                       │
          v                       v

┌──────────────────────┐   ┌──────────────────────────────┐
│  Frontend (React)    │   │  Backend (FastAPI – Docker)   │
│  Operator Dashboard  │   │                              │
│  - Dashboard v2      │   │  /events/auth (Ingest API)   │
│  - Logs & Events     │   │                              │
│  - Campaigns         │   └─────────────┬────────────────┘
│  - Enforcement View  │                 │
└──────────────────────┘                 v
                             ┌────────────────────────────┐
                             │ Event Normalization Layer  │
                             │ Raw Auth → Canonical Event │
                             └─────────────┬──────────────┘
                                           v
                             ┌────────────────────────────┐
                             │ Detection Engine            │
                             │ - Sliding Windows           │
                             │ - Behavioral Signals        │
                             │ - Replay Safety             │
                             └─────────────┬──────────────┘
                                           v
                             ┌────────────────────────────┐
                             │ Campaign Correlation        │
                             │ - Multi-event Attribution  │
                             │ - Confidence Linking       │
                             └─────────────┬──────────────┘
                                           v
                             ┌────────────────────────────┐
                             │ Risk Engine v2              │
                             │ - Time Decay                │
                             │ - Entity Aggregation        │
                             │ - Normalization / Ceilings │
                             └─────────────┬──────────────┘
                                           v
                             ┌────────────────────────────┐
                             │ Decision Engine             │
                             │ - Policy-driven             │
                             │ - ALLOW / CHALLENGE         │
                             │ - TEMP_BLOCK / HARD_BLOCK   │
                             └─────────────┬──────────────┘
                                           │
                 ┌─────────────────────────┴─────────────────────────┐
                 │                                                     │
                 v                                                     v
┌────────────────────────────┐             ┌────────────────────────────┐
│ Go Rate Limiter (Docker)   │             │ Alerting Engine             │
│ - TTL-based enforcement   │             │ - Deduplication             │
│ - Token / Sliding Buckets │             │ - Severity mapping           │
│ - Persistent block store  │             │ - Webhook delivery           │
└─────────────┬──────────────┘             └────────────────────────────┘
              │
              v
┌──────────────────────────────────────────────────────────┐
│ Persistent Storage (SQLite)                               │
│ - Event Logs                                              │
│ - Decisions                                               │
│ - Campaigns                                               │
│ - Enforcement Records                                     │
└──────────────────────────────────────────────────────────┘


```

---

## Core Capabilities

* **Behavior-based detection** (not request counting)
* **Sliding-window signal analysis**
* **Time-decayed risk scoring**
* **Explainable, deterministic decisions**
* **TTL-based enforcement**
* **Fail-open / fail-closed modes**
* **Campaign-level attack correlation**
* **Read-only operational dashboards**
* **Built-in attack simulators**

---

## Detection Model

AuthGuard evaluates authentication activity using independent behavioral signals.

### Implemented Signals

* **Failed Login Velocity**
  Detects rapid authentication failures from a single entity.

* **IP Fan-Out**
  Detects a single IP targeting many users.

* **User Fan-In**
  Detects a single user targeted from many IPs.

Each signal:

* Uses a sliding time window
* Emits a bounded score
* Decays naturally over time

Signals are **orthogonal and composable**.

---

## Risk Engine

Risk is modeled as a **continuous, time-decayed value** per entity.

Key properties:

* Risk increases with suspicious behavior
* Risk decays when activity stops
* Sustained attacks overpower decay
* Benign traffic naturally recovers

Final decisions are driven by the **maximum effective risk** across relevant entities.

---

## Decision Engine

Decisions are deterministic and auditable.

| Risk Level | Decision  |
| ---------- | --------- |
| Low        | ALLOW     |
| Medium     | CHALLENGE |
| High       | BLOCK     |

Each decision includes:

* Effective risk score
* Triggered signals
* Campaign attribution (if applicable)
* Enforcement metadata

---

## Enforcement Architecture

AuthGuard **does not enforce blocks directly**.

Enforcement is delegated to a **separate Go service** to ensure:

* Isolation from detection failures
* Concurrency safety
* Low-latency TTL handling
* Restart resilience

### Enforcement Characteristics

* TTL-based blocking
* Automatic expiry
* Block replay on restart
* Explicit failure handling

### Failure Modes

* **Fail-Open**: degrade BLOCK → CHALLENGE if enforcement fails
* **Fail-Closed**: continue blocking even during enforcement degradation

Modes are configurable at runtime.

---

## Alerting

Alerts are generated when:

* An entity is BLOCKed
* Suspicious behavior persists over time

Alerting is:

* Webhook-based
* Best-effort
* Non-blocking

Alert delivery failures **never affect authentication flow**.

---

## Observability

AuthGuard treats observability as a **first-class security control**.

### Dashboard Capabilities

* Total and blocked event counts
* Mitigation rate
* Decision timelines
* Risk distribution
* Threat feed (recent blocks)
* Top risky entities
* Campaign overview
* Enforcement state

Dashboards are intentionally **safe by default** and **operator-focused**.

---

## Built-In Simulators

AuthGuard includes attack simulators that exercise the **same ingest pipeline as real traffic**:

* Brute-force simulation
* Credential stuffing
* OTP abuse

Simulators validate:

* Risk accumulation
* Risk decay
* Decision correctness
* Enforcement behavior

---

## Technology Stack

### Backend

* Python 3.13
* FastAPI
* SQLite
* Sliding-window detection engine

### Enforcement

* Go
* TTL-based block store
* Token-bucket rate limiting

### Frontend

* React
* TypeScript
* Vite
* TailwindCSS

---

## API Surface

```http
POST /events/auth        # Event ingestion
GET  /logs/              # Event logs
GET  /blocks/            # Active enforcement
GET  /dashboard/         # Summary stats
GET  /dashboard/metrics  # Aggregated metrics
GET  /settings/          # Runtime mode
POST /settings/mode      # Update fail mode
```

---

## Project Status

**AuthGuard v2 is functionally complete.**

### Implemented

* Detection engine
* Risk modeling
* Decision engine
* Campaign correlation
* Enforcement
* Alerting
* Observability
* Simulators
* Operator dashboards

### Optional Enhancements

* Dashboard authentication
* Container hardening
* Deployment manifests
* Distributed state backends

These are **not required for correctness**.

---

## Repository Structure

```
AuthGuard/
├── backend/
│   ├── api/
│   ├── detection/
│   ├── alerting/
│   ├── storage/
│   └── simulators/
├── ratelimiter/        # Go enforcement service
├── frontend/
├── docs/
└── docker-compose.yml
```

---

## License

MIT

---

## Final Note

AuthGuard is designed to reflect **how real security systems are built**:

* Predictable behavior
* Explainable decisions
* Safe failure modes
* Clean separation of concerns

This project is suitable as:

* A portfolio centerpiece
* A security engineering case study
* A foundation for real deployment

---

