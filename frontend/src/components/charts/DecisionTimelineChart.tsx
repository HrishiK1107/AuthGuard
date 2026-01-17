import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type TimelinePoint = {
  time: string;
  ALLOW: number;
  CHALLENGE: number;
  BLOCK: number;
};

export default function DecisionTimelineChart({
  data,
}: {
  data: TimelinePoint[];
}) {
  if (!data.length) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-500 italic">
        No timeline data
      </div>
    );
  }

  return (
    // IMPORTANT: no flex centering here, let chart fill container
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 12, right: 20, left: 0, bottom: 0 }}
        >
          {/* =====================
              GRADIENT DEFINITIONS
          ===================== */}
          <defs>
            {/* LOW / ALLOW */}
            <linearGradient id="allowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.75} />
              <stop offset="70%" stopColor="#22c55e" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0.12} />
            </linearGradient>

            {/* MEDIUM / CHALLENGE */}
            <linearGradient id="challengeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.75} />
              <stop offset="70%" stopColor="#f59e0b" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.12} />
            </linearGradient>

            {/* HIGH / BLOCK */}
            <linearGradient id="blockGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="70%" stopColor="#ef4444" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.14} />
            </linearGradient>
          </defs>

          {/* =====================
              AXES
          ===================== */}
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: "#888" }}
            axisLine={false}
            tickLine={false}
            minTickGap={16}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#888" }}
            axisLine={false}
            tickLine={false}
            width={28}
          />

          {/* =====================
              TOOLTIP (SMOOTH HOVER)
          ===================== */}
          <Tooltip
            isAnimationActive={false}
            cursor={{ stroke: "#666", strokeDasharray: "3 3" }}
            contentStyle={{
              backgroundColor: "#0b0b0b",
              border: "1px solid #333",
              borderRadius: "6px",
              fontSize: "12px",
            }}
            labelStyle={{
              color: "#aaa",
              marginBottom: 6,
            }}
          />

          {/* =====================
              AREAS (TREND LINES)
          ===================== */}
          <Area
            type="monotone"
            dataKey="ALLOW"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#allowGradient)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            isAnimationActive={false}
          />

          <Area
            type="monotone"
            dataKey="CHALLENGE"
            stroke="#f59e0b"
            strokeWidth={2}
            fill="url(#challengeGradient)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            isAnimationActive={false}
          />

          <Area
            type="monotone"
            dataKey="BLOCK"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#blockGradient)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
