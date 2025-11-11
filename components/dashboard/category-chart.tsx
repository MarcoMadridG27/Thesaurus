"use client"

import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: "Servicios", value: 4500 },
  { name: "Suministros", value: 2800 },
  { name: "Transporte", value: 1200 },
  { name: "Otros", value: 950 },
]

const COLORS = ["#0066cc", "#e6f0ff", "#10b981", "#f59e0b"]

export function CategoryChart() {
  return (
    <Card className="p-6">
      <h3 className="font-semibold text-text mb-4">Gastos por categoría</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: $${value}`}
            outerRadius={100}
            fill="#0066cc"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}
