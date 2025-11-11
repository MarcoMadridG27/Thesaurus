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
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-accent bg-clip-text text-transparent">Comienza gratis</h1>
        <p className="text-foreground/70">Crea tu cuenta de AI CFO hoy</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div className="group">
          <label className="block text-sm font-semibold mb-2 text-foreground group-focus-within:text-primary transition-colors">
            Nombre completo
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type="text"
              name="name"
              placeholder="Juan Pérez"
              value={formData.name}
              onChange={handleChange}
              className="input-premium w-full pl-12 bg-white dark:bg-slate-800/50 border-border focus:border-primary"
              required
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="group">
          <label className="block text-sm font-semibold mb-2 text-foreground group-focus-within:text-primary transition-colors">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type="email"
              name="email"
              placeholder="juan@empresa.com"
              value={formData.email}
              onChange={handleChange}
              className="input-premium w-full pl-12 bg-white dark:bg-slate-800/50 border-border focus:border-primary"
              required
            />
          </div>
        </div>

        {/* Company Field */}
        <div className="group">
          <label className="block text-sm font-semibold mb-2 text-foreground group-focus-within:text-primary transition-colors">
            Empresa
          </label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type="text"
              name="company"
              placeholder="Mi Empresa LTDA"
              value={formData.company}
              onChange={handleChange}
              className="input-premium w-full pl-12 bg-white dark:bg-slate-800/50 border-border focus:border-primary"
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
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
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

        {/* Confirm Password Field */}
        <div className="group">
          <label className="block text-sm font-semibold mb-2 text-foreground group-focus-within:text-primary transition-colors">
            Confirmar contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`input-premium w-full pl-12 pr-12 bg-white dark:bg-slate-800/50 border-2 transition-colors ${
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
              className="absolute right-12 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-primary transition-colors"
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {passwordsMatch && <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />}
          </div>
        </div>

        {/* Terms Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
            className="w-4 h-4 rounded border border-border checked:bg-primary checked:border-primary mt-1 flex-shrink-0"
            required
          />
          <span className="text-foreground/70 text-sm">
            Acepto los{" "}
            <Link href="#" className="text-primary hover:text-primary/80">
              términos de servicio
            </Link>{" "}
            y la{" "}
            <Link href="#" className="text-primary hover:text-primary/80">
              política de privacidad
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={isLoading || !agreedTerms}
          className="button-vibrant w-full py-3 flex items-center justify-center gap-2 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Creando cuenta...
            </>
          ) : (
            <>
              Crear cuenta
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Sign In Link */}
      <p className="text-center text-foreground/70">
        ¿Ya tienes cuenta?{" "}
        <Link href="/auth/signin" className="text-primary hover:text-primary/80 font-semibold transition-colors">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
