# Attack Scenarios

This document describes realistic authentication abuse scenarios that AuthGuard is designed to detect, score, and mitigate.

The goal is to demonstrate **behavioral coverage**, not hypothetical exploits.

---

## 1. Brute Force Login Attack

### Scenario
An attacker repeatedly attempts to authenticate against the `/login` endpoint using different passwords for a single user or IP.

### Observable Signals
- High frequency of failed login attempts
- Repeated failures within a short time window
- Consistent target (same username or IP)

### AuthGuard Detection
- Sliding window counts failed login attempts
- Risk score increases per failure
- Escalation path:
  - ALLOW → CHALLENGE → BLOCK

### Outcome
- Temporary block applied to offending entity
- Event logged with high risk score
- Visible in dashboard threat feed

---

## 2. Credential Stuffing Attack

### Scenario
An attacker uses a leaked credential list to attempt logins across many accounts from a single IP or rotating IPs.

### Observable Signals
- High login attempt volume
- Mixed success and failure patterns
- Broad account targeting

### AuthGuard Detection
- Aggregate request velocity per entity
- Failure-heavy pattern across multiple users
- Risk score accumulates even with partial success

### Outcome
- Entity escalated to CHALLENGE or BLOCK
- Prevents continued credential testing
- Dashboard highlights entity as high-risk

---

## 3. OTP Abuse / OTP Brute Force

### Scenario
An attacker repeatedly submits OTP values to `/otp` endpoints attempting to guess verification codes.

### Observable Signals
- Rapid repeated OTP failures
- Very short inter-request intervals
- Same endpoint repeatedly targeted

### AuthGuard Detection
- Endpoint-specific tracking
- Failure density within sliding window
- Higher risk weight for OTP failures

### Outcome
- Immediate escalation to BLOCK
- OTP abuse surfaced clearly in logs
- Prevents SMS/email OTP exhaustion

---

## 4. Rapid Retry Automation

### Scenario
Automated scripts retry authentication flows aggressively without respecting backoff.

### Observable Signals
- Extremely low request intervals
- Uniform request timing
- Continuous failures

### AuthGuard Detection
- Time-based anomaly detection
- Burst recognition in sliding window
- Rapid risk score growth

### Outcome
- Fast block before resource exhaustion
- Low false-positive risk due to clear automation signature

---

## 5. Distributed Low-and-Slow Attack

### Scenario
An attacker spreads attempts over time to avoid traditional rate limits.

### Observable Signals
- Failures spaced across time
- Sub-threshold request rates
- Persistent low-risk accumulation

### AuthGuard Detection
- Stateful per-entity tracking
- Risk accumulation across windows
- Detection based on behavior, not raw rate

### Outcome
- Gradual escalation instead of instant block
- Avoids missing stealthy attacks
- Demonstrates advantage over static rate limits

---

## 6. Benign User Mistakes (Non-Attack)

### Scenario
A legitimate user mistypes their password multiple times.

### Observable Signals
- Limited number of failures
- Human-like timing
- Eventual success or cessation

### AuthGuard Handling
- Low risk weight per failure
- No aggressive escalation
- Fail-open behavior unless thresholds exceeded

### Outcome
- User experience preserved
- No unnecessary blocks
- Demonstrates false-positive control

---

## 7. Manual Administrator Block

### Scenario
Security operator manually blocks a suspicious entity from the dashboard.

### Observable Signals
- Human-initiated action
- Explicit enforcement request

### AuthGuard Handling
- Manual block overrides detection logic
- Enforcement applied immediately
- Persisted for restart recovery

### Outcome
- Immediate threat containment
- Clear audit trail in logs

---

## Non-Goals & Out-of-Scope Attacks

AuthGuard intentionally does **not** attempt to detect:

- SQL injection
- XSS
- CSRF
- Account takeover via malware
- Session hijacking
- Botnet fingerprinting

These are handled by **other layers** in a defense-in-depth architecture.

---

## Summary

AuthGuard focuses on **authentication abuse**, not generic web attacks.

Its strength lies in:
- Behavioral detection
- Stateful risk accumulation
- Controlled escalation
- Fail-safe enforcement

This makes it effective against real-world attackers while preserving legitimate user experience.
