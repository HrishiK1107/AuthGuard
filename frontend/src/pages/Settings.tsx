export default function Settings() {
  return (
    <div className="space-y-6 max-w-xl">

      <h1 className="text-lg font-semibold">Settings</h1>

      <div className="rounded border border-neutral-800 bg-neutral-900 p-4 space-y-4">

        <div>
          <label className="block text-sm text-neutral-400 mb-1">
            Threat Preset
          </label>
          <select
            disabled
            className="w-full bg-black border border-neutral-700 rounded px-3 py-2 text-sm"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>Aggressive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-neutral-400 mb-1">
            Risk Decay Rate
          </label>
          <input
            disabled
            type="number"
            className="w-full bg-black border border-neutral-700 rounded px-3 py-2 text-sm"
            placeholder="e.g. 0.85"
          />
        </div>

        <button
          disabled
          className="bg-neutral-800 text-neutral-400 px-4 py-2 rounded text-sm cursor-not-allowed"
        >
          Save Changes
        </button>

      </div>

    </div>
  )
}
