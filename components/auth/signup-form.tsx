"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Check, ArrowRight, Loader2 } from "lucide-react"
import { signUpUser, validateRuc, type RucData } from "@/lib/api"

export function SignUpForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    ruc: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidatingRuc, setIsValidatingRuc] = useState(false)
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [error, setError] = useState("")
  const [rucData, setRucData] = useState<RucData | null>(null)
  const [rucFocused, setRucFocused] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [confirmFocused, setConfirmFocused] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Si cambia el RUC, limpiar los datos validados
    if (name === 'ruc' && rucData) {
      setRucData(null)
    }
  }

  const handleValidateRuc = async () => {
    if (formData.ruc.length !== 11) {
      setError("El RUC debe tener 11 dígitos")
      return
    }

    setIsValidatingRuc(true)
    setError("")

    try {
      const result = await validateRuc(formData.ruc)
      
      if (result.success && result.data) {
        setRucData(result.data)
        setError("")
      } else {
        setError(result.error || "Error al validar RUC")
        setRucData(null)
      }
    } catch (err: unknown) {
      console.error("Error al validar RUC:", err)
      setError("Error al validar RUC. Por favor, intenta de nuevo.")
      setRucData(null)
    } finally {
      setIsValidatingRuc(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    // Validate RUC has been validated
    if (!rucData) {
      setError("Por favor, valida el RUC primero")
      return
    }

    setIsLoading(true)

    try {
      const result = await signUpUser({
        ruc: formData.ruc,
        email: formData.email,
        password: formData.password,
      })

      if (result.success) {
        // Save token if provided
        if (result.data?.access_token) {
          localStorage.setItem("authToken", result.data.access_token)
        }
        // Save user data including razon_social from validated RUC
        if (rucData) {
          localStorage.setItem("userData", JSON.stringify({
            email: formData.email,
            ruc: formData.ruc,
            razon_social: rucData.razon_social
          }))
        }
        // Redirect to dashboard
        router.push("/dashboard")
      } else {
        setError(result.error || "Error al crear la cuenta")
      }
    } catch (err: unknown) {
      console.error("Error durante el registro:", err)
      setError("Error de conexión. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const passwordsMatch = formData.password === formData.confirmPassword && formData.password !== ""

  return (
    <div className="space-y-6 fade-in-up">
      <div className="text-center mb-8 slide-up">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-accent bg-clip-text text-transparent">Comienza gratis</h1>
        <p className="text-foreground/70">Crea tu cuenta de AI CFO hoy</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Success Message - RUC Validated */}
        {rucData && (
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm">
            <p className="font-semibold">{rucData.razon_social}</p>
            {rucData.nombre_comercial && <p className="text-xs">{rucData.nombre_comercial}</p>}
            <p className="text-xs mt-1">Estado: {rucData.estado} | Condición: {rucData.condicion}</p>
          </div>
        )}

        {/* RUC Field */}
        <div className="group">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="ruc"
                type="text"
                name="ruc"
                placeholder=" "
                value={formData.ruc}
                onChange={handleChange}
                onFocus={() => setRucFocused(true)}
                onBlur={() => setRucFocused(false)}
                maxLength={11}
                className="input-premium"
                required
              />
              <label 
                htmlFor="ruc"
                className={`absolute transition-all duration-200 pointer-events-none ${
                  rucFocused || formData.ruc 
                    ? 'top-0 left-3 text-xs text-primary' 
                    : 'top-1/2 -translate-y-1/2 left-3 text-foreground/60'
                }`}
                style={{ zIndex: 1 }}
              >
                RUC (11 dígitos)
              </label>
            </div>
            <button
              type="button"
              onClick={handleValidateRuc}
              disabled={isValidatingRuc || formData.ruc.length !== 11}
              className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium whitespace-nowrap flex items-center gap-2"
            >
              {isValidatingRuc ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando...</span>
                </>
              ) : (
                'Validar'
              )}
            </button>
          </div>
          <p className="text-xs text-foreground/60 mt-1">El RUC debe tener 11 dígitos y será validado con SUNAT</p>
        </div>

        {/* Email Field */}
        <div className="group relative">
          <div className="relative">
            <input
              id="email"
              type="email"
              name="email"
              placeholder=" "
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              className="input-premium"
              required
            />
            <label 
              htmlFor="email"
              className={`absolute transition-all duration-200 pointer-events-none ${
                emailFocused || formData.email 
                  ? 'top-0 left-3 text-xs text-primary' 
                  : 'top-1/2 -translate-y-1/2 left-3 text-foreground/60'
              }`}
              style={{ zIndex: 1 }}
            >
              Correo electrónico
            </label>
          </div>
        </div>

        {/* Password Field */}
        <div className="group relative">
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder=" "
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              className="input-premium pr-12"
              required
            />
            <label 
              htmlFor="password"
              className={`absolute transition-all duration-200 pointer-events-none ${
                passwordFocused || formData.password 
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

        {/* Confirm Password Field */}
        <div className="group relative">
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder=" "
              value={formData.confirmPassword}
              onChange={handleChange}
              onFocus={() => setConfirmFocused(true)}
              onBlur={() => setConfirmFocused(false)}
              className={`input-premium pr-12 ${
                formData.confirmPassword &&
                (passwordsMatch
                  ? "border-emerald-500/50! focus:border-emerald-400!"
                  : "border-red-500/50! focus:border-red-400!")
              }`}
              required
            />
            <label 
              htmlFor="confirmPassword"
              className={`absolute transition-all duration-200 pointer-events-none ${
                confirmFocused || formData.confirmPassword 
                  ? 'top-0 left-3 text-xs text-primary' 
                  : 'top-1/2 -translate-y-1/2 left-3 text-foreground/60'
              }`}
              style={{ zIndex: 1 }}
            >
              Confirmar contraseña
            </label>
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-12 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-primary transition-colors duration-200 hover:scale-110 z-10"
              aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {passwordsMatch && (
              <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400 animate-pulse z-10" />
            )}
          </div>
        </div>

        {/* Terms Checkbox */}
        <label
          className="flex items-start gap-3 cursor-pointer group/terms"
        >
          <input
            type="checkbox"
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
            className="w-4 h-4 rounded border border-border checked:bg-primary checked:border-primary mt-1 shrink-0 group-hover/terms:border-primary/60 transition-all duration-200"
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
          disabled={isLoading || !agreedTerms || !rucData}
          className="button-premium w-full py-3 flex items-center justify-center gap-2 rounded-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
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
      <p className="text-center text-foreground/70">
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
