"use client"

import { Card } from "@/components/ui/card"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart } from "recharts"
import { useState, useEffect } from "react"
import { getChartData } from "@/lib/api"

interface ExpenseChartProps {
  readonly title?: string
}

export function ExpenseChart({ title = "Gastos mensuales" }: Readonly<ExpenseChartProps>) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getChartData('expense', 'month')
        if (result.success && result.data?.data) {
          const chartData = result.data.data
          // Transform data for recharts
          const transformed = chartData.labels.map((label: string, idx: number) => ({
            period: label,
            actual: chartData.datasets[0]?.data[idx] || 0,
            previous: chartData.datasets[1]?.data[idx] || 0,
          }))
          setData(transformed)
        }
      } catch (error) {
        console.error('Error loading expense chart:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">{title}</h3>
        <div className="h-[300px] flex items-center justify-center text-foreground/50">
          Cargando datos...
        </div>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">{title}</h3>
        <div className="h-[300px] flex items-center justify-center text-foreground/50">
          No hay datos disponibles
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="period" stroke="var(--color-foreground)" opacity={0.6} />
          <YAxis stroke="var(--color-foreground)" opacity={0.6} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface)",
              border: `1px solid var(--color-border)`,
              borderRadius: "0.5rem",
            }}
          />
          <Line 
            type="monotone" 
            dataKey="actual" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            dot={{ fill: '#8b5cf6' }}
            name="Actual"
          />
          <Line 
            type="monotone" 
            dataKey="previous" 
            stroke="#d1d5db" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#d1d5db' }}
            name="Período Anterior"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
