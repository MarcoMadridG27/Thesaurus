"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, FileText, AlertCircle } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { AISummaryCard } from "@/components/dashboard/ai-summary-card"
import { RecentInvoices } from "@/components/dashboard/recent-invoices"
import { ExpenseChart } from "@/components/dashboard/expense-chart"
import { invoiceStore } from "@/lib/store"
import { useState, useEffect } from "react"

export default function DashboardPage() {
  const [stats, setStats] = useState(invoiceStore.getStats())
  const [summaryData, setSummaryData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  const loadSummary = async () => {
    try {
      const { getInsightsSummary } = await import('@/lib/api')
      const result = await getInsightsSummary('month')
      
      if (result.success && result.data) {
        setSummaryData(result.data)
      }
    } catch (error) {
      console.error('Error loading summary:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    console.log('🏠 [Dashboard] Component mounted')
    
    const unsubscribe = invoiceStore.subscribe(() => {
      console.log('🔔 [Dashboard] Store updated')
      const newStats = invoiceStore.getStats()
      console.log('🏠 [Dashboard] New stats:', newStats)
      setStats(newStats)
      // Reload summary when invoices change
      loadSummary()
    })
    
    // Initial load
    setStats(invoiceStore.getStats())
    loadSummary()
    
    return unsubscribe
  }, [])
  
  console.log('🎨 [Dashboard] Rendering with stats:', stats)

  if (!mounted) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          <StatCard label="Gasto total (mes)" value={`PEN 0.00`} change="Cargando..." icon={<BarChart3 className="w-5 h-5" />} />
          <StatCard label="Facturas procesadas" value="0" change="Total" icon={<FileText className="w-5 h-5" />} />
          <StatCard label="Proveedores activos" value="0" change="Registrados" icon={<TrendingUp className="w-5 h-5" />} />
          <StatCard label="Gasto total" value={`PEN 0.00`} change="Histórico" icon={<AlertCircle className="w-5 h-5" />} />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        {loading || !summaryData?.quick_stats ? (
          <>
            <StatCard label="Gasto total (mes)" value={`PEN ${stats.monthlySpent.toFixed(2)}`} change="Cargando..." icon={<BarChart3 className="w-5 h-5" />} />
            <StatCard label="Facturas procesadas" value={stats.invoiceCount.toString()} change="Total" icon={<FileText className="w-5 h-5" />} />
            <StatCard label="Proveedores activos" value={stats.supplierCount.toString()} change="Registrados" icon={<TrendingUp className="w-5 h-5" />} />
            <StatCard label="Gasto total" value={`PEN ${stats.totalSpent.toFixed(2)}`} change="Histórico" icon={<AlertCircle className="w-5 h-5" />} />
          </>
        ) : (
          summaryData.quick_stats.map((stat: any, idx: number) => {
            const icons = [
              <BarChart3 key="icon1" className="w-5 h-5" />,
              <FileText key="icon2" className="w-5 h-5" />,
              <TrendingUp key="icon3" className="w-5 h-5" />,
              <AlertCircle key="icon4" className="w-5 h-5" />
            ]
            return (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.currency ? `${stat.currency} ${stat.value}` : stat.value}
                change={stat.change}
                icon={icons[idx] || icons[0]}
              />
            )
          })
        )}
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
