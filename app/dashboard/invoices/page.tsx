"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import { InvoiceUploadArea } from "@/components/dashboard/invoice-upload-area"
import { InvoiceTable } from "@/components/dashboard/invoice-table"
import { useState } from "react"

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-text">Facturas</h1>
        <p className="text-text-secondary">Gestiona y analiza todas tus facturas</p>
      </div>

      {/* Upload Section */}
      <InvoiceUploadArea />

      {/* Debug buttons - Remove in production */}
      <div className="flex gap-2 p-4 bg-muted/50 rounded-lg border border-border">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            const testInvoice = {
              invoice_id: 'TEST-' + Date.now(),
              doc_kind: 'factura',
              data: {
                provider: {
                  ruc: '20123456789',
                  razon_social: 'EMPRESA DE PRUEBA SAC'
                },
                invoice: {
                  numero: 'F001-00001',
                  fecha: new Date().toISOString().split('T')[0],
                  moneda: 'PEN',
                  subtotal: '100.00',
                  igv: '18.00',
                  total: '118.00'
                },
                items: []
              }
            }
            const { invoiceStore } = require('@/lib/store')
            invoiceStore.addInvoice(testInvoice)
            console.log('✅ Factura de prueba agregada')
          }}
        >
          🧪 Agregar Factura de Prueba
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
          <Input
            placeholder="Buscar factura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Filter className="w-4 h-4" />
          Filtros
        </Button>
      </div>

      {/* Invoices Table */}
      <InvoiceTable />
    </div>
  )
}
