"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useState, useEffect } from "react"
import { getChartData } from "@/lib/api"

export function SupplierChart() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getChartData('supplier', 'month')
        if (result.success && result.data?.data) {
          const chartData = result.data.data
          const transformed = chartData.labels.map((label: string, idx: number) => ({
            proveedor: label.length > 20 ? label.substring(0, 20) + '...' : label,
            monto: chartData.datasets[0]?.data[idx] || 0,
          }))
          setData(transformed)
        }
      } catch (error) {
        console.error('Error loading supplier chart:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Gastos por proveedor</h3>
        <div className="h-[300px] flex items-center justify-center text-foreground/50">
          Cargando datos...
        </div>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Gastos por proveedor</h3>
        <div className="h-[300px] flex items-center justify-center text-foreground/50">
          No hay datos disponibles
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-4">Gastos por proveedor</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis type="number" stroke="var(--color-foreground)" opacity={0.6} />
          <YAxis dataKey="proveedor" type="category" stroke="var(--color-foreground)" opacity={0.6} width={120} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface)",
              border: `1px solid var(--color-border)`,
              borderRadius: "0.5rem",
            }}
          />
          <Bar dataKey="monto" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
