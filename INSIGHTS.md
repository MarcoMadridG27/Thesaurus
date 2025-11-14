# 📊 API Documentation - Insights Service v2.0

## 📋 Información General

**Nombre del Servicio:** Insights Service  
**Versión:** 2.0.0  
**Base URL:** `http://localhost:2000`  
**Documentación Interactiva:** `http://localhost:2000/docs`

### Descripción
Microservicio de análisis de facturas que genera insights automáticos utilizando IA. Diseñado específicamente para integrarse con dashboards y visualizaciones en el frontend, devuelve datos estructurados listos para gráficas (Chart.js, Recharts, etc.).

### 🎯 Características para Frontend
- ✅ **Datos listos para gráficas** - Arrays de labels y datasets
- ✅ **Métricas calculadas** - Promedios, totales, tendencias, crecimiento
- ✅ **Insights en texto** - Conclusiones en lenguaje natural generadas por IA
- ✅ **Colores predefinidos** - Para visualización consistente
- ✅ **Análisis de proveedores** - Top suppliers con tendencias
- ✅ **Categorización automática** - Clasificación inteligente de gastos
- ✅ **Recomendaciones accionables** - Sugerencias de optimización
- ✅ **Alertas inteligentes** - Detección de patrones inusuales

---

## 🔧 Configuración

### Variables de Entorno Requeridas

```env
# Base de datos PostgreSQL
DB_URL=postgresql://postgres:password@localhost:5433/postgres

# OpenAI API Key (requerida para generar insights con IA)
OPENAI_API_KEY=sk-proj-xxxxx...

# Configuración del servidor
PORT=2000
HOST=0.0.0.0
```

### CORS
El servicio está configurado con CORS habilitado para todos los orígenes (`*`). En producción, debe configurarse con orígenes específicos.

---

## 📍 Endpoints

### 1. POST `/insights/analyze-invoices`

**Descripción:** Analiza todas las facturas y devuelve insights estructurados con datos listos para gráficas. **Este es el endpoint principal para el análisis completo.**

**Request Body:**
```json
{
  "invoices": [
    {
      "id": "INV-001",
      "numero": "F001-00001",
      "proveedor": "EMPRESA ABC SAC",
      "ruc": "20123456789",
      "fecha": "2024-11-01",
      "moneda": "PEN",
      "subtotal": 100.00,
      "igv": 18.00,
      "total": 118.00,
      "items": [
        {
          "descripcion": "Producto A",
          "cantidad": "2",
          "precio_unitario": "50.00",
          "total": "100.00"
        }
      ]
    }
  ],
  "period": "monthly"
}
```

**Parámetros:**

| Campo | Tipo | Requerido | Valores Permitidos | Descripción |
|-------|------|-----------|-------------------|-------------|
| `invoices` | `array` | ✅ Sí | - | Array de objetos de factura |
| `period` | `string` | ❌ No | `weekly`, `monthly`, `quarterly`, `yearly` | Período de análisis (default: `monthly`) |

**Response 200 OK:**
```json
{
  "success": true,
  "analysis_date": "2024-11-14T10:30:00Z",
  "period": "monthly",
  
  "summary": {
    "total_invoices": 48,
    "total_spent": 12450.50,
    "average_invoice": 259.39,
    "total_suppliers": 12,
    "growth_percentage": 15.5,
    "trend": "increasing"
  },

  "ai_insight": {
    "id": 1,
    "text": "Tus gastos aumentaron un 15.5% este mes comparado con el mes anterior. El principal incremento proviene de EMPRESA ABC SAC (+25%). Se recomienda revisar los precios con este proveedor para optimizar costos.",
    "sentiment": "warning",
    "priority": "high",
    "created_at": "2024-11-14T10:30:00Z"
  },

  "expense_trend": {
    "labels": ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
    "datasets": [
      {
        "label": "Gastos",
        "data": [2800.00, 3200.00, 3450.00, 3000.50],
        "color": "#8b5cf6"
      },
      {
        "label": "Período Anterior",
        "data": [2600.00, 2900.00, 3100.00, 2800.00],
        "color": "#d1d5db",
        "dashed": true
      }
    ]
  },

  "top_suppliers": [
    {
      "ruc": "20123456789",
      "name": "EMPRESA ABC SAC",
      "total_spent": 4500.00,
      "invoice_count": 15,
      "percentage": 36.2,
      "trend": "up",
      "change_percentage": 25.0
    }
  ],

  "categories": [
    {
      "name": "Servicios",
      "total": 5500.00,
      "percentage": 44.2,
      "count": 20,
      "color": "#8b5cf6"
    }
  ],

  "metrics": {
    "highest_invoice": {
      "id": "INV-025",
      "amount": 850.00,
      "supplier": "EMPRESA ABC SAC",
      "date": "2024-11-10"
    },
    "most_frequent_supplier": {
      "ruc": "20123456789",
      "name": "EMPRESA ABC SAC",
      "invoice_count": 15
    },
    "average_days_between_invoices": 2.3,
    "projected_monthly_total": 13500.00
  },

  "recommendations": [
    {
      "id": 1,
      "type": "cost_optimization",
      "priority": "high",
      "title": "Revisar precios con EMPRESA ABC SAC",
      "description": "Este proveedor incrementó sus precios un 25%. Considera negociar o buscar alternativas.",
      "potential_savings": 450.00
    }
  ],

  "alerts": [
    {
      "id": 1,
      "type": "unusual_spending",
      "severity": "warning",
      "message": "Gasto inusualmente alto detectado el 10 de noviembre (850.00 PEN)",
      "date": "2024-11-10"
    }
  ]
}
```

**Códigos de Error:**
- `400` - Datos inválidos o formato incorrecto
- `500` - Error del servidor o error de OpenAI API

---

### 2. GET `/insights/summary-quick`

**Descripción:** Obtiene el resumen ejecutivo más reciente para el dashboard principal.

**Query Parameters:**

| Parámetro | Tipo | Default | Valores | Descripción |
|-----------|------|---------|---------|-------------|
| `period` | `string` | `month` | `week`, `month`, `quarter`, `year` | Período de análisis |

**Ejemplo:**
```bash
GET /insights/summary-quick?period=month
```

**Response 200 OK:**
```json
{
  "success": true,
  "period": "month",
  "summary": {
    "total_spent": 12450.50,
    "total_invoices": 48,
    "total_suppliers": 12,
    "growth_percentage": 15.5
  },
  "latest_insight": {
    "id": 1,
    "text": "Tus gastos aumentaron un 15.5% este mes...",
    "sentiment": "warning",
    "priority": "high",
    "created_at": "2024-11-14T10:30:00Z"
  },
  "quick_stats": [
    {
      "label": "Gasto total (month)",
      "value": "12,450.50",
      "currency": "PEN",
      "change": "+15.5%",
      "trend": "up"
    },
    {
      "label": "Facturas procesadas",
      "value": "48",
      "change": "+5",
      "trend": "up"
    },
    {
      "label": "Proveedores activos",
      "value": "12",
      "change": "0",
      "trend": "stable"
    },
    {
      "label": "Ahorro potencial",
      "value": "750.00",
      "currency": "PEN",
      "change": "Detectado",
      "trend": "neutral"
    }
  ]
}
```

**Uso en Frontend:**
Este endpoint es perfecto para los **StatCards** del dashboard principal.

---

### 3. GET `/insights/chart-data/{chart_type}`

**Descripción:** Obtiene datos específicos para una gráfica individual.

**Path Parameters:**

| Parámetro | Tipo | Valores | Descripción |
|-----------|------|---------|-------------|
| `chart_type` | `string` | `expense`, `supplier`, `category` | Tipo de gráfica |

**Query Parameters:**

| Parámetro | Tipo | Default | Valores | Descripción |
|-----------|------|---------|---------|-------------|
| `period` | `string` | `month` | `week`, `month`, `quarter`, `year` | Período |

**Ejemplos:**

```bash
# Datos para gráfica de gastos
GET /insights/chart-data/expense?period=month

# Datos para gráfica de proveedores
GET /insights/chart-data/supplier?period=month

# Datos para gráfica de categorías
GET /insights/chart-data/category?period=month
```

**Response para `expense`:**
```json
{
  "success": true,
  "chart_type": "expense",
  "period": "month",
  "data": {
    "labels": ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
    "datasets": [
      {
        "label": "Este mes",
        "data": [2800.00, 3200.00, 3450.00, 3000.50],
        "backgroundColor": "#8b5cf6",
        "borderColor": "#8b5cf6"
      },
      {
        "label": "Mes anterior",
        "data": [2600.00, 2900.00, 3100.00, 2800.00],
        "backgroundColor": "#d1d5db",
        "borderColor": "#d1d5db",
        "borderDash": [5, 5]
      }
    ]
  }
}
```

**Response para `supplier`:**
```json
{
  "success": true,
  "chart_type": "supplier",
  "data": {
    "labels": ["EMPRESA ABC SAC", "EMPRESA XYZ SAC", "PROVEEDOR 123 SAC", "Otros"],
    "datasets": [
      {
        "label": "Gasto por Proveedor",
        "data": [4500.00, 3200.00, 2100.00, 2650.50],
        "backgroundColor": ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"]
      }
    ],
    "details": [
      {
        "supplier": "EMPRESA ABC SAC",
        "ruc": "20123456789",
        "amount": 4500.00,
        "percentage": 36.2,
        "invoice_count": 15
      }
    ]
  }
}
```

**Response para `category`:**
```json
{
  "success": true,
  "chart_type": "category",
  "data": {
    "labels": ["Servicios", "Productos", "Insumos"],
    "datasets": [
      {
        "label": "Gasto por Categoría",
        "data": [5500.00, 4200.00, 2750.50],
        "backgroundColor": ["#8b5cf6", "#3b82f6", "#10b981"]
      }
    ]
  }
}
```

---

### 4. POST `/insights/generate-text`

**Descripción:** Genera un insight en texto natural usando IA (solo texto, sin análisis numérico completo).

**Request Body:**
```json
{
  "context": "Análisis de gastos mensuales",
  "data": {
    "total_spent": 12450.50,
    "invoice_count": 48,
    "top_supplier": "EMPRESA ABC SAC",
    "growth": 15.5
  }
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "insight": {
    "id": 1,
    "text": "Este mes has gastado PEN 12,450.50 en 48 facturas, lo que representa un incremento del 15.5% respecto al mes anterior. Tu principal proveedor es EMPRESA ABC SAC. Se recomienda revisar oportunidades de consolidación para optimizar costos.",
    "sentiment": "neutral",
    "priority": "medium",
    "tags": ["gastos", "tendencia", "proveedores"],
    "created_at": "2024-11-14T10:30:00Z"
  }
}
```

---

### 5. GET `/insights/recommendations`

**Descripción:** Obtiene recomendaciones accionables basadas en el análisis de facturas.

**Response 200 OK:**
```json
{
  "success": true,
  "recommendations": [
    {
      "id": 1,
      "category": "cost_reduction",
      "priority": "high",
      "title": "Negociar precios con proveedor principal",
      "description": "Tu proveedor principal ha incrementado sus precios un 25% en los últimos 3 meses. Una renegociación podría resultar en ahorros significativos.",
      "impact": {
        "potential_savings": 450.00,
        "currency": "PEN",
        "timeframe": "monthly"
      },
      "action_items": [
        "Contactar al proveedor para renegociación",
        "Solicitar cotizaciones a proveedores alternativos",
        "Evaluar contratos de largo plazo para mejores precios"
      ],
      "created_at": "2024-11-14T10:30:00Z"
    },
    {
      "id": 2,
      "category": "efficiency",
      "priority": "medium",
      "title": "Consolidar compras mensuales",
      "description": "Consolidando compras podrías reducir costos administrativos y obtener mejores precios por volumen.",
      "impact": {
        "potential_savings": 200.00,
        "currency": "PEN",
        "timeframe": "monthly"
      },
      "action_items": [
        "Programar compras quincenales en lugar de semanales",
        "Negociar descuentos por volumen"
      ],
      "created_at": "2024-11-14T10:30:00Z"
    }
  ],
  "total_potential_savings": 650.00,
  "currency": "PEN"
}
```

---

### 6. GET `/health`

**Descripción:** Verifica el estado del servicio y la conexión a la base de datos.

**Response 200 OK:**
```json
{
  "status": "healthy",
  "service": "Insights Service",
  "version": "2.0.0",
  "database": "connected"
}
```

---

## 📊 Modelos de Datos (TypeScript)

### Invoice
```typescript
interface InvoiceItem {
  descripcion: string;
  cantidad: string;
  precio_unitario: string;
  total: string;
}

interface Invoice {
  id: string;
  numero: string;
  proveedor: string;
  ruc: string;
  fecha: string;  // YYYY-MM-DD
  moneda: string;  // "PEN", "USD", etc.
  subtotal: number;
  igv: number;
  total: number;
  items: InvoiceItem[];
}
```

### AnalyzeInvoicesRequest
```typescript
interface AnalyzeInvoicesRequest {
  invoices: Invoice[];
  period: "weekly" | "monthly" | "quarterly" | "yearly";
}
```

### AnalyzeInvoicesResponse
```typescript
interface Summary {
  total_invoices: number;
  total_spent: number;
  average_invoice: number;
  total_suppliers: number;
  growth_percentage: number;
  trend: "increasing" | "decreasing" | "stable";
}

interface AIInsight {
  id: number;
  text: string;
  sentiment: "positive" | "neutral" | "warning" | "negative";
  priority: "low" | "medium" | "high";
  created_at: string;
}

interface Dataset {
  label: string;
  data: number[];
  color: string;
  dashed?: boolean;
}

interface ExpenseTrend {
  labels: string[];
  datasets: Dataset[];
}

interface TopSupplier {
  ruc: string;
  name: string;
  total_spent: number;
  invoice_count: number;
  percentage: number;
  trend: "up" | "down" | "stable";
  change_percentage: number;
}

interface Category {
  name: string;
  total: number;
  percentage: number;
  count: number;
  color: string;
}

interface Metrics {
  highest_invoice: {
    id: string;
    amount: number;
    supplier: string;
    date: string;
  };
  most_frequent_supplier: {
    ruc: string;
    name: string;
    invoice_count: number;
  };
  average_days_between_invoices: number;
  projected_monthly_total: number;
}

interface Recommendation {
  id: number;
  type: string;
  priority: string;
  title: string;
  description: string;
  potential_savings: number;
}

interface Alert {
  id: number;
  type: string;
  severity: string;
  message: string;
  date: string;
}

interface AnalyzeInvoicesResponse {
  success: boolean;
  analysis_date: string;
  period: string;
  summary: Summary;
  ai_insight: AIInsight;
  expense_trend: ExpenseTrend;
  top_suppliers: TopSupplier[];
  categories: Category[];
  metrics: Metrics;
  recommendations: Recommendation[];
  alerts: Alert[];
}
```

---

## 🚀 Ejemplos de Integración Frontend

### React + TypeScript + Fetch

```typescript
const API_BASE_URL = 'http://localhost:2000';

// Función principal: Analizar facturas
async function analyzeInvoices(invoices: Invoice[], period: string = 'monthly') {
  const response = await fetch(`${API_BASE_URL}/insights/analyze-invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invoices, period }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error analyzing invoices');
  }
  
  return await response.json() as AnalyzeInvoicesResponse;
}

// Obtener summary para dashboard
async function getQuickSummary(period: string = 'month') {
  const response = await fetch(
    `${API_BASE_URL}/insights/summary-quick?period=${period}`
  );
  return await response.json();
}

// Obtener datos específicos para gráfica
async function getChartData(chartType: 'expense' | 'supplier' | 'category', period: string = 'month') {
  const response = await fetch(
    `${API_BASE_URL}/insights/chart-data/${chartType}?period=${period}`
  );
  return await response.json();
}

// Obtener recomendaciones
async function getRecommendations() {
  const response = await fetch(`${API_BASE_URL}/insights/recommendations`);
  return await response.json();
}
```

### Ejemplo de Componente React

```tsx
import { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

function DashboardAnalytics() {
  const [analysis, setAnalysis] = useState<AnalyzeInvoicesResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (invoices: Invoice[]) => {
    setLoading(true);
    try {
      const result = await analyzeInvoices(invoices, 'monthly');
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Analizando facturas...</div>;
  if (!analysis) return <div>Sube facturas para ver el análisis</div>;

  return (
    <div className="dashboard">
      {/* AI Insight Card */}
      <div className="insight-card">
        <h3>💡 Insight Principal</h3>
        <p>{analysis.ai_insight.text}</p>
        <span className={`badge badge-${analysis.ai_insight.sentiment}`}>
          {analysis.ai_insight.priority}
        </span>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Gastado"
          value={`PEN ${analysis.summary.total_spent.toFixed(2)}`}
          change={`${analysis.summary.growth_percentage > 0 ? '+' : ''}${analysis.summary.growth_percentage}%`}
          trend={analysis.summary.trend}
        />
        <StatCard
          title="Facturas"
          value={analysis.summary.total_invoices}
        />
        <StatCard
          title="Proveedores"
          value={analysis.summary.total_suppliers}
        />
      </div>

      {/* Expense Trend Chart */}
      <div className="chart-container">
        <h3>📈 Tendencia de Gastos</h3>
        <Line
          data={{
            labels: analysis.expense_trend.labels,
            datasets: analysis.expense_trend.datasets.map(ds => ({
              label: ds.label,
              data: ds.data,
              borderColor: ds.color,
              backgroundColor: ds.color,
              borderDash: ds.dashed ? [5, 5] : [],
            })),
          }}
        />
      </div>

      {/* Top Suppliers */}
      <div className="chart-container">
        <h3>🏢 Top Proveedores</h3>
        <Bar
          data={{
            labels: analysis.top_suppliers.map(s => s.name),
            datasets: [{
              label: 'Gasto por Proveedor',
              data: analysis.top_suppliers.map(s => s.total_spent),
              backgroundColor: '#8b5cf6',
            }],
          }}
        />
      </div>

      {/* Categories */}
      <div className="chart-container">
        <h3>📊 Categorías</h3>
        <Doughnut
          data={{
            labels: analysis.categories.map(c => c.name),
            datasets: [{
              data: analysis.categories.map(c => c.total),
              backgroundColor: analysis.categories.map(c => c.color),
            }],
          }}
        />
      </div>

      {/* Recommendations */}
      <div className="recommendations">
        <h3>💡 Recomendaciones</h3>
        {analysis.recommendations.map(rec => (
          <div key={rec.id} className="recommendation-card">
            <h4>{rec.title}</h4>
            <p>{rec.description}</p>
            <div className="savings">
              Ahorro potencial: PEN {rec.potential_savings.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {analysis.alerts.length > 0 && (
        <div className="alerts">
          <h3>⚠️ Alertas</h3>
          {analysis.alerts.map(alert => (
            <div key={alert.id} className={`alert alert-${alert.severity}`}>
              {alert.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🎨 Flujo de Integración Recomendado

### 1. Cuando el usuario sube facturas (OCR completo):

```typescript
// 1. Procesar facturas con OCR
const invoices = await processInvoicesWithOCR(files);

// 2. Enviar a análisis
const analysis = await analyzeInvoices(invoices, 'monthly');

// 3. Guardar en store local (Redux/Zustand)
dispatch(setAnalysis(analysis));

// 4. Actualizar UI automáticamente con los datos
```

### 2. En el Dashboard Principal:

```typescript
// Cargar quick summary
const summary = await getQuickSummary('month');

// Renderizar StatCards
<StatCards data={summary.quick_stats} />

// Mostrar AI Insight
<AIInsightCard insight={summary.latest_insight} />
```

### 3. En la página de Analytics:

```typescript
// Cargar análisis completo desde el store
const analysis = useSelector(state => state.insights.currentAnalysis);

// O hacer un nuevo análisis
const newAnalysis = await analyzeInvoices(invoices);

// Renderizar todas las gráficas
<ExpenseChart data={analysis.expense_trend} />
<SupplierChart data={analysis.top_suppliers} />
<CategoryChart data={analysis.categories} />

// Mostrar recomendaciones
const recommendations = await getRecommendations();
<RecommendationsList data={recommendations} />
```

---

## ⚠️ Códigos de Error

| Código | Significado | Posibles Causas |
|--------|-------------|-----------------|
| `400` | Bad Request | Datos de factura inválidos, período inválido, falta campo requerido |
| `404` | Not Found | No hay datos disponibles, insight no encontrado |
| `500` | Internal Server Error | Error del servidor, fallo de OpenAI API, error de base de datos |
| `503` | Service Unavailable | Base de datos desconectada, servicio no disponible |

**Ejemplo de Error:**
```json
{
  "success": false,
  "error": "Invalid invoice data",
  "details": "At least one invoice is required for analysis"
}
```

---

## 📝 Notas Técnicas

### Categorización Automática
El servicio categoriza facturas basándose en:
- **Descripción de items**: Busca keywords en la descripción
- **Nombre del proveedor**: Identifica el tipo de negocio
- **Patrones de compra**: Analiza frecuencia y montos

**Categorías disponibles:**
- Servicios
- Productos
- Insumos
- Tecnología
- Marketing
- Oficina
- Otros

### Cálculo de Tendencias
- **Growth percentage**: `((total_actual - total_anterior) / total_anterior) * 100`
- **Trend determination**:
  - `increasing` si growth > 5%
  - `decreasing` si growth < -5%
  - `stable` si growth entre -5% y 5%

### Detección de Alertas
- Facturas > 2x el promedio generan alerta de "unusual_spending"
- Incrementos > 15% en proveedores generan recomendaciones
- Máximo 3 alertas por análisis

---

## 🔒 Mejores Prácticas

1. **Siempre validar datos antes de enviar**: Asegúrate que las facturas tengan todos los campos requeridos
2. **Manejar errores gracefully**: Usa try/catch y muestra mensajes amigables al usuario
3. **Cachear resultados**: Guarda el análisis en el store local para evitar llamadas innecesarias
4. **Mostrar loading states**: El análisis con IA puede tomar algunos segundos
5. **Actualizar periódicamente**: Re-analizar cuando se agreguen nuevas facturas

---

## 📌 Versión

**Última actualización:** 14 de Noviembre de 2025  
**Versión de la API:** 2.0.0  
**Compatible con:** React, Vue, Angular, Next.js, cualquier framework moderno

---

## 🆘 Soporte

Para más información, consulta:
- **Swagger UI:** http://localhost:2000/docs
- **ReDoc:** http://localhost:2000/redoc
- **Health Check:** http://localhost:2000/health
