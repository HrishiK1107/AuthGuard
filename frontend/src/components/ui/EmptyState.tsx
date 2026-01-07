type EmptyStateProps = {
  message: string
  colSpan: number
}

export default function EmptyState({ message, colSpan }: EmptyStateProps) {
  return (
    <tr className="border-t border-neutral-800">
      <td
        colSpan={colSpan}
        className="px-4 py-6 text-center text-neutral-500 italic"
      >
        {message}
      </td>
    </tr>
  )
}
