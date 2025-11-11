"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react"

export function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  return (
    <div className="space-y-6 fade-in-up">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-accent bg-clip-text text-transparent">
          Bienvenido de vuelta
        </h1>
        <p className="text-foreground/70">Accede a tu dashboard de AI CFO</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="group">
          <label className="block text-sm font-semibold mb-2 text-foreground group-focus-within:text-primary transition-colors">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type="email"
              placeholder="tu@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-premium w-full pl-12 bg-white dark:bg-slate-800/50 border-border focus:border-primary"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="group">
          <label className="block text-sm font-semibold mb-2 text-foreground group-focus-within:text-primary transition-colors">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-premium w-full pl-12 pr-12 bg-white dark:bg-slate-800/50 border-border focus:border-primary"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-primary transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Remember & Forgot */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border border-border checked:bg-primary checked:border-primary"
            />
            <span className="text-foreground/70 hover:text-foreground transition-colors">Recuérdame</span>
          </label>
          <Link href="#" className="text-primary hover:text-primary/80 transition-colors font-medium">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="button-vibrant w-full py-3 flex items-center justify-center gap-2 rounded-xl font-semibold"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Ingresando...
            </>
          ) : (
            <>
              Ingresar
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-2 bg-white dark:bg-slate-900 text-foreground/50 text-sm">O continúa con</span>
        </div>
      </div>

      {/* Google Button */}
      <button className="w-full py-3 flex items-center justify-center gap-2 border-2 border-border rounded-xl hover:bg-primary/5 transition-all duration-300 font-semibold text-foreground hover:border-primary group">
        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span>Google</span>
      </button>

      {/* Sign Up Link */}
      <p className="text-center text-foreground/70">
        ¿No tienes cuenta?{" "}
        <Link href="/auth/signup" className="text-primary hover:text-primary/80 font-semibold transition-colors">
          Regístrate aquí
        </Link>
      </p>
    </div>
  )
}
