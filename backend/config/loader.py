from pathlib import Path
from typing import Dict, Any
import yaml


CONFIG_DIR = Path(__file__).resolve().parent
DEFAULTS_FILE = CONFIG_DIR / "defaults.yaml"


class ConfigError(Exception):
    """Raised when AuthGuard configuration is invalid."""
    pass


class AuthGuardConfig:
    """
    Read-only AuthGuard configuration object.
    """

    def __init__(self, raw: Dict[str, Any]):
        self._raw = raw

    def get(self, *keys, default=None):
        """
        Safe nested getter.
        Example:
            config.get("signals", "failed_login_velocity", "threshold")
        """
        node = self._raw
        for key in keys:
            if not isinstance(node, dict) or key not in node:
                return default
            node = node[key]
        return node

    def as_dict(self) -> Dict[str, Any]:
        """
        Return full config (read-only use).
        """
        return dict(self._raw)


def _validate_config(cfg: Dict[str, Any]) -> None:
    """
    Minimal explicit validation.
    Fail fast on broken configs.
    """

    required_top_level = [
        "authguard",
        "detection",
        "signals",
        "risk_engine",
        "decision_policy",
        "alerting",
    ]

    for key in required_top_level:
        if key not in cfg:
            raise ConfigError(f"Missing required config section: '{key}'")

    if cfg["authguard"].get("version") != "v2":
        raise ConfigError("authguard.version must be 'v2'")

    if not isinstance(cfg["signals"], dict) or not cfg["signals"]:
        raise ConfigError("signals section must define at least one signal")

    if cfg["risk_engine"].get("max_risk") is None:
        raise ConfigError("risk_engine.max_risk is required")

    if cfg["decision_policy"].get("block_threshold") is None:
        raise ConfigError("decision_policy.block_threshold is required")


def load_config() -> AuthGuardConfig:
    """
    Load and validate AuthGuard configuration.
    Called once at startup.
    """

    if not DEFAULTS_FILE.exists():
        raise ConfigError(f"Missing config file: {DEFAULTS_FILE}")

    try:
        with open(DEFAULTS_FILE, "r") as f:
            raw = yaml.safe_load(f) or {}
    except Exception as e:
        raise ConfigError(f"Failed to read config: {e}")

    if not isinstance(raw, dict):
        raise ConfigError("Config root must be a mapping")

    _validate_config(raw)

    return AuthGuardConfig(raw)
