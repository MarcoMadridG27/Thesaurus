"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, BarChart3, MessageSquare, Users, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const menuItems = [
  {
    label: "Inicio",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "Facturas",
    href: "/dashboard/invoices",
    icon: FileText,
  },
  {
    label: "Análisis",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    label: "Consultas IA",
    href: "/dashboard/queries",
    icon: MessageSquare,
  },
  {
    label: "Proveedores",
    href: "/dashboard/suppliers",
    icon: Users,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 md:hidden z-40"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative w-64 h-screen bg-surface border-r border-border flex flex-col transition-all duration-300 md:translate-x-0 z-30",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-primary">AI CFO</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
                pathname === item.href ? "bg-primary-light text-primary" : "text-text-secondary hover:bg-background",
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <Button variant="outline" className="w-full justify-start bg-transparent" onClick={() => setIsOpen(false)}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 md:hidden z-20" onClick={() => setIsOpen(false)} />}
    </>
  )
}
