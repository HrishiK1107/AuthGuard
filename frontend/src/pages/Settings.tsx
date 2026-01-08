import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import { apiGet } from "../services/api";

type SettingsResponse = {
  mode: "fail-open" | "fail-closed";
  enforcement_timeout_seconds: number;
  block_ttl_seconds: number;
  rate_limiter: {
    type: string;
    language: string;
    port: number;
  };
};

export default function Settings() {
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [enforcerUp, setEnforcerUp] = useState<boolean>(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await apiGet<SettingsResponse>("/settings");
      setSettings(data);
    };

    const checkEnforcer = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 500);

  try {
    await fetch("http://localhost:8081/health", {
      signal: controller.signal,
    });
    setEnforcerUp(true);
  } catch {
    setEnforcerUp(false);
  } finally {
    clearTimeout(timeoutId);
  }
};


    fetchSettings();
    checkEnforcer();

    const interval = setInterval(() => {
      fetchSettings();
      checkEnforcer();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!settings) {
    return <div className="text-neutral-400">Loading settings…</div>;
  }

  const defenseLabel =
    settings.mode === "fail-closed" ? "ACTIVE" : "MONITOR";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">System Settings</h1>
        <p className="text-sm text-neutral-400">
          Enforcement configuration and runtime status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Defense Mode">
          <span
            className={`text-2xl font-bold ${
              defenseLabel === "ACTIVE"
                ? "text-green-500"
                : "text-yellow-400"
            }`}
          >
            {defenseLabel}
          </span>
        </Card>

        <Card title="Enforcer Status">
          <span
            className={`text-2xl font-bold ${
              enforcerUp ? "text-green-500" : "text-red-500"
            }`}
          >
            {enforcerUp ? "UP" : "DOWN"}
          </span>
        </Card>

        <Card title="Block TTL (seconds)">
          <span className="text-2xl font-bold">
            {settings.block_ttl_seconds}
          </span>
        </Card>

        <Card title="Enforcement Timeout (seconds)">
          <span className="text-2xl font-bold">
            {settings.enforcement_timeout_seconds}
          </span>
        </Card>

        <Card title="Rate Limiter Type">
          <span className="text-lg font-mono">
            {settings.rate_limiter.type}
          </span>
        </Card>

        <Card title="Rate Limiter Runtime">
          <div className="text-sm space-y-1">
            <div>Language: {settings.rate_limiter.language}</div>
            <div>Port: {settings.rate_limiter.port}</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
