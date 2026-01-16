type Status = "low" | "medium" | "high" | "active" | "blocked";

const styles: Record<Status, string> = {
  low: "bg-[#0b1f14] text-[#6ee7b7] border border-[#14532d]",
  medium: "bg-[#1f160b] text-[#facc15] border border-[#713f12]",
  high: "bg-[#1f0b0b] text-[#f87171] border border-[#7f1d1d]",
  active: "bg-[#0b1420] text-[#93c5fd] border border-[#1e3a8a]",
  blocked: "bg-[#1f0b0b] text-[#f87171] border border-[#7f1d1d]",
};

type StatusBadgeProps = {
  label: string;
  status: Status;
};

export default function StatusBadge({ label, status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-[6px] rounded-full text-[11px] font-semibold tracking-wide uppercase ${styles[status]}`}
    >
      {label}
    </span>
  );
}
