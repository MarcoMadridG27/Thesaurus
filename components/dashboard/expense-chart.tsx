"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { mes: "Enero", gasto: 8000 },
  { mes: "Febrero", gasto: 9200 },
  { mes: "Marzo", gasto: 7800 },
  { mes: "Abril", gasto: 9800 },
  { mes: "Mayo", gasto: 10200 },
  { mes: "Junio", gasto: 9500 },
]

interface ExpenseChartProps {
  title?: string
}

export function ExpenseChart({ title = "Gastos mensuales" }: ExpenseChartProps) {
  return (
    <Card className="p-6">
      <h3 className="font-semibold text-text mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="mes" stroke="var(--color-text-secondary)" />
          <YAxis stroke="var(--color-text-secondary)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface)",
              border: `1px solid var(--color-border)`,
              borderRadius: "0.5rem",
            }}
          />
          <Bar dataKey="gasto" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
