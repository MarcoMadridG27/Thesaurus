"use client"

import { useEffect, useState } from "react"

export function AuthBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-slate-950 via-teal-950 to-slate-950">
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/40 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-1/2 right-1/3 w-80 h-80 bg-blue-500/25 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "0.5s" }}
      ></div>
      <div
        className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1.5s" }}
      ></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.03)_25%,rgba(68,68,68,.03)_50%,transparent_50%,transparent_75%,rgba(68,68,68,.03)_75%,rgba(68,68,68,.03))] bg-[length:40px_40px] opacity-30"></div>
    </div>
  )
}
