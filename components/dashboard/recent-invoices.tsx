"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { invoiceStore } from "@/lib/store"
import { useState, useEffect } from "react"
import Link from "next/link"

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  
  if (diffDays > 0) return `Hace ${diffDays}d`
  if (diffHours > 0) return `Hace ${diffHours}h`
  return 'Hace un momento'
}

export function RecentInvoices() {
  const [invoices, setInvoices] = useState(invoiceStore.getStats().recentInvoices)

  useEffect(() => {
    console.log('📌 [RecentInvoices] Component mounted')
    
    const unsubscribe = invoiceStore.subscribe(() => {
      console.log('🔔 [RecentInvoices] Store updated')
      const newInvoices = invoiceStore.getStats().recentInvoices
      console.log('📌 [RecentInvoices] Setting invoices:', newInvoices.length)
      setInvoices(newInvoices)
    })
    
    // Force initial fetch
    setInvoices(invoiceStore.getStats().recentInvoices)
    
    return unsubscribe
  }, [])
  
  console.log('🎨 [RecentInvoices] Rendering with', invoices.length, 'invoices')
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-text">Facturas recientes</h3>
        <Link href="/dashboard/invoices">
          <Button variant="link" className="text-primary">
            Ver todas
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {invoices.length === 0 ? (
          <p className="text-center text-foreground/50 py-4">No hay facturas recientes</p>
        ) : (
          invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg bg-background">
              <div>
                <p className="font-medium text-text">{invoice.numero}</p>
                <p className="text-sm text-text-secondary">{invoice.proveedor}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-text">{invoice.moneda} {invoice.total.toFixed(2)}</p>
                <p className="text-sm text-text-secondary">{formatRelativeTime(invoice.fecha)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
