"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { invoiceStore } from "@/lib/store"
import { useState, useEffect } from "react"

export function InvoiceTable() {
  const [invoices, setInvoices] = useState(invoiceStore.getInvoices())

  useEffect(() => {
    console.log('📊 [InvoiceTable] Component mounted, initial invoices:', invoices.length)
    
    const unsubscribe = invoiceStore.subscribe(() => {
      console.log('🔔 [InvoiceTable] Store updated, fetching new invoices')
      const newInvoices = invoiceStore.getInvoices()
      console.log('📊 [InvoiceTable] Setting invoices:', newInvoices.length)
      setInvoices(newInvoices)
    })
    
    // Force initial fetch
    setInvoices(invoiceStore.getInvoices())
    
    return unsubscribe
  }, [])
  
  console.log('🎨 [InvoiceTable] Rendering with', invoices.length, 'invoices')
  
  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-background">
            <TableHead>Número</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-foreground/50 py-8">
                No hay facturas procesadas. Sube una factura para comenzar.
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.numero}</TableCell>
              <TableCell>{invoice.proveedor}</TableCell>
              <TableCell>{invoice.fecha}</TableCell>
              <TableCell>{invoice.moneda} {invoice.total.toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant="default">
                  {invoice.estado}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                    <DropdownMenuItem>Descargar</DropdownMenuItem>
                    <DropdownMenuItem>Eliminar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
