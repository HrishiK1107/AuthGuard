# Detection Logic — AuthGuard v2

This document describes **how AuthGuard detects authentication abuse**, from raw events
to final enforcement decisions.

It focuses on **behavioral signals, time-based analysis, risk aggregation, and
controlled escalation**, not static thresholds or machine learning models.

---

## 1. Detection Philosophy

AuthGuard is built on a single principle:

> **Authentication abuse is behavioral, not event-based.**

A single failed login is not malicious.  
A *pattern* of failures over time is.

Therefore:
- Detection is **stateful**
- Decisions are **derived from behavior**
- Enforcement is **temporary and reversible**

---

## 2. Signal Types

Signals are independent detectors that observe **specific behavioral patterns**.

Each signal:
- Operates on a sliding time window
- Emits a bounded risk contribution
- Is evaluated independently of other signals

### 2.1 Failed Login Velocity

**What it detects**
- Rapid authentication failures from the same entity

**Entity scope**
- IP address
- Username (depending on configuration)

**Behavioral pattern**
- Many failures in a short period
- Low inter-request interval

**Why it matters**
- Classic brute-force behavior
- High confidence signal with low false positives

---

### 2.2 IP Fan-Out

**What it detects**
- One IP attempting authentication for many different users

**Entity scope**
- Source IP

**Behavioral pattern**
- Broad targeting
- Credential stuffing attempts

**Why it matters**
- Detects attacks even with partial success
- Resistant to password reuse noise

---

### 2.3 User Fan-In

**What it detects**
- One user targeted from many IPs

**Entity scope**
- Username

**Behavioral pattern**
- Distributed login attempts
- Botnets or IP rotation

**Why it matters**
- Defeats simple per-IP rate limits
- Captures coordinated attacks

---

## 3. Sliding Window Logic

All signals use **sliding time windows**.

### How windows work

- Events are stored with timestamps
- Old events expire naturally
- Evaluation always considers “now − window_size”

### Why sliding windows

- Preserve temporal structure
- Prevent wait-and-reset evasion
- Enable burst detection
- Allow gradual recovery

Counters are never reset abruptly; they decay naturally.

---

## 4. Risk Scoring Model

AuthGuard models risk as a **continuous value**, not a binary flag.

### Key properties

- Risk **increases** with suspicious behavior
- Risk **decays** when activity stops
- Multiple signals can stack
- Risk is entity-scoped

### Decay behavior

- Decay is time-based, not event-based
- Sustained attacks overpower decay
- Benign traffic recovers naturally

Risk decay prevents:
- Permanent punishment
- Over-blocking
- Long-lived false positives

---

## 5. Risk Aggregation

Each signal emits an independent score.

AuthGuard aggregates risk by:

- Tracking risk per entity (IP / user)
- Selecting the **maximum effective risk**
- Avoiding averaging that hides spikes

This ensures:
- The worst behavior dominates decisions
- One strong signal is not diluted by weak ones

---

## 6. Decision Thresholds

Risk is mapped deterministically to decisions.

| Risk Level | Decision  |
|------------|-----------|
| Low        | ALLOW     |
| Medium     | CHALLENGE |
| High       | BLOCK     |

### Important properties

- Thresholds are explicit
- No randomness
- No probabilistic decisions
- Same input → same output

This guarantees explainability and auditability.

---

## 7. Decision Engine Semantics

The decision engine is **pure logic**.

It:
- Accepts current risk state
- Maps risk to a decision
- Emits metadata (risk score, signals)

It does **not**:
- Perform I/O
- Enforce blocks
- Modify state

This separation prevents cascading failures.

---

## 8. Enforcement Escalation

Enforcement is **progressive and temporary**.

### Escalation path

1. `ALLOW` — normal behavior
2. `CHALLENGE` — suspicious but recoverable
3. `BLOCK` — high confidence abuse

### Enforcement characteristics

- TTL-based
- Automatically expires
- Reversible via operator action
- Persisted for restart recovery

AuthGuard never permanently blocks by default.

---

## 9. Campaign-Level Correlation (v2)

AuthGuard v2 introduces **campaign correlation**.

Campaigns group:
- Related events
- Across time
- Across entities
- Under a single abuse narrative

Campaigns do **not** enforce directly.

They exist to:
- Improve operator understanding
- Correlate sustained abuse
- Provide forensic context

---

## 10. False Positives & Controls

False positives are treated as a **first-class concern**.

### Built-in controls

- Time-based decay
- Sliding windows
- Progressive escalation
- TTL-based enforcement
- Manual overrides

### Benign behavior handling

- Human-like timing
- Limited retries
- Natural recovery

These patterns decay risk instead of escalating it.

---

## 11. Explainability Guarantees

Every decision can be explained using:

- Triggered signals
- Risk score
- Entity context
- Campaign attribution
- Enforcement metadata

There are:
- No black-box models
- No hidden heuristics
- No untraceable decisions

---

## 12. What This Is Not

AuthGuard does **not**:
- Use machine learning
- Predict user intent
- Perform anomaly detection without context
- Replace authentication logic

Detection is **deterministic and behavioral**.

---

## 13. Summary

AuthGuard’s detection logic is designed to be:

- Behavioral
- Stateful
- Deterministic
- Explainable
- Operationally safe

It detects **patterns of abuse**, not individual mistakes,
and escalates **only when confidence is justified**.

This is the core of AuthGuard’s security model.
