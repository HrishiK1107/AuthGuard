import * as Recharts from "recharts";
import React from "react";

/**
 * Local JSX coercion for broken Recharts typings.
 * This does NOT affect runtime behavior.
 */
const Tooltip = Recharts.Tooltip as unknown as React.FC<any>;
const Bar = Recharts.Bar as unknown as React.FC<any>;
const BarChart = Recharts.BarChart as unknown as React.FC<any>;
const ResponsiveContainer =
  Recharts.ResponsiveContainer as unknown as React.FC<any>;
const XAxis = Recharts.XAxis as unknown as React.FC<any>;
const YAxis = Recharts.YAxis as unknown as React.FC<any>;

type RiskDistribution = {
  low: number;
  medium: number;
  high: number;
};

export default function RiskDistributionChart({
  data,
}: {
  data: RiskDistribution;
}) {
  const chartData = [
    { level: "LOW", value: data.low },
    { level: "MEDIUM", value: data.medium },
    { level: "HIGH", value: data.high },
  ];

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="level"
            tick={{ fontSize: 12 }}
            stroke="#666"
          />

          <Tooltip />

          <Bar
            dataKey="value"
            radius={[4, 4, 4, 4]}
            isAnimationActive={false}
            fill="#22c55e"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
  