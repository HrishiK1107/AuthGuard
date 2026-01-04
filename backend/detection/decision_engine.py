from enum import Enum
from typing import Dict


class Decision(Enum):
    ALLOW = "ALLOW"
    MONITOR = "MONITOR"
    CHALLENGE = "CHALLENGE"
    BLOCK = "BLOCK"


class DecisionEngine:
    """
    Maps risk scores to enforcement decisions.
    """

    def __init__(
        self,
        monitor_threshold: float = 10,
        challenge_threshold: float = 25,
        block_threshold: float = 50
    ):
        self.monitor_threshold = monitor_threshold
        self.challenge_threshold = challenge_threshold
        self.block_threshold = block_threshold

    def decide(self, risk_score: float) -> Dict[str, str]:
        """
        Decide action based on current risk score.
        """
        if risk_score >= self.block_threshold:
            return {
                "decision": Decision.BLOCK.value,
                "reason": f"Risk score {risk_score} exceeds block threshold"
            }

        if risk_score >= self.challenge_threshold:
            return {
                "decision": Decision.CHALLENGE.value,
                "reason": f"Risk score {risk_score} requires verification"
            }

        if risk_score >= self.monitor_threshold:
            return {
                "decision": Decision.MONITOR.value,
                "reason": f"Risk score {risk_score} indicates suspicious behavior"
            }

        return {
            "decision": Decision.ALLOW.value,
            "reason": "Risk score within safe range"
        }
