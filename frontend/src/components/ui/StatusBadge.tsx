type Status = 'low' | 'medium' | 'high' | 'active' | 'blocked'

const styles: Record<Status, string> = {
  low: 'bg-green-900 text-green-300',
  medium: 'bg-yellow-900 text-yellow-300',
  high: 'bg-red-900 text-red-300',
  active: 'bg-blue-900 text-blue-300',
  blocked: 'bg-red-900 text-red-300',
}

type StatusBadgeProps = {
  label: string
  status: Status
}

export default function StatusBadge({ label, status }: StatusBadgeProps) {
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${styles[status]}`}
    >
      {label}
    </span>
  )
}
