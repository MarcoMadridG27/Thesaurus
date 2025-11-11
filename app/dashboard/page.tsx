"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, FileText, AlertCircle } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { AISummaryCard } from "@/components/dashboard/ai-summary-card"
import { RecentInvoices } from "@/components/dashboard/recent-invoices"
import { ExpenseChart } from "@/components/dashboard/expense-chart"

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard label="Gasto total (mes)" value="$12,450" change="+2.1%" icon={<BarChart3 className="w-5 h-5" />} />
        <StatCard label="Facturas procesadas" value="48" change="+5" icon={<FileText className="w-5 h-5" />} />
        <StatCard label="Proveedores activos" value="12" change="Estable" icon={<TrendingUp className="w-5 h-5" />} />
        <StatCard
          label="Ahorros detectados"
          value="$2,340"
          change="Este mes"
          icon={<AlertCircle className="w-5 h-5" />}
        />
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Expense Chart */}
          <ExpenseChart />

          {/* Recent Invoices */}
          <RecentInvoices />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <AISummaryCard />

          {/* Quick Actions */}
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-text">Acciones rápidas</h3>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <FileText className="w-4 h-4 mr-2" />
              Subir factura
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <BarChart3 className="w-4 h-4 mr-2" />
              Ver reportes
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
