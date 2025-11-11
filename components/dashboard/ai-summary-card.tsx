"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap } from "lucide-react"

export function AISummaryCard() {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary-light to-background space-y-4 border-primary/20">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-text">Insights IA</h3>
      </div>

      <div className="space-y-3">
        <div className="p-3 rounded-lg bg-white/50 border border-primary/10">
          <p className="text-sm text-text-secondary mb-1">Tendencia esta semana</p>
          <p className="font-semibold text-text">Tu gasto aumentó 18%</p>
        </div>

        <div className="p-3 rounded-lg bg-white/50 border border-primary/10">
          <p className="text-sm text-text-secondary mb-1">Proveedor destacado</p>
          <p className="font-semibold text-text">Proveedor X incrementó precios 5%</p>
        </div>

        <div className="p-3 rounded-lg bg-white/50 border border-primary/10">
          <p className="text-sm text-text-secondary mb-1">Oportunidad</p>
          <p className="font-semibold text-text">Consolidar compras en 2 proveedores</p>
        </div>
      </div>

      <Badge variant="secondary" className="w-full text-center py-2">
        Análisis actualizado hace 2h
      </Badge>
    </Card>
  )
}
