"use client"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { SuppliersTable } from "@/components/dashboard/suppliers-table"
import { useState } from "react"

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-text">Proveedores</h1>
        <p className="text-text-secondary">Gestiona y analiza tus relaciones con proveedores</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
          <Input
            placeholder="Buscar proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Suppliers Table */}
      <SuppliersTable />
    </div>
  )
}
