// Simple state management for invoices and suppliers
type Invoice = {
  id: string
  numero: string
  proveedor: string
  ruc: string
  fecha: string
  moneda: string
  subtotal: number
  igv: number
  total: number
  estado: string
  doc_kind: 'factura' | 'boleta'
  items: Array<{
    descripcion: string
    cantidad: string
    precio_unitario: string
    total: string
  }>
  raw_data?: any
}

type Supplier = {
  ruc: string
  razon_social: string
  total_gastado: number
  facturas_count: number
  estado: 'activo' | 'inactivo'
}

class InvoiceStore {
  private invoices: Invoice[] = []
  private readonly suppliers: Map<string, Supplier> = new Map()
  private readonly listeners: Set<() => void> = new Set()

  constructor() {
    // Load from localStorage on initialization
    if (globalThis.window !== undefined) {
      const stored = localStorage.getItem('invoices')
      if (stored) {
        try {
          this.invoices = JSON.parse(stored)
          this.updateSuppliers()
          
          // Si hay facturas existentes, analizar automáticamente
          if (this.invoices.length > 0) {
            console.log('📊 [STORE] Facturas existentes encontradas, enviando a análisis...')
            this.generateInsightForInvoices().catch(err => {
              console.error('Error auto-analyzing existing invoices:', err)
            })
          }
        } catch (e) {
          console.error('Error loading invoices from storage:', e)
        }
      }
    }
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    for (const listener of this.listeners) {
      listener()
    }
  }

  private persist() {
    if (globalThis.window !== undefined) {
      localStorage.setItem('invoices', JSON.stringify(this.invoices))
    }
  }

  private updateSuppliers() {
    this.suppliers.clear()
    
    for (const invoice of this.invoices) {
      const existing = this.suppliers.get(invoice.ruc)
      if (existing) {
        existing.total_gastado += invoice.total
        existing.facturas_count += 1
      } else {
        this.suppliers.set(invoice.ruc, {
          ruc: invoice.ruc,
          razon_social: invoice.proveedor,
          total_gastado: invoice.total,
          facturas_count: 1,
          estado: 'activo',
        })
      }
    }
  }

  async addInvoice(ocrData: any) {
    console.log('🔵 [STORE] Adding invoice from OCR data:', ocrData)
    
    const invoice: Invoice = {
      id: ocrData.invoice_id || `INV-${Date.now()}`,
      numero: ocrData.data?.invoice?.numero || 'N/A',
      proveedor: ocrData.data?.provider?.razon_social || 'N/A',
      ruc: ocrData.data?.provider?.ruc || 'N/A',
      fecha: ocrData.data?.invoice?.fecha || new Date().toISOString().split('T')[0],
      moneda: ocrData.data?.invoice?.moneda || 'PEN',
      subtotal: Number.parseFloat(ocrData.data?.invoice?.subtotal || '0'),
      igv: Number.parseFloat(ocrData.data?.invoice?.igv || '0'),
      total: Number.parseFloat(ocrData.data?.invoice?.total || '0'),
      estado: 'procesado',
      doc_kind: ocrData.doc_kind || 'factura',
      items: ocrData.data?.items || [],
      raw_data: ocrData,
    }

    console.log('🟢 [STORE] Invoice object created:', invoice)
    
    this.invoices.unshift(invoice) // Add to beginning
    this.updateSuppliers()
    this.persist()
    
    console.log('🟢 [STORE] Total invoices now:', this.invoices.length)
    console.log('🟢 [STORE] Notifying', this.listeners.size, 'listeners')
    
    this.notify()
    
    // Generate insight automatically in background
    this.generateInsightForInvoices().catch(err => {
      console.error('Error generating insight:', err)
    })
    
    console.log('✅ [STORE] Invoice added successfully')
    return invoice
  }

  async generateInsightForInvoices() {
    if (this.invoices.length === 0) {
      console.log('⚠️ [STORE] No hay facturas para analizar')
      return
    }

    try {
      const { analyzeInvoices } = await import('./api')
      
      console.log('🤖 [STORE] Analizando', this.invoices.length, 'facturas con el microservicio...')
      
      // Send all invoices to the insights service
      const result = await analyzeInvoices(this.invoices, 'monthly')
      
      if (result.success && result.data) {
        console.log('✅ [STORE] Análisis completado:', result.data)
        
        // Store the analysis result
        if (globalThis.window !== undefined) {
          localStorage.setItem('latest_analysis', JSON.stringify(result.data))
          localStorage.setItem('analysis_timestamp', new Date().toISOString())
        }
        
        return result.data
      } else {
        console.error('❌ [STORE] Error en análisis:', result.error)
        return null
      }
    } catch (error) {
      console.error('❌ [STORE] Error en generateInsightForInvoices:', error)
      return null
    }
  }
  
  // Forzar re-análisis de todas las facturas
  async forceAnalyze() {
    console.log('🔄 [STORE] Forzando re-análisis de facturas...')
    return await this.generateInsightForInvoices()
  }

  getLatestAnalysis(): unknown {
    if (globalThis.window !== undefined) {
      const stored = localStorage.getItem('latest_analysis')
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch (e) {
          console.error('Error parsing analysis:', e)
          return null
        }
      }
    }
    return null
  }

  getInvoices(): Invoice[] {
    console.log('📋 [STORE] getInvoices called, returning', this.invoices.length, 'invoices')
    return [...this.invoices] // Return a copy to avoid mutations
  }

  getSuppliers(): Supplier[] {
    console.log('👥 [STORE] getSuppliers called, returning', this.suppliers.size, 'suppliers')
    return Array.from(this.suppliers.values())
  }

  getStats() {
    const total = this.invoices.reduce((sum, inv) => sum + inv.total, 0)
    const thisMonth = new Date().getMonth()
    const thisYear = new Date().getFullYear()
    
    const monthInvoices = this.invoices.filter(inv => {
      const invDate = new Date(inv.fecha)
      return invDate.getMonth() === thisMonth && invDate.getFullYear() === thisYear
    })
    
    const monthTotal = monthInvoices.reduce((sum, inv) => sum + inv.total, 0)
    
    return {
      totalSpent: total,
      monthlySpent: monthTotal,
      invoiceCount: this.invoices.length,
      supplierCount: this.suppliers.size,
      recentInvoices: this.invoices.slice(0, 5),
    }
  }

  clearAll() {
    this.invoices = []
    this.suppliers.clear()
    this.persist()
    this.notify()
  }
}

export const invoiceStore = new InvoiceStore()
export type { Invoice, Supplier }
