"use client"

import { Button } from "@/components/ui/button"
import { LogOut, User, Settings } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { getUserProfile } from "@/lib/api"

export function Header() {
  const router = useRouter()
  const [userName, setUserName] = useState('Usuario')
  const [userInitial, setUserInitial] = useState('U')

  useEffect(() => {
    const loadUserProfile = async () => {
      // Primero intentar desde localStorage
      const userData = localStorage.getItem('userData')
      if (userData) {
        try {
          const user = JSON.parse(userData)
          const displayName = user.razon_social || user.email || 'Usuario'
          setUserName(displayName)
          setUserInitial(displayName.charAt(0).toUpperCase())
        } catch (error) {
          console.error('Error al parsear datos de usuario:', error)
        }
      }

      // Luego actualizar desde la API
      const token = localStorage.getItem('authToken')
      if (token) {
        const result = await getUserProfile(token)
        if (result.success && result.data) {
          const displayName = result.data.razon_social || result.data.email || 'Usuario'
          setUserName(displayName)
          setUserInitial(displayName.charAt(0).toUpperCase())
          
          // Actualizar localStorage con datos frescos
          localStorage.setItem('userData', JSON.stringify({
            email: result.data.email,
            ruc: result.data.ruc,
            razon_social: result.data.razon_social,
            nombre_comercial: result.data.nombre_comercial,
            direccion: result.data.direccion,
            departamento: result.data.departamento,
            provincia: result.data.provincia,
            distrito: result.data.distrito,
          }))
        }
      }
    }

    loadUserProfile()
  }, [])

  const handleLogout = () => {
    // Limpiar localStorage
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    // Redirigir al login
    router.push('/auth/signin')
  }

  return (
    <header className="border-b border-border bg-surface sticky top-0 z-20 md:ml-0">
      <div className="flex items-center justify-end h-16 px-6 gap-4">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 h-auto py-2 hover:scale-105 transition-all duration-200 group">
                <div className="w-8 h-8 rounded-full bg-gradient-premium flex items-center justify-center text-white font-semibold shadow-lg group-hover:shadow-teal-500/50 transition-shadow">
                  {userInitial}
                </div>
                <span className="hidden md:block text-sm font-medium group-hover:text-primary transition-colors">{userName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">Cuenta activa</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </div>
    </header>
  )
}
