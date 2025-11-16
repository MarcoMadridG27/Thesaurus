"use client"

import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useState, useEffect } from "react"
import { getChartData } from "@/lib/api"

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"]

export function CategoryChart() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getChartData('category', 'month')
        if (result.success && result.data?.data) {
          const chartData = result.data.data
          const transformed = chartData.labels.map((label: string, idx: number) => ({
            name: label,
            value: chartData.datasets[0]?.data[idx] || 0,
          }))
          setData(transformed)
        } else {
          setError(result.error || 'No se recibieron datos del backend para categorías')
        }
      } catch (error) {
        console.error('Error loading category chart:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Gastos por categoría</h3>
        <div className="h-[300px] flex items-center justify-center text-foreground/50">
          Cargando datos...
        </div>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Gastos por categoría</h3>
        <div className="h-[300px] flex items-center justify-center text-foreground/50">
          {error ? (
            <span className="text-sm text-red-500">{error}</span>
          ) : (
            'No hay datos disponibles'
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-4">Gastos por categoría</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={90}
            fill="#8b5cf6"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}
