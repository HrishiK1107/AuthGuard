export default function Header() {
  return (
    <div className="h-12 flex items-center justify-between px-6 border-b border-neutral-800 bg-black">
      
      {/* Left: Page context (placeholder for now) */}
      <div className="text-sm text-neutral-400">
        Authentication Abuse Detection System
      </div>

      {/* Right: Status indicators */}
      <div className="flex items-center gap-4 text-sm">
        
        {/* Defense mode */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-neutral-300">Active Defense</span>
        </div>

        {/* Risk badge */}
        <div className="px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-neutral-300">
          Risk: LOW
        </div>

      </div>
    </div>
  )
}
