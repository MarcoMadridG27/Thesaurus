"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, File, CheckCircle2, XCircle } from "lucide-react"
import { useState } from "react"
import { processInvoices } from "@/lib/api"
import { invoiceStore } from "@/lib/store"

interface FileWithStatus extends File {
  status?: 'pending' | 'processing' | 'success' | 'error'
  error?: string
}

export function InvoiceUploadArea() {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<FileWithStatus[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    const filesWithStatus = droppedFiles.map(file => Object.assign(file, { status: 'pending' as const }))
    setFiles([...files, ...filesWithStatus])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      const filesWithStatus = selectedFiles.map(file => Object.assign(file, { status: 'pending' as const }))
      setFiles([...files, ...filesWithStatus])
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    
    // Mark all files as processing
    setFiles(prev => prev.map(f => ({ ...f, status: 'processing' as const })))

    try {
      // Obtener tenant_id (RUC) del usuario logueado
      const userData = localStorage.getItem('userData')
      let tenantId = 'default-tenant'
      
      if (userData) {
        try {
          const user = JSON.parse(userData)
          tenantId = user.ruc || 'default-tenant'
        } catch (error) {
          console.error('Error al obtener RUC del usuario:', error)
        }
      }

      const result = await processInvoices(files, tenantId, 'factura')
      
      if (result.success) {
        // Agregar cada factura procesada al store
        if (result.data?.processed && Array.isArray(result.data.processed)) {
          console.log('📥 [Upload] Agregando', result.data.processed.length, 'facturas al store')
          for (const item of result.data.processed) {
            if (item.data) {
              await invoiceStore.addInvoice(item.data)
              console.log('✅ [Upload] Factura agregada:', item.file)
            }
          }
        }
        
        // Mark all files as success
        setFiles(prev => prev.map(f => ({ ...f, status: 'success' as const })))
        
        // Clear files after successful upload
        setTimeout(() => {
          setFiles([])
        }, 2000)
      } else {
        // Mark all files as error
        setFiles(prev => prev.map(f => ({ 
          ...f, 
          status: 'error' as const,
          error: result.error || 'Error al procesar'
        })))
      }
    } catch (error: unknown) {
      console.error("Error al procesar facturas:", error)
      setFiles(prev => prev.map(f => ({ 
        ...f, 
        status: 'error' as const,
        error: 'Error de conexión'
      })))
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Card
      className={`border-2 border-dashed p-8 text-center transition-colors ${
        isDragging ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-foreground">Arrastra tus facturas aquí</p>
          <p className="text-sm text-foreground/70">O haz clic para seleccionar archivos</p>
          <p className="text-xs text-foreground/60">PDF, PNG, JPG (máx. 10MB cada uno)</p>
        </div>
        
        <input
          type="file"
          id="file-upload"
          multiple
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileSelect}
          className="hidden"
        />
        <label htmlFor="file-upload">
          <Button variant="outline" type="button" onClick={() => document.getElementById('file-upload')?.click()}>
            Seleccionar archivos
          </Button>
        </label>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-foreground">{files.length} archivo(s) seleccionado(s)</p>
            <div className="space-y-1">
              {files.map((file, idx) => (
                <div key={`${file.name}-${file.size}-${idx}`} className="flex items-center justify-between gap-2 text-sm text-foreground/70 bg-muted/50 p-2 rounded border border-border">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <File className="w-4 h-4 shrink-0 text-foreground/60" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {file.status === 'processing' && (
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    )}
                    {file.status === 'success' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    )}
                    {file.status === 'error' && (
                      <div title={file.error}>
                        <XCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                      </div>
                    )}
                    {file.status === 'pending' && (
                      <button
                        onClick={() => removeFile(idx)}
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs font-bold w-5 h-5 flex items-center justify-center rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                        type="button"
                        aria-label="Eliminar archivo"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button 
              className="w-full" 
              onClick={handleUpload}
              disabled={isUploading || files.every(f => f.status !== 'pending')}
            >
              {isUploading ? 'Procesando...' : 'Subir y procesar'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
