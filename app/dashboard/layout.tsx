import type React from "react"
import type { Metadata } from "next"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Gestiona tus finanzas y facturas",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-background/95">{children}</main>
      </div>
    </div>
  )
}
