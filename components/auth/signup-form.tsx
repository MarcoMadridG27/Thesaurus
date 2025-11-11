"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, User, Building2, Check, ArrowRight } from "lucide-react"

export function SignUpForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreedTerms, setAgreedTerms] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
  }

  const passwordsMatch = formData.password === formData.confirmPassword && formData.password !== ""

  return (
    <div className="space-y-6 fade-in-up">
      <div className="text-center mb-8 slide-up">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-accent bg-clip-text text-transparent">Comienza gratis</h1>
        <p className="text-foreground/70">Crea tu cuenta de AI CFO hoy</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div className="group bounce-in" style={{ animationDelay: "0.1s" }}>
          <label className="block text-sm font-semibold mb-2 text-foreground group-focus-within:text-primary transition-colors duration-200">
            Nombre completo
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-primary transition-colors duration-200 pointer-events-none" />
            <input
              type="text"
              name="name"
              placeholder="Juan Pérez"
              value={formData.name}
              onChange={handleChange}
              className="input-premium w-full pl-12 bg-white dark:bg-slate-800/50 border-border focus:border-primary focus:scale-[1.01] transition-all duration-200"
              required
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="group bounce-in" style={{ animationDelay: "0.15s" }}>
          <label className="block text-sm font-semibold mb-2 text-foreground group-focus-within:text-primary transition-colors duration-200">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-primary transition-colors duration-200 pointer-events-none" />
            <input
              type="email"
              name="email"
              placeholder="juan@empresa.com"
              value={formData.email}
              onChange={handleChange}
              className="input-premium w-full pl-12 bg-white dark:bg-slate-800/50 border-border focus:border-primary focus:scale-[1.01] transition-all duration-200"
              required
            />
          </div>
        </div>

        {/* Company Field */}
        <div className="group bounce-in" style={{ animationDelay: "0.2s" }}>
          <label className="block text-sm font-semibold mb-2 text-foreground group-focus-within:text-primary transition-colors duration-200">
            Empresa
          </label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-primary transition-colors duration-200 pointer-events-none" />
            <input
              type="text"
              name="company"
              placeholder="Mi Empresa LTDA"
              value={formData.company}
              onChange={handleChange}
              className="input-premium w-full pl-12 bg-white dark:bg-slate-800/50 border-border focus:border-primary focus:scale-[1.01] transition-all duration-200"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="group bounce-in" style={{ animationDelay: "0.25s" }}>
          <label className="block text-sm font-semibold mb-2 text-foreground group-focus-within:text-primary transition-colors duration-200">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-primary transition-colors duration-200 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="input-premium w-full pl-12 pr-12 bg-white dark:bg-slate-800/50 border-border focus:border-primary focus:scale-[1.01] transition-all duration-200"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-primary transition-colors duration-200 hover:scale-110"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="group bounce-in" style={{ animationDelay: "0.3s" }}>
          <label className="block text-sm font-semibold mb-2 text-foreground group-focus-within:text-primary transition-colors duration-200">
            Confirmar contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-primary transition-colors duration-200 pointer-events-none" />
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`input-premium w-full pl-12 pr-12 bg-white dark:bg-slate-800/50 border-2 transition-all duration-200 focus:scale-[1.01] ${
                formData.confirmPassword &&
                (passwordsMatch
                  ? "border-emerald-500/50 focus:border-emerald-400"
                  : "border-red-500/50 focus:border-red-400")
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-12 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-primary transition-colors duration-200 hover:scale-110"
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {passwordsMatch && (
              <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400 animate-pulse" />
            )}
          </div>
        </div>

        {/* Terms Checkbox */}
        <label
          className="flex items-start gap-3 cursor-pointer group/terms bounce-in"
          style={{ animationDelay: "0.35s" }}
        >
          <input
            type="checkbox"
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
            className="w-4 h-4 rounded border border-border checked:bg-primary checked:border-primary mt-1 flex-shrink-0 group-hover/terms:border-primary/60 transition-all duration-200"
            required
          />
          <span className="text-foreground/70 text-sm">
            Acepto los{" "}
            <Link href="#" className="text-primary hover:text-primary/80 transition-colors duration-200">
              términos de servicio
            </Link>{" "}
            y la{" "}
            <Link href="#" className="text-primary hover:text-primary/80 transition-colors duration-200">
              política de privacidad
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={isLoading || !agreedTerms}
          className="button-premium w-full py-3 flex items-center justify-center gap-2 rounded-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 bounce-in"
          style={{ animationDelay: "0.4s" }}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Creando cuenta...
            </>
          ) : (
            <>
              Crear cuenta
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </>
          )}
        </button>
      </form>

      {/* Sign In Link */}
      <p className="text-center text-foreground/70 bounce-in" style={{ animationDelay: "0.45s" }}>
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/auth/signin"
          className="text-primary hover:text-primary/80 font-semibold transition-colors duration-200"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
