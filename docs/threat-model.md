# AuthGuard — Threat Model

## 1. Scope & Purpose

This document describes the **threat model for AuthGuard v2**, focusing on:

- What AuthGuard is designed to protect
- What threats it explicitly mitigates
- What threats are out of scope by design
- How architectural decisions reduce risk

AuthGuard is a **defensive security control**, not an authentication system, identity provider, or IAM replacement.

---

## 2. System Boundary

AuthGuard operates **adjacent to authentication systems**, not inside them.

### In Scope
- Authentication event ingestion
- Behavioral detection and correlation
- Risk scoring and decision-making
- Enforcement delegation
- Operator observability

### Out of Scope
- Credential storage or validation
- Identity lifecycle management
- Session management
- MFA implementation

AuthGuard assumes an **upstream authentication provider** already exists.

---

## 3. Assets to Protect

AuthGuard protects **system integrity and availability**, not secrets.

Primary assets:

- Authentication availability
- User accounts (from abuse)
- Enforcement correctness
- Operational visibility
- Decision integrity

Secondary assets:

- Event logs
- Detection state
- Campaign attribution data

---

## 4. Threat Actors

AuthGuard models the following attacker classes:

### 4.1 External Attackers
- Credential stuffing bots
- Brute-force attackers
- Distributed login abuse
- OTP abuse automation

### 4.2 Low-Sophistication Attackers
- Scripted tools
- Reused credential lists
- Single-IP attacks

### 4.3 Adaptive Adversaries
- IP rotation
- Low-and-slow attempts
- Timing-based evasion

### 4.4 Accidental Misuse
- Misconfigured clients
- High retry rates from legitimate users
- Load-testing artifacts

---

## 5. Primary Threats & Mitigations

### 5.1 Brute-Force Attacks

**Threat**
- Rapid authentication failures against one or more accounts

**Mitigation**
- Failed login velocity signal
- Sliding time windows
- Risk accumulation
- TTL-based blocking

---

### 5.2 Credential Stuffing

**Threat**
- Single IP targeting many users

**Mitigation**
- IP fan-out signal
- Campaign correlation
- Sustained risk escalation

---

### 5.3 Account Takeover via Distributed Sources

**Threat**
- Many IPs attacking one user

**Mitigation**
- User fan-in signal
- Cross-entity aggregation
- Risk persistence across IP rotation

---

### 5.4 Low-and-Slow Evasion

**Threat**
- Attempts spaced to avoid static thresholds

**Mitigation**
- Time-decayed risk (not counters)
- Sliding window evaluation
- Risk accumulation across windows

---

### 5.5 Infrastructure Restart Abuse

**Threat**
- Attackers exploiting restarts to bypass enforcement

**Mitigation**
- Persistent block storage
- Block replay on startup
- Restart-resilient enforcement

---

### 5.6 Enforcement Service Failure

**Threat**
- Rate limiter crash or network failure

**Mitigation**
- Fail-open / fail-closed modes
- Detection continues independently
- Enforcement failure never crashes ingest

---

## 6. Threats Explicitly Not Mitigated

AuthGuard **does not attempt to solve**:

- Password guessing correctness
- Credential theft
- Malware-based account compromise
- MFA bypass vulnerabilities
- Insider threats
- Session hijacking

These are intentionally out of scope.

---

## 7. Trust Assumptions

AuthGuard assumes:

- The upstream authentication system is authoritative
- Events are eventually delivered (not necessarily ordered)
- Operators have trusted access to dashboards
- Infrastructure-level security (TLS, auth) exists outside AuthGuard

Violating these assumptions is outside this threat model.

---

## 8. Abuse of AuthGuard Itself

### 8.1 Event Flooding

**Threat**
- Attackers flooding `/events/auth`

**Mitigation**
- Stateless ingest
- Lightweight parsing
- Detection cost bounded by sliding windows

---

### 8.2 Poisoned Input

**Threat**
- Malformed timestamps, entities, or payloads

**Mitigation**
- Canonical event normalization
- Defensive parsing
- Rejection of invalid events

---

### 8.3 Dashboard Abuse

**Threat**
- Operator UI misuse

**Mitigation**
- Read-only dashboards
- No state mutation from UI

---

## 9. Observability as a Security Control

AuthGuard treats **observability as defense**.

Operators can:
- Inspect decisions
- Trace triggered signals
- Correlate campaigns
- Audit enforcement

This reduces:
- False positives
- Silent failures
- Operator-induced outages

---

## 10. Residual Risk

No security system is perfect.

Residual risks include:
- Highly distributed botnets
- Credential reuse outside AuthGuard visibility
- Attacks below detection thresholds

These are accepted trade-offs.

---

## 11. Design Philosophy

AuthGuard’s threat model prioritizes:

- Explainability over opacity
- Safety over aggressiveness
- Correctness over coverage
- Determinism over ML heuristics

---

## 12. Summary

AuthGuard is designed to **reduce authentication abuse risk**, not eliminate all threats.

Its threat model reflects:
- Real attacker behavior
- Real operational constraints
- Real production trade-offs

This document defines what AuthGuard protects — and just as importantly — what it does not.
