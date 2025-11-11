"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const mockInvoices = [
  {
    id: "INV-001",
    supplier: "Proveedor A",
    date: "2024-01-15",
    amount: "$1,250.00",
    status: "procesado",
  },
  {
    id: "INV-002",
    supplier: "Proveedor B",
    date: "2024-01-14",
    amount: "$850.50",
    status: "procesado",
  },
  {
    id: "INV-003",
    supplier: "Proveedor C",
    date: "2024-01-13",
    amount: "$2,100.00",
    status: "pendiente",
  },
  {
    id: "INV-004",
    supplier: "Proveedor A",
    date: "2024-01-12",
    amount: "$450.75",
    status: "procesado",
  },
]

export function InvoiceTable() {
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
          {mockInvoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.id}</TableCell>
              <TableCell>{invoice.supplier}</TableCell>
              <TableCell>{invoice.date}</TableCell>
              <TableCell>{invoice.amount}</TableCell>
              <TableCell>
                <Badge variant={invoice.status === "procesado" ? "default" : "secondary"}>
                  {invoice.status === "procesado" ? "Procesado" : "Pendiente"}
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
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
