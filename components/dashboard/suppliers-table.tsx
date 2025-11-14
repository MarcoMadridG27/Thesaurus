"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { invoiceStore, type Supplier } from "@/lib/store"
import { useState, useEffect } from "react"

export function SuppliersTable() {
  const [suppliers, setSuppliers] = useState(invoiceStore.getSuppliers())
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  useEffect(() => {
    console.log('👥 [SuppliersTable] Component mounted')
    
    const unsubscribe = invoiceStore.subscribe(() => {
      console.log('🔔 [SuppliersTable] Store updated')
      const newSuppliers = invoiceStore.getSuppliers()
      console.log('👥 [SuppliersTable] Setting suppliers:', newSuppliers.length)
      setSuppliers(newSuppliers)
    })
    
    // Force initial fetch
    setSuppliers(invoiceStore.getSuppliers())
    
    return unsubscribe
  }, [])

  const handleViewDetails = (ruc: string) => {
    setSelectedSupplier(ruc)
    setShowDetails(true)
    const supplier = suppliers.find(s => s.ruc === ruc)
    console.log('👁️ Ver detalles de proveedor:', supplier)
  }

  const handleEdit = (ruc: string) => {
    setSelectedSupplier(ruc)
    setShowEdit(true)
    const supplier = suppliers.find(s => s.ruc === ruc)
    console.log('✏️ Editar proveedor:', supplier)
  }

  const handleDelete = (ruc: string) => {
    const supplier = suppliers.find(s => s.ruc === ruc)
    if (confirm(`¿Estás seguro de eliminar al proveedor ${supplier?.razon_social}? Esto eliminará todas sus facturas asociadas.`)) {
      // Obtener facturas del proveedor
      const allInvoices = invoiceStore.getAllInvoices()
      const supplierInvoices = allInvoices.filter(inv => inv.ruc_proveedor === ruc)
      
      // Eliminar cada factura
      for (const invoice of supplierInvoices) {
        invoiceStore.removeInvoice(invoice.id)
      }
      
      console.log('🗑️ Proveedor eliminado:', supplier?.razon_social, `(${supplierInvoices.length} facturas)`)
    }
  }
  
  console.log('🎨 [SuppliersTable] Rendering with', suppliers.length, 'suppliers')
  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-background">
            <TableHead>Nombre</TableHead>
            <TableHead>RUC</TableHead>
            <TableHead>Total gastado</TableHead>
            <TableHead>Facturas</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-foreground/50 py-8">
                No hay proveedores registrados. Sube una factura para comenzar.
              </TableCell>
            </TableRow>
          ) : (
            suppliers.map((supplier) => (
            <TableRow key={supplier.ruc}>
              <TableCell className="font-medium">{supplier.razon_social}</TableCell>
              <TableCell className="text-text-secondary">{supplier.ruc}</TableCell>
              <TableCell>PEN {supplier.total_gastado.toFixed(2)}</TableCell>
              <TableCell>{supplier.facturas_count}</TableCell>
              <TableCell>
                <Badge variant={supplier.estado === "activo" ? "default" : "secondary"}>
                  {supplier.estado === "activo" ? "Activo" : "Inactivo"}
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
                    <DropdownMenuItem onClick={() => handleViewDetails(supplier.ruc)}>
                      Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(supplier.ruc)}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600 dark:text-red-400"
                      onClick={() => handleDelete(supplier.ruc)}
                    >
                      Eliminar
                    </DropdownMenuItem>
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
