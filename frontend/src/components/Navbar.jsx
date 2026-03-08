export default function Navbar() {
  return (
    <nav className="h-14 glass border-b border-neural-800/40 flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neural-600 to-purple-600 flex items-center justify-center shadow-glow">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <circle cx="12" cy="12" r="5" fill="rgba(255,255,255,0.2)" />
            <circle cx="12" cy="12" r="2.5" fill="white" />
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <line
                key={i}
                x1={12 + Math.cos(deg * Math.PI / 180) * 6}
                y1={12 + Math.sin(deg * Math.PI / 180) * 6}
                x2={12 + Math.cos(deg * Math.PI / 180) * 10}
                y2={12 + Math.sin(deg * Math.PI / 180) * 10}
                stroke="white" strokeWidth="1.5" strokeLinecap="round"
                opacity={0.7}
              />
            ))}
          </svg>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-bold text-white tracking-tight">
            Neuro<span className="text-neural-400">Code</span>
          </span>
          <span className="text-xs font-mono text-neural-600 font-semibold">AI</span>
        </div>

        {/* Status pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/30 border border-emerald-700/30">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Live</span>
        </div>
      </div>

      {/* User */}
      <div className="flex items-center gap-2.5 px-3 py-1.5">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neural-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
          G
        </div>
        <div className="hidden md:block text-left">
          <div className="text-xs font-medium text-slate-200 leading-none">
            Guest
          </div>
        </div>
      </div>
    </nav>
  )
}
