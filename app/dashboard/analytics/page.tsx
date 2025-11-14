"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, RefreshCw, TrendingUp, Calendar, Download } from "lucide-react"
import { useState, useEffect } from "react"
import { 
  getInsightsSummary,
  getRecommendations
} from "@/lib/api"
import { invoiceStore } from "@/lib/store"
import { ExpenseChart } from "@/components/dashboard/expense-chart"
import { SupplierChart } from "@/components/dashboard/supplier-chart"
import { CategoryChart } from "@/components/dashboard/category-chart"

const getSentimentBadgeVariant = (sentiment: string) => {
  if (sentiment === 'positive') return 'default'
  if (sentiment === 'warning') return 'secondary'
  return 'destructive'
}

const getPriorityBadgeVariant = (priority: string) => {
  if (priority === 'high') return 'destructive'
  if (priority === 'medium') return 'secondary'
  return 'default'
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [showCharts, setShowCharts] = useState(false)
  const [mounted, setMounted] = useState(false)

  const loadSummary = async () => {
    setLoading(true)
    try {
      const result = await getInsightsSummary('month')
      if (result.success && result.data) {
        setSummary(result.data)
      }
    } catch (error) {
      console.error("Error loading summary:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadRecommendations = async () => {
    try {
      const invoices = invoiceStore.getInvoices()
      const result = await getRecommendations('month', invoices)
      if (result.success && result.data?.recommendations) {
        setRecommendations(result.data.recommendations)
      }
    } catch (error) {
      console.error("Error loading recommendations:", error)
    }
  }

  const generateNewAnalysis = async () => {
    setGenerating(true)
    try {
      const invoices = invoiceStore.getInvoices()
      
      if (invoices.length === 0) {
        alert("No hay facturas para analizar. Sube algunas facturas primero.")
        return
      }

      await invoiceStore.generateInsightForInvoices()
      await loadSummary()
      await loadRecommendations()
    } catch (error) {
      console.error("Error generating analysis:", error)
      alert("Error al generar análisis")
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    loadSummary()
    loadRecommendations()
  }, [])

  const formatDate = (dateString: string) => {
    if (!mounted) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!mounted) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Analytics & Insights</h1>
          <p className="text-text-secondary mt-1">
            Insights generados por IA basados en tus datos financieros
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowCharts(!showCharts)}
          >
            {showCharts ? 'Ver Insights' : 'Ver Gráficas'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              loadSummary()
              loadRecommendations()
            }}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button 
            onClick={generateNewAnalysis}
            disabled={generating}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generating ? 'Analizando...' : 'Analizar Facturas'}
          </Button>
        </div>
      </div>

      {showCharts ? (
        <>
          <div className="flex justify-end">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <ExpenseChart title="Evolución de gastos" />
            <CategoryChart />
          </div>
          <SupplierChart />
        </>
      ) : (
        <>
          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Gasto Total (Mes)</p>
                  <p className="text-2xl font-bold text-text">
                    {summary?.summary?.total_spent ? `S/ ${summary.summary.total_spent.toFixed(2)}` : 'S/ 0.00'}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Facturas Procesadas</p>
                  <p className="text-2xl font-bold text-text">
                    {summary?.summary?.invoice_count || invoiceStore.getStats().invoiceCount}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Proveedores Activos</p>
                  <p className="text-lg font-semibold text-text">
                    {summary?.summary?.supplier_count || invoiceStore.getStats().supplierCount}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Latest Insight */}
          {summary?.latest_insight && (
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-text">Último Análisis</h3>
                    <Badge variant={getSentimentBadgeVariant(summary.latest_insight.sentiment)}>
                      {summary.latest_insight.sentiment}
                    </Badge>
                  </div>
                  <p className="text-text leading-relaxed">{summary.latest_insight.text}</p>
                  <p className="text-sm text-text-secondary mt-2">
                    {formatDate(summary.latest_insight.created_at)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-text">Recomendaciones</h2>
              {recommendations.map((rec) => (
                <Card key={rec.id} className="p-6 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getPriorityBadgeVariant(rec.priority)}>
                          {rec.priority}
                        </Badge>
                        <Badge variant="outline">{rec.category}</Badge>
                      </div>
                      <h3 className="font-semibold text-text text-lg mb-2">{rec.title}</h3>
                      <p className="text-text-secondary mb-3">{rec.description}</p>
                      {rec.impact && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mb-3">
                          <p className="text-sm font-medium text-green-700 dark:text-green-400">
                            Ahorro potencial: {rec.impact.currency} {rec.impact.potential_savings.toFixed(2)} / {rec.impact.timeframe}
                          </p>
                        </div>
                      )}
                      {rec.action_items && rec.action_items.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-text mb-2">Acciones sugeridas:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary">
                            {rec.action_items.map((action: string) => (
                              <li key={action}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {loading && (
            <Card className="p-8 text-center">
              <div className="flex items-center justify-center gap-2 text-foreground/50">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <p>Cargando análisis...</p>
              </div>
            </Card>
          )}
          
          {!loading && !summary && invoiceStore.getStats().invoiceCount === 0 && (
            <Card className="p-8 text-center space-y-4">
              <Sparkles className="w-12 h-12 mx-auto text-primary/50" />
              <div>
                <p className="text-lg font-semibold text-text">No hay datos para analizar</p>
                <p className="text-text-secondary mt-1">
                  Sube algunas facturas primero para generar análisis e insights
                </p>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
