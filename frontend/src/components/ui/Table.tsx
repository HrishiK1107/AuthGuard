type TableProps = {
  headers: string[];
  children: React.ReactNode;
};

export default function Table({ headers, children }: TableProps) {
  return (
    <div className="rounded-2xl border border-[#1f1f1f] bg-[#0b0b0b] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1f1f1f]">
            {headers.map((header) => (
              <th
                key={header}
                className="px-5 py-3 text-left text-[12px] font-semibold tracking-wide uppercase text-neutral-400"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#141414]">
          {children}
        </tbody>
      </table>
    </div>
  );
}
