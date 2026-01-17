import * as Recharts from "recharts";

/**
 * Local JSX coercion for broken Recharts typings.
 * Runtime behavior unchanged.
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
    { level: "LOW", value: data.low, fill: "#22c55e" },
    { level: "MEDIUM", value: data.medium, fill: "#f59e0b" },
    { level: "HIGH", value: data.high, fill: "#ef4444" },
  ];

  return (
    <div
      className="w-full"
      style={{
        height: 140,
        overflow: "hidden", // 🔒 clamp SVG
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 4,
            right: 24, // ⬅️ CRITICAL: prevents right-side bleed
            left: 16,
            bottom: 4,
          }}
        >
          <XAxis type="number" hide domain={[0, 100]} />
          <YAxis
            type="category"
            dataKey="level"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            width={70}
          />

          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{
              backgroundColor: "#0b0b0b",
              border: "1px solid #2a2a2a",
              borderRadius: "6px",
              fontSize: "12px",
            }}
          />

          <Bar
            dataKey="value"
            radius={[999, 999, 999, 999]}
            isAnimationActive={false}
          >
            {chartData.map((entry, idx) => (
              <Recharts.Cell key={idx} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
