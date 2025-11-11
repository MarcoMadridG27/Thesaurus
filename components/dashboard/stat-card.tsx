import { Card } from "@/components/ui/card"
import type { ReactNode } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  label: string
  value: string
  change: string
  icon: ReactNode
  isPositive?: boolean
}

export function StatCard({ label, value, change, icon, isPositive = true }: StatCardProps) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium text-text-secondary">{label}</p>
          <p className="text-2xl font-bold text-text">{value}</p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {isPositive ? <TrendingUp className="w-4 h-4 text-success" /> : <TrendingDown className="w-4 h-4 text-error" />}
        <p className="text-sm font-medium text-text-secondary">{change}</p>
      </div>
    </Card>
  )
}
