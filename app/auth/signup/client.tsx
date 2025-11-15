"use client"

import { SignUpForm } from "@/components/auth/signup-form"
import { TrendingUp } from "lucide-react"
import Link from "next/link"

export default function SignUpClientPage() {
  return (
    <div className="min-h-screen overflow-hidden flex flex-col relative" style={{ background: 'linear-gradient(to bottom right, #f0fdfa, #ecfeff, #f0f9ff)' }}>
      {/* Animated Abstract Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Rotating squares with borders */}
        <div className="absolute top-20 right-10 w-32 h-32 border-2 border-cyan-400/40 rounded-lg" style={{ animation: 'float 6s ease-in-out infinite, spin 20s linear infinite' }} />
        <div className="absolute top-40 left-20 w-24 h-24 border-2 border-teal-400/40 rounded-lg" style={{ animation: 'float 8s ease-in-out infinite 1s, spin 15s linear infinite reverse' }} />
        <div className="absolute bottom-32 right-1/4 w-40 h-40 border-2 border-blue-400/30 rounded-lg" style={{ animation: 'float 10s ease-in-out infinite 2s, spin 25s linear infinite' }} />
        <div className="absolute top-1/3 left-1/3 w-20 h-20 border-2 border-cyan-500/35 rounded-lg" style={{ animation: 'float 7s ease-in-out infinite 0.5s, spin 12s linear infinite reverse' }} />
        <div className="absolute bottom-20 left-10 w-36 h-36 border-2 border-teal-500/30 rounded-lg" style={{ animation: 'float 9s ease-in-out infinite 1.5s, spin 18s linear infinite' }} />
        <div className="absolute top-1/2 right-1/3 w-28 h-28 border-2 border-blue-300/40 rounded-lg" style={{ animation: 'float 6s ease-in-out infinite 0.8s, spin 22s linear infinite reverse' }} />
        
        {/* Moving circles */}
        <div className="absolute top-10 left-1/3 w-16 h-16 bg-cyan-300/20 rounded-full" style={{ animation: 'float 8s ease-in-out infinite, moveAround 15s linear infinite' }} />
        <div className="absolute bottom-40 right-20 w-20 h-20 bg-teal-300/20 rounded-full" style={{ animation: 'float 7s ease-in-out infinite 1s, moveAround 18s linear infinite reverse' }} />
        
        {/* Large animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-400/30 rounded-full blur-3xl" style={{ animation: 'float 12s ease-in-out infinite, pulse 4s ease-in-out infinite' }}></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/25 rounded-full blur-3xl" style={{ animation: 'float 15s ease-in-out infinite 2s, pulse 5s ease-in-out infinite 1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl" style={{ animation: 'float 10s ease-in-out infinite 1s, pulse 6s ease-in-out infinite 2s', transform: 'translate(-50%, -50%)' }}></div>
      </div>

      <header className="sticky top-0 z-50 glass-morphism backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-gradient-premium flex items-center justify-center shadow-lg shadow-teal-500/50">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-accent bg-clip-text text-transparent">AI CFO</span>
            </div>
          </Link>
          <Link href="/auth/signin" className="text-primary hover:text-primary/80 font-semibold transition-colors">
            ¿Ya tienes cuenta?
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="card-premium shadow-2xl shadow-teal-500/20">
            <SignUpForm />
          </div>
        </div>
      </div>
    </div>
  )
}
