import { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase/config'
import toast from 'react-hot-toast'

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  opacity: Math.random() * 0.5 + 0.1,
  duration: Math.random() * 8 + 4,
}))

export default function Login() {
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
      toast.success('Welcome to NeuroCode AI!')
    } catch (error) {
      console.error(error)
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.8) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neural-600/10 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-600/5 rounded-full blur-[60px]" />

        {/* Floating particles */}
        {PARTICLES.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full bg-neural-400"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animation: `float ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.id * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="glass-bright rounded-2xl p-8 shadow-glow-lg">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-neural-600 to-purple-600 shadow-glow mb-4 animate-float">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                <circle cx="20" cy="20" r="8" fill="rgba(255,255,255,0.15)" />
                <circle cx="20" cy="20" r="4" fill="white" />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                  <line
                    key={i}
                    x1={20 + Math.cos(angle * Math.PI / 180) * 10}
                    y1={20 + Math.sin(angle * Math.PI / 180) * 10}
                    x2={20 + Math.cos(angle * Math.PI / 180) * 16}
                    y2={20 + Math.sin(angle * Math.PI / 180) * 16}
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity={i % 2 === 0 ? 1 : 0.5}
                  />
                ))}
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-white mb-1">
              Neuro<span className="text-neural-400">Code</span>
              <span className="text-xs align-top ml-1 text-neural-500 font-mono">AI</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Understand code. Learn faster. Think deeper.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {['Line-by-line AI', 'Confusion Detection', 'Complexity Analysis', 'Learning Insights'].map(f => (
              <span key={f} className="text-xs px-3 py-1 rounded-full bg-neural-900/60 border border-neural-700/40 text-neural-300">
                {f}
              </span>
            ))}
          </div>

          {/* Login button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl
              bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20
              text-white font-medium transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-neural-400/30 border-t-neural-400 rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-500 mt-6">
            By signing in, you agree to our terms of service.<br />
            Your code is processed securely.
          </p>
        </div>

        {/* Bottom tagline */}
        <p className="text-center text-slate-600 text-xs mt-6 font-mono">
          POWERED BY AWS BEDROCK + FIREBASE
        </p>
      </div>
    </div>
  )
}
