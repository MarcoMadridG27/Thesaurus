"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const recentInvoices = [
  {
    id: "INV-048",
    supplier: "Proveedor A",
    amount: "$1,250",
    date: "Hace 2h",
    status: "procesado",
  },
  {
    id: "INV-047",
    supplier: "Proveedor B",
    amount: "$850",
    date: "Hace 5h",
    status: "procesado",
  },
  {
    id: "INV-046",
    supplier: "Proveedor C",
    amount: "$2,100",
    date: "Hace 1d",
    status: "pendiente",
  },
]

export function RecentInvoices() {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-text">Facturas recientes</h3>
        <Button variant="link" className="text-primary">
          Ver todas
        </Button>
      </div>

      <div className="space-y-3">
        {recentInvoices.map((invoice) => (
          <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg bg-background">
            <div>
              <p className="font-medium text-text">{invoice.id}</p>
              <p className="text-sm text-text-secondary">{invoice.supplier}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-text">{invoice.amount}</p>
              <p className="text-sm text-text-secondary">{invoice.date}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
