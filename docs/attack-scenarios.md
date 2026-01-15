# Attack Scenarios — AuthGuard v2

This document describes **realistic authentication abuse scenarios** that AuthGuard v2
is designed to **detect, correlate, score, and mitigate**.

The goal is to demonstrate **behavioral coverage and system correctness**, not hypothetical exploits
or vulnerability scanning.

---

## 1. Brute-Force Login Attack

### Scenario
An attacker repeatedly attempts to authenticate against a `/login` endpoint using
different passwords for a single user or IP.

### Observable Behavior
- High frequency of failed login attempts
- Repeated failures within a short time window
- Consistent targeting of a single entity (IP or username)

### AuthGuard Detection
- Failed-login velocity signal triggers
- Sliding window captures burst behavior
- Risk accumulates per entity with time decay

### Decision Path
- `ALLOW` → `CHALLENGE` → `BLOCK`

### Outcome
- Temporary, TTL-based block applied
- Campaign created if behavior persists
- Decision, risk score, and signals visible in dashboards

---

## 2. Credential Stuffing Attack

### Scenario
An attacker uses leaked credentials to attempt logins across many accounts from a single IP
or a rotating set of IPs.

### Observable Behavior
- One IP targeting many users (fan-out)
- Mixed success and failure patterns
- Sustained activity over time

### AuthGuard Detection
- IP fan-out signal triggers
- Risk accumulates even with partial success
- Campaign correlation groups attempts into a single attack narrative

### Outcome
- Escalation to `CHALLENGE` or `BLOCK`
- Campaign visible in Attack Campaigns view
- Prevents large-scale credential testing

---

## 3. OTP Abuse / OTP Brute Force

### Scenario
An attacker repeatedly submits OTP values to verification endpoints attempting to guess codes
or exhaust OTP delivery.

### Observable Behavior
- Rapid OTP failures
- Very low inter-request intervals
- Repeated targeting of OTP endpoints

### AuthGuard Detection
- Endpoint-aware failure tracking
- Higher risk weighting for OTP failures
- Rapid risk escalation due to sensitive flow

### Outcome
- Immediate escalation to `BLOCK`
- OTP abuse surfaced clearly in logs and campaigns
- Prevents SMS/email OTP exhaustion attacks

---

## 4. Rapid Retry Automation

### Scenario
Automated scripts retry authentication flows aggressively without respecting backoff.

### Observable Behavior
- Uniform request timing
- Extremely short inter-request intervals
- Continuous failures without pause

### AuthGuard Detection
- Sliding window burst recognition
- Velocity-based risk increase
- Decay model prevents overreaction to short spikes

### Outcome
- Fast block before infrastructure exhaustion
- Low false-positive rate due to clear automation signature

---

## 5. Distributed Low-and-Slow Attack

### Scenario
An attacker deliberately spreads attempts over time to evade static rate limits.

### Observable Behavior
- Sub-threshold request rates
- Failures spaced across time
- Persistent but subtle malicious intent

### AuthGuard Detection
- Stateful per-entity tracking
- Risk accumulation across sliding windows
- Decay slows escalation but does not reset intent

### Outcome
- Gradual escalation instead of instant block
- Detection of stealthy abuse patterns
- Demonstrates advantage over fixed counters

---

## 6. Coordinated Multi-Entity Campaign (v2)

### Scenario
An attacker runs a sustained attack involving:
- Multiple IPs
- Multiple users
- Mixed endpoints
over an extended time period.

### Observable Behavior
- Repeated suspicious signals across entities
- Temporal clustering of abuse
- Recurrent escalation patterns

### AuthGuard Detection
- Campaign correlation layer links related events
- Decisions aggregated under a campaign ID
- Primary attack vector identified

### Outcome
- Unified campaign view for operators
- Clear attribution of attack scope and severity
- Improved incident understanding without manual correlation

---

## 7. Benign User Mistakes (Non-Attack)

### Scenario
A legitimate user mistypes their password multiple times.

### Observable Behavior
- Small number of failures
- Human-like timing
- Eventual success or cessation

### AuthGuard Handling
- Low risk weight per failure
- Risk decays naturally
- No aggressive escalation

### Outcome
- User experience preserved
- No unnecessary blocks
- Demonstrates false-positive resistance

---

## 8. Manual Administrator Block

### Scenario
A security operator manually blocks a suspicious entity via the Enforcement Control UI.

### Observable Behavior
- Human-initiated override
- Explicit enforcement request

### AuthGuard Handling
- Manual block bypasses detection logic
- Enforcement applied immediately via Go enforcer
- Persisted for restart recovery

### Outcome
- Immediate containment
- Clear audit trail
- Visible in enforcement and logs dashboards

---

## Non-Goals & Out-of-Scope Attacks

AuthGuard intentionally does **not** attempt to detect or mitigate:

- SQL injection
- XSS
- CSRF
- Malware-based account takeover
- Session hijacking
- Botnet fingerprinting
- Network-layer DDoS

These are handled by **other layers** in a defense-in-depth architecture.

---

## Summary

AuthGuard v2 focuses on **authentication abuse**, not generic web attacks.

Its strength lies in:

- Behavioral detection
- Time-decayed risk modeling
- Campaign-level correlation
- Deterministic, explainable decisions
- Safe, reversible enforcement

This makes AuthGuard effective against real-world attackers
while preserving availability and legitimate user experience.
