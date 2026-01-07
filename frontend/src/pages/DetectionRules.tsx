import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import { apiGet, apiPost } from "../services/api";

type Rule = {
  enabled: boolean;
  threshold: number;
};

type RulesResponse = {
  rules: Record<string, Rule>;
};

export default function DetectionRules() {
  const [rules, setRules] = useState<Record<string, Rule>>({});
  const [loading, setLoading] = useState(true);

  const fetchRules = async () => {
    const data = await apiGet<RulesResponse>("/rules");
    setRules(data.rules);
    setLoading(false);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const toggleRule = async (name: string, enabled: boolean) => {
    await apiPost(
      enabled
        ? `/rules/disable/${name}`
        : `/rules/enable/${name}`
    );
    fetchRules();
  };

  const updateThreshold = async (name: string, value: number) => {
    await apiPost(`/rules/threshold/${name}`, {
      threshold: value,
    });
    fetchRules();
  };

  if (loading) {
    return <div className="text-neutral-400">Loading rules…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Detection Rules</h1>
        <p className="text-sm text-neutral-400">
          Configure detection thresholds and rule states.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(rules).map(([name, rule]) => (
          <Card key={name} title={name}>
            <div className="space-y-3">
              {/* Enabled toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  Status:{" "}
                  <span
                    className={
                      rule.enabled
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {rule.enabled ? "ENABLED" : "DISABLED"}
                  </span>
                </span>

                <button
                  onClick={() => toggleRule(name, rule.enabled)}
                  className="rounded bg-neutral-800 px-3 py-1 text-xs hover:bg-neutral-700"
                >
                  {rule.enabled ? "Disable" : "Enable"}
                </button>
              </div>

              {/* Threshold */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-neutral-400">
                  Threshold
                </label>

                <input
                  type="number"
                  value={rule.threshold}
                  min={1}
                  className="w-20 rounded bg-neutral-900 border border-neutral-700 px-2 py-1 text-sm"
                  onChange={(e) =>
                    setRules({
                      ...rules,
                      [name]: {
                        ...rule,
                        threshold: Number(e.target.value),
                      },
                    })
                  }
                />

                <button
                  onClick={() =>
                    updateThreshold(name, rule.threshold)
                  }
                  className="rounded bg-blue-600 px-3 py-1 text-xs hover:bg-blue-500"
                >
                  Save
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
