from enum import Enum
from typing import Dict, Optional

from config.loader import load_config, ConfigError

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
    Config-driven (v2).
    """

    def __init__(
        self,
        monitor_threshold: Optional[float] = None,
        challenge_threshold: Optional[float] = None,
        block_threshold: Optional[float] = None,
    ):
        # Load config safely
        try:
            config = load_config()
            cfg_monitor = config.get("decision_policy", "monitor_threshold")
            cfg_challenge = config.get("decision_policy", "challenge_threshold")
            cfg_block = config.get("decision_policy", "block_threshold")
        except ConfigError:
            cfg_monitor = None
            cfg_challenge = None
            cfg_block = None

        # Preserve existing behavior via fallbacks
        monitor = monitor_threshold or cfg_monitor or 10.0
        challenge = challenge_threshold or cfg_challenge or 25.0
        block = block_threshold or cfg_block or 50.0

        # Policy (immutable after init)
        self._policy = {
            Decision.BLOCK: block,
            Decision.CHALLENGE: challenge,
            Decision.MONITOR: monitor,
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
