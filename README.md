# AuthGuard

### Behavior-Based Authentication Abuse Detection & Enforcement System

AuthGuard is a **real-time authentication abuse detection system** designed to identify, score, and mitigate malicious login behavior using **behavioral signals and time-decayed risk modeling**.

It focuses on **correctness, explainability, and operational safety**, rather than static rate limits or opaque machine-learning models.

---

## Visual Documentation

<img width="1898" height="860" alt="2026-01-11 13 34 06" src="https://github.com/user-attachments/assets/d36d41d7-298e-4604-b2f5-a8169dc93998" />
<img width="1896" height="936" alt="2026-01-12 00 35 09" src="https://github.com/user-attachments/assets/15cd741f-c61c-4a48-9c47-159d451007a2" />
<img width="1560" height="576" alt="2026-01-12 00 36 24" src="https://github.com/user-attachments/assets/004d4cf5-0b77-4fe0-9399-873e37cb3ae7" />

---

## Overview

Authentication endpoints are a primary attack surface for:

* Brute-force attacks
* Credential stuffing
* OTP abuse
* Distributed login abuse

AuthGuard observes authentication activity, evaluates behavioral patterns over time, and produces **deterministic, explainable enforcement decisions**.

Decisions are temporary, reversible, and resilient to infrastructure failures.

---

## System Architecture

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

## Core Capabilities

* **Behavior-based detection** (not request-counting)
* **Time-decayed risk scoring**
* **Explainable decisions**
* **TTL-based enforcement**
* **Fail-open / fail-closed modes**
* **Read-only operational dashboards**
* **Built-in attack simulators**

---

## Detection Model

AuthGuard evaluates authentication events using multiple independent signals:

### Implemented Signals

* **Failed Login Velocity**
  Detects rapid authentication failures from a single entity.

* **IP Fan-Out**
  Detects a single IP targeting many users.

* **User Fan-In**
  Detects a single user being targeted from many IPs.

Each signal:

* Uses a sliding time window
* Emits a bounded score
* Naturally decays over time

Signals are **composable** and **independent**.

---

## Risk Engine

Instead of permanent counters, AuthGuard maintains **time-decayed risk per entity**.

Key properties:

* Risk increases with suspicious behavior
* Risk decays when traffic stops
* Sustained attacks overpower decay
* Normal traffic naturally recovers

Final risk is calculated using the **maximum effective risk** across relevant entities (IP or user).

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
* Enforcement telemetry

---

## Enforcement Architecture

AuthGuard **does not enforce blocks directly**.

Enforcement is delegated to a **separate Go service** to ensure:

* Isolation
* Reliability
* Clear ownership boundaries

### Enforcement Characteristics

* TTL-based blocking
* Automatic unblock after expiry
* Block replay on restart
* Independent failure handling

### Failure Modes

* **Fail-Open**: degrade to CHALLENGE if enforcement is unavailable
* **Fail-Closed**: continue blocking even if enforcement fails

The mode is runtime-configurable.

---

## Alerting

Alerts are generated when:

* An entity is blocked
* Suspicious behavior persists over time

Alerting is:

* Webhook-based
* Non-blocking
* Failure-tolerant

Alert failures **never impact authentication flow**.

---

## Observability

AuthGuard provides structured observability through:

* Persistent event logging
* Decision explanations
* Enforcement telemetry
* Read-only dashboards

### Dashboard Capabilities

* Total and blocked event counts
* Mitigation rate
* Decision timelines
* Risk distribution
* Threat feed (recent blocks)
* Top risky entities

> Dashboards are intentionally read-only to prevent operational mistakes.

---

## Built-In Simulators

AuthGuard includes attack simulators that exercise the **same ingest pipeline as real traffic**:

* Brute-force simulation
* Credential stuffing
* OTP abuse

These simulators validate:

* Risk accumulation
* Risk decay
* Decision correctness
* Enforcement behavior

---

Detection and enforcement are **intentionally decoupled**.

---

## Technology Stack

### Backend

* Python 3.13
* FastAPI
* SQLite
* Sliding-window detection engine

### Enforcement

* Go
* Token-bucket rate limiting
* TTL-based block store

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
GET  /blocks/            # Active blocks
GET  /dashboard/         # Summary stats
GET  /dashboard/metrics  # Aggregated metrics
GET  /settings/          # Runtime mode
POST /settings/mode      # Update fail mode
```

---

## Project Status

**AuthGuard is functionally complete.**

### Implemented

* Detection engine
* Risk modeling
* Decision engine
* Enforcement
* Alerting
* Observability
* Simulators
* Dashboard

### Optional Enhancements

* Authentication on dashboards
* Container hardening
* Deployment manifests
* Cloud-native persistence

None of these are required for correctness.

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


### Final Note

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

