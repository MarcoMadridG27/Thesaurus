"use client"

import { Loader2 } from "lucide-react"

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #f0fdfa, #ecfeff, #f0f9ff)' }}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 border-2 border-teal-400/40 rounded-lg" style={{ animation: 'float 6s ease-in-out infinite, spin 20s linear infinite' }} />
        <div className="absolute bottom-32 right-32 w-40 h-40 border-2 border-cyan-400/30 rounded-lg" style={{ animation: 'float 10s ease-in-out infinite 2s, spin 25s linear infinite' }} />
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-teal-400/30 rounded-full blur-3xl" style={{ animation: 'float 12s ease-in-out infinite, pulse 4s ease-in-out infinite' }}></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/25 rounded-full blur-3xl" style={{ animation: 'float 15s ease-in-out infinite 2s, pulse 5s ease-in-out infinite 1s' }}></div>
      </div>

      {/* Loading Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative">
          {/* Spinning rings */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
            <div className="w-24 h-24 border-4 border-transparent border-t-teal-500 border-r-teal-500 rounded-full"></div>
          </div>
          <div className="absolute inset-2 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
            <div className="w-20 h-20 border-4 border-transparent border-b-cyan-500 border-l-cyan-500 rounded-full"></div>
          </div>
          
          {/* Center icon */}
          <div className="w-24 h-24 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">Iniciando sesión</h2>
          <p className="text-slate-600">Preparando tu dashboard...</p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  )
}
