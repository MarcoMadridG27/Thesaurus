"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import { loginUser } from "@/lib/api"

export function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await loginUser({ email, password })
      
      if (result.success) {
        if (result.data?.access_token) {
          localStorage.setItem("authToken", result.data.access_token)
        }
        // Guardar datos del usuario para mostrar en el dashboard
        if (result.data?.user) {
          localStorage.setItem("userData", JSON.stringify({
            email: result.data.user.email,
            ruc: result.data.user.ruc,
            razon_social: result.data.user.razon_social
          }))
        }
        // Keep loading state active while redirecting
        router.push("/dashboard")
      } else {
        setError(result.error || "Error al iniciar sesión")
        setIsLoading(false)
      }
    } catch (err: unknown) {
      console.error("Error durante el login:", err)
      setError("Error de conexión. Por favor, intenta de nuevo.")
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
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="group relative">
          <div className="relative">
            <input
              id="email"
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              className="input-premium"
              required
            />
            <label 
              htmlFor="email" 
              className={`absolute transition-all duration-200 pointer-events-none ${
                emailFocused || email 
                  ? 'top-0 left-3 text-xs text-primary' 
                  : 'top-1/2 -translate-y-1/2 left-3 text-foreground/60'
              }`}
              style={{ zIndex: 1 }}
            >
              Correo electrónico
            </label>
          </div>
        </div>

        <div className="group relative">
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              className="input-premium pr-12"
              required
            />
            <label 
              htmlFor="password" 
              className={`absolute transition-all duration-200 pointer-events-none ${
                passwordFocused || password 
                  ? 'top-0 left-3 text-xs text-primary' 
                  : 'top-1/2 -translate-y-1/2 left-3 text-foreground/60'
              }`}
              style={{ zIndex: 1 }}
            >
              Contraseña
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-primary transition-colors duration-200 hover:scale-110 z-10"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
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
          className="button-premium w-full py-3 flex items-center justify-center gap-2 rounded-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 group hover:scale-[1.02] active:scale-[0.98]"
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

      <p className="text-center text-foreground/70">
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
