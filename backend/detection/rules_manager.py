from typing import Dict


class RulesManager:
    """
    Manages enable/disable state and thresholds of detection rules.
    """

    def __init__(self):
        # Rule configuration store
        self.rules: Dict[str, Dict] = {
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

    def enable_rule(self, rule_name: str) -> None:
        if rule_name in self.rules:
            self.rules[rule_name]["enabled"] = True

    def disable_rule(self, rule_name: str) -> None:
        if rule_name in self.rules:
            self.rules[rule_name]["enabled"] = False

    def update_threshold(self, rule_name: str, value: int) -> None:
        if rule_name in self.rules:
            self.rules[rule_name]["threshold"] = value
