"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, File } from "lucide-react"
import { useState } from "react"

export function InvoiceUploadArea() {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])

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
    setFiles([...files, ...droppedFiles])
  }

  return (
    <Card
      className={`border-2 border-dashed p-8 text-center transition-colors ${
        isDragging ? "border-primary bg-primary-light" : "border-border bg-background hover:border-primary/50"
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
          <p className="font-semibold text-text">Arrastra tus facturas aquí</p>
          <p className="text-sm text-text-secondary">O haz clic para seleccionar archivos</p>
          <p className="text-xs text-text-secondary">PDF, PNG, JPG (máx. 10MB cada uno)</p>
        </div>
        <Button variant="outline">Seleccionar archivos</Button>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-text">{files.length} archivo(s) seleccionado(s)</p>
            <div className="space-y-1">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-text-secondary">
                  <File className="w-4 h-4" />
                  {file.name}
                </div>
              ))}
            </div>
            <Button className="w-full">Subir y procesar</Button>
          </div>
        )}
      </div>
    </Card>
  )
}
