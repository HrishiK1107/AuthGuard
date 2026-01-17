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
      <div className="h-48 flex items-center justify-center text-neutral-500 italic">
        No timeline data
      </div>
    );
  }

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#666" />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#666" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f0f0f",
              border: "1px solid #333",
              fontSize: "12px",
            }}
          />

          <Area
            type="monotone"
            dataKey="ALLOW"
            stroke="#22c55e"
            fill="#22c55e"
            fillOpacity={0.25}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="CHALLENGE"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.25}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="BLOCK"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.3}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
