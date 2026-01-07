type TableProps = {
  headers: string[]
  children: React.ReactNode
}

export default function Table({ headers, children }: TableProps) {
  return (
    <div className="rounded border border-neutral-800 bg-neutral-900 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-neutral-800 text-neutral-400">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-2 text-left font-medium"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
