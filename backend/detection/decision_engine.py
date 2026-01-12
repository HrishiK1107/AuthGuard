from enum import Enum
from typing import Dict


class Decision(Enum):
    ALLOW = "ALLOW"
    MONITOR = "MONITOR"
    CHALLENGE = "CHALLENGE"
    BLOCK = "BLOCK"


class DecisionEngine:
    """
    Pure decision engine.

    Maps effective risk score to a decision
    using a policy-defined threshold set.
    """

    def __init__(
        self,
        monitor_threshold: float = 10.0,
        challenge_threshold: float = 25.0,
        block_threshold: float = 50.0,
    ):
        # Policy (immutable after init)
        self._policy = {
            Decision.BLOCK: block_threshold,
            Decision.CHALLENGE: challenge_threshold,
            Decision.MONITOR: monitor_threshold,
        }

    def decide(self, risk_score: float) -> Dict[str, str]:
        """
        Pure mapping: risk_score -> decision.

        No I/O
        No state mutation
        Deterministic output
        """
        if risk_score >= self._policy[Decision.BLOCK]:
            return {
                "decision": Decision.BLOCK.value,
                "reason": f"Risk score {risk_score} exceeds block threshold"
            }

        if risk_score >= self._policy[Decision.CHALLENGE]:
            return {
                "decision": Decision.CHALLENGE.value,
                "reason": f"Risk score {risk_score} requires verification"
            }

        if risk_score >= self._policy[Decision.MONITOR]:
            return {
                "decision": Decision.MONITOR.value,
                "reason": f"Risk score {risk_score} indicates suspicious behavior"
            }

        return {
            "decision": Decision.ALLOW.value,
            "reason": "Risk score within safe range"
        }
