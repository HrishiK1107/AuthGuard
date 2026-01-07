import { useEffect, useState } from "react";
import { apiGet } from "../services/api";

type Block = {
  entity: string;
  reason: string;
  expires_in: number | null;
};

export default function ActiveBlocks() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ blocks: Block[] }>("/blocks/")
      .then((data) => {
        setBlocks(data.blocks ?? []);
        setError(null);
      })
      .catch(() => {
        setError("Enforcement service unavailable");
        setBlocks([]);
      });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Active Blocks</h1>

      <p className="text-sm text-neutral-400">
        Entities currently blocked by enforcement.
      </p>

      {error ? (
        <div className="rounded border border-red-800 bg-red-900/20 p-4 text-red-400">
          {error}
        </div>
      ) : (
        <div className="overflow-hidden rounded border border-neutral-800">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900 text-neutral-400">
              <tr>
                <th className="px-4 py-2 text-left">Entity</th>
                <th className="px-4 py-2 text-left">Reason</th>
                <th className="px-4 py-2 text-left">Remaining</th>
              </tr>
            </thead>

            <tbody>
              {blocks.map((block, i) => (
                <tr
                  key={i}
                  className="border-t border-neutral-800 hover:bg-neutral-900"
                >
                  <td className="px-4 py-2 font-mono">
                    {block.entity}
                  </td>

                  <td className="px-4 py-2 text-red-400">
                    {block.reason}
                  </td>

                  <td className="px-4 py-2">
                    {block.expires_in
                      ? `${block.expires_in}s`
                      : "Permanent"}
                  </td>
                </tr>
              ))}

              {blocks.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-6 text-center text-neutral-500 italic"
                  >
                    No active blocks
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
