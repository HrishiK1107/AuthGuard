import type { ReactNode } from "react";

type Tone = "neutral" | "low" | "medium" | "high";

type CardProps = {
  title: string;
  value?: string;
  tone?: Tone;
  height?: string;
  children?: ReactNode;
};

const toneStyles: Record<Tone, string> = {
  neutral: "text-white",
  low: "text-green-400",
  medium: "text-yellow-400",
  high: "text-red-400",
};

export default function Card({
  title,
  value,
  tone = "neutral",
  height,
  children,
}: CardProps) {
  return (
    <div
      className={`rounded border border-neutral-800 bg-neutral-900 p-4 ${
        height ?? ""
      }`}
    >
      <div className="text-sm text-neutral-400 mb-2">{title}</div>

      {/* Old style (value-based) */}
      {value && (
        <div className={`text-3xl font-semibold ${toneStyles[tone]}`}>
          {value}
        </div>
      )}

      {/* New style (children-based) */}
      {children}
    </div>
  );
}
