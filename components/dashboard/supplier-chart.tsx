"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { proveedor: "Proveedor A", monto: 3200 },
  { proveedor: "Proveedor B", monto: 2800 },
  { proveedor: "Proveedor C", monto: 2100 },
  { proveedor: "Proveedor D", monto: 1900 },
  { proveedor: "Otros", monto: 1450 },
]

export function SupplierChart() {
  return (
    <Card className="p-6">
      <h3 className="font-semibold text-text mb-4">Gastos por proveedor</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis type="number" stroke="var(--color-text-secondary)" />
          <YAxis dataKey="proveedor" type="category" stroke="var(--color-text-secondary)" width={100} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface)",
              border: `1px solid var(--color-border)`,
              borderRadius: "0.5rem",
            }}
          />
          <Bar dataKey="monto" fill="var(--color-primary)" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
