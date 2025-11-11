"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const mockSuppliers = [
  {
    id: 1,
    name: "Proveedor A",
    contactEmail: "contact@proveedora.com",
    totalSpent: "$12,450",
    invoiceCount: 8,
    status: "activo",
  },
  {
    id: 2,
    name: "Proveedor B",
    contactEmail: "info@proveedorb.com",
    totalSpent: "$8,200",
    invoiceCount: 5,
    status: "activo",
  },
  {
    id: 3,
    name: "Proveedor C",
    contactEmail: "hello@proveedorc.com",
    totalSpent: "$5,100",
    invoiceCount: 3,
    status: "inactivo",
  },
]

export function SuppliersTable() {
  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-background">
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Total gastado</TableHead>
            <TableHead>Facturas</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockSuppliers.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell className="font-medium">{supplier.name}</TableCell>
              <TableCell className="text-text-secondary">{supplier.contactEmail}</TableCell>
              <TableCell>{supplier.totalSpent}</TableCell>
              <TableCell>{supplier.invoiceCount}</TableCell>
              <TableCell>
                <Badge variant={supplier.status === "activo" ? "default" : "secondary"}>
                  {supplier.status === "activo" ? "Activo" : "Inactivo"}
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
                    <DropdownMenuItem>Editar</DropdownMenuItem>
                    <DropdownMenuItem className="text-error">Eliminar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
