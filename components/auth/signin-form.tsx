"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react"
import { loginUser } from "@/lib/api"

export function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await loginUser({ email, password })
      
      if (result.success) {
        // Save token if provided
        if (result.data?.access_token) {
          localStorage.setItem("authToken", result.data.access_token)
        }
        // Redirect to dashboard
        router.push("/dashboard")
      } else {
        setError(result.error || "Error al iniciar sesión")
      }
    } catch (err: unknown) {
      console.error("Error durante el login:", err)
      setError("Error de conexión. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 fade-in-up">
      <div className="text-center mb-8 slide-up">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-accent bg-clip-text text-transparent">
          Bienvenido de vuelta
        </h1>
        <p className="text-foreground/70">Accede a tu dashboard de AI CFO</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Email Field */}
        <div className="group bounce-in" style={{ animationDelay: "0.1s" }}>
          <label htmlFor="email" className="block text-sm font-semibold mb-2 text-foreground group-focus-within:text-primary transition-colors duration-200">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-primary transition-colors duration-200 pointer-events-none" />
            <input
              id="email"
              type="email"
              placeholder="tu@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-premium w-full pl-12 bg-white dark:bg-slate-800/50 border-border focus:border-primary focus:scale-[1.01] transition-all duration-200 text-foreground"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="group bounce-in" style={{ animationDelay: "0.2s" }}>
          <label htmlFor="password" className="block text-sm font-semibold mb-2 text-foreground group-focus-within:text-primary transition-colors duration-200">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-primary transition-colors duration-200 pointer-events-none" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-premium w-full pl-12 pr-12 bg-white dark:bg-slate-800/50 border-border focus:border-primary focus:scale-[1.01] transition-all duration-200 text-foreground"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-primary transition-colors duration-200 hover:scale-110"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Remember & Forgot */}
        <div className="flex items-center justify-between text-sm bounce-in" style={{ animationDelay: "0.3s" }}>
          <label className="flex items-center gap-2 cursor-pointer group/check">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border border-border checked:bg-primary checked:border-primary group-hover/check:border-primary/60 transition-all duration-200"
            />
            <span className="text-foreground/70 hover:text-foreground transition-colors duration-200">Recuérdame</span>
          </label>
          <Link href="#" className="text-primary hover:text-primary/80 transition-colors duration-200 font-medium">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="button-premium w-full py-3 flex items-center justify-center gap-2 rounded-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 bounce-in"
          style={{ animationDelay: "0.4s" }}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Ingresando...
            </>
          ) : (
            <>
              Ingresar
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative bounce-in" style={{ animationDelay: "0.5s" }}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-2 bg-white dark:bg-slate-900 text-foreground/50 text-sm">O continúa con</span>
        </div>
      </div>

      {/* Google Button */}
      <button
        type="button"
        className="w-full py-3 flex items-center justify-center gap-2 border-2 border-border rounded-xl hover:bg-primary/5 hover:border-primary transition-all duration-300 font-semibold text-foreground group bounce-in"
        style={{ animationDelay: "0.6s" }}
      >
        <svg className="w-5 h-5 group-hover:scale-110 transition-transform shrink-0" viewBox="0 0 24 24">
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
      <p className="text-center text-foreground/70 bounce-in" style={{ animationDelay: "0.7s" }}>
        ¿No tienes cuenta?{" "}
        <Link
          href="/auth/signup"
          className="text-primary hover:text-primary/80 font-semibold transition-colors duration-200"
        >
          Regístrate aquí
        </Link>
      </p>
    </div>
  )
}
