"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, RefreshCw, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { getInsightsSummary } from "@/lib/api"
import { invoiceStore } from "@/lib/store"

const getSentimentVariant = (sentiment: string) => {
  if (sentiment === 'positive') return 'default'
  if (sentiment === 'warning') return 'secondary'
  return 'outline'
}

const getSentimentLabel = (sentiment: string) => {
  if (sentiment === 'positive') return '✨ Positivo'
  if (sentiment === 'warning') return '⚠️ Alerta'
  if (sentiment === 'negative') return '🔴 Crítico'
  return '📊 Neutral'
}

export function AISummaryCard() {
  const [latestInsight, setLatestInsight] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const loadInsight = async () => {
    setLoading(true)
    try {
      const result = await getInsightsSummary('month')
      if (result.success && result.data?.latest_insight) {
        setLatestInsight(result.data.latest_insight)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error("Error loading insight:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateNewInsight = async () => {
    setGenerating(true)
    try {
      const invoices = invoiceStore.getInvoices()
      
      if (invoices.length === 0) {
        console.log("No hay facturas para generar insight")
        return
      }

      const { analyzeInvoices } = await import('@/lib/api')
      const result = await analyzeInvoices(invoices, 'monthly')
      
      if (result.success && result.data?.ai_insight) {
        setLatestInsight(result.data.ai_insight)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error("Error generating insight:", error)
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    loadInsight()
  }, [])

  const formatRelativeTime = (date: string) => {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours}h`
    return `Hace ${Math.floor(diffHours / 24)}d`
  }

  return (
    <Card className="p-6 bg-linear-to-br from-primary-light to-background space-y-4 border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-text">Insights IA</h3>
        </div>
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={loadInsight}
          disabled={loading}
          className="h-8 w-8"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="space-y-3">
        {loading && (
          <div className="p-4 text-center text-sm text-foreground/50">
            Cargando insight...
          </div>
        )}
        
        {!loading && latestInsight && (
          <>
            <div className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-primary/10 space-y-2">
              <div className="flex items-center justify-between">
                <Badge 
                  variant={getSentimentVariant(latestInsight.sentiment)}
                  className="text-xs"
                >
                  {getSentimentLabel(latestInsight.sentiment)}
                </Badge>
                <span className="text-xs text-text-secondary">
                  {formatRelativeTime(latestInsight.created_at)}
                </span>
              </div>
              <p className="font-medium text-text text-sm leading-relaxed">
                {latestInsight.text}
              </p>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={generateNewInsight}
              disabled={generating}
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {generating ? 'Generando...' : 'Actualizar Análisis'}
            </Button>
          </>
        )}
        
        {!loading && !latestInsight && (
          <div className="p-4 text-center space-y-3">
            <p className="text-sm text-foreground/50">No hay insights generados aún</p>
            <Button 
              size="sm" 
              onClick={generateNewInsight}
              disabled={generating || invoiceStore.getStats().invoiceCount === 0}
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {generating ? 'Generando...' : 'Generar Insight'}
            </Button>
          </div>
        )}
      </div>

      {lastUpdate && (
        <Badge variant="secondary" className="w-full text-center py-2">
          Actualizado {formatRelativeTime(lastUpdate.toISOString())}
        </Badge>
      )}
    </Card>
  )
}
