"use client"
import { ExpenseChart } from "@/components/dashboard/expense-chart"
import { SupplierChart } from "@/components/dashboard/supplier-chart"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-text">Análisis financiero</h1>
          <p className="text-text-secondary">Visualiza tus gastos y patrones de gasto</p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exportar
        </Button>
      </div>

      {/* Period selector */}
      <div className="flex gap-4">
        <Select defaultValue="month">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Esta semana</SelectItem>
            <SelectItem value="month">Este mes</SelectItem>
            <SelectItem value="quarter">Este trimestre</SelectItem>
            <SelectItem value="year">Este año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ExpenseChart title="Evolución de gastos" />
        <CategoryChart />
      </div>

      <SupplierChart />
    </div>
  )
}
