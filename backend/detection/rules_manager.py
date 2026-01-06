from typing import Dict, Any


class RulesManager:
    """
    Manages enable/disable state and thresholds of detection rules.
    """

    def __init__(self):
        self.rules: Dict[str, Dict[str, Any]] = {
            "failed_login_velocity": {
                "enabled": True,
                "threshold": 5
            },
            "ip_fan_out": {
                "enabled": True,
                "threshold": 4
            },
            "user_fan_in": {
                "enabled": True,
                "threshold": 3
            }
        }

    # -----------------------------
    # Query helpers (USED BY API)
    # -----------------------------

    def get_all_rules(self) -> Dict[str, Dict[str, Any]]:
        """
        Return all rules with status and thresholds.
        """
        return self.rules

    def rule_exists(self, rule_name: str) -> bool:
        """
        Check if rule exists.
        """
        return rule_name in self.rules

    def is_enabled(self, rule_name: str) -> bool:
        """
        Check if a rule is enabled.
        """
        return self.rules.get(rule_name, {}).get("enabled", False)

    def get_threshold(self, rule_name: str) -> int:
        """
        Get threshold for a rule.
        """
        return self.rules.get(rule_name, {}).get("threshold", 0)

    # -----------------------------
    # Mutation helpers (USED BY API)
    # -----------------------------

    def enable(self, rule_name: str) -> None:
        if rule_name in self.rules:
            self.rules[rule_name]["enabled"] = True

    def disable(self, rule_name: str) -> None:
        if rule_name in self.rules:
            self.rules[rule_name]["enabled"] = False

    def update_threshold(self, rule_name: str, value: float) -> None:
        if rule_name in self.rules:
            self.rules[rule_name]["threshold"] = value
