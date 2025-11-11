"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Bell } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Header() {
  return (
    <header className="border-b border-border bg-surface sticky top-0 z-20 md:ml-0">
      <div className="flex items-center justify-between h-16 px-6 gap-4">
        <div className="flex-1 relative hidden sm:block max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
          <Input placeholder="Buscar..." className="pl-10 bg-background" />
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5 text-text-secondary" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                  J
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configuración</DropdownMenuItem>
              <DropdownMenuItem>Cerrar sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
