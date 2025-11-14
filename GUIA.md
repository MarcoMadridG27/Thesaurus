# 📘 Guía de Endpoints para Frontend - Chat y Dashboard

## 🎯 Resumen Ejecutivo

Esta guía documenta los endpoints clave para el frontend: **Dashboard Summary** y **Recommendations**. Estos endpoints están optimizados para cargar rápidamente la información principal sin necesidad de enviar facturas cada vez.

---

## 1️⃣ Dashboard Summary - `/insights/summary-quick`

### 📋 Descripción

Endpoint diseñado para la **página principal del dashboard**. Devuelve un resumen ejecutivo con métricas clave y estadísticas rápidas que el usuario ve al entrar a la aplicación.

### 🔗 Endpoint

```
GET /insights/summary-quick?period=month
```

### 📥 Parámetros

| Parámetro | Tipo | Requerido | Valores | Descripción |
|-----------|------|-----------|---------|-------------|
| `period` | `string` | ❌ No | `week`, `month`, `quarter`, `year` | Período de análisis (default: `month`) |

### ✅ Response 200 OK

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
    "id": 123,
    "text": "Tus gastos han aumentado un 15.5% respecto al mes anterior. El proveedor EMPRESA ABC SAC representa el 36% de tus gastos totales.",
    "sentiment": "neutral",
    "priority": "medium",
    "created_at": "2024-11-14T10:30:00"
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

### 📦 Response cuando NO hay datos

Si el usuario aún no ha analizado facturas, el endpoint devuelve valores por defecto en lugar de un error:

```json
{
  "success": true,
  "period": "month",
  "summary": {
    "total_spent": 0,
    "total_invoices": 0,
    "total_suppliers": 0,
    "growth_percentage": 0
  },
  "latest_insight": {
    "id": 0,
    "text": "No hay datos de análisis disponibles. Sube facturas para comenzar.",
    "sentiment": "neutral",
    "priority": "low",
    "created_at": "2024-11-14T11:52:00"
  },
  "quick_stats": [
    {
      "label": "Gasto total (month)",
      "value": "0.00",
      "currency": "PEN",
      "change": "0%",
      "trend": "neutral"
    },
    {
      "label": "Facturas procesadas",
      "value": "0",
      "change": "0",
      "trend": "neutral"
    },
    {
      "label": "Proveedores activos",
      "value": "0",
      "change": "0",
      "trend": "neutral"
    },
    {
      "label": "Ahorro potencial",
      "value": "0.00",
      "currency": "PEN",
      "change": "N/A",
      "trend": "neutral"
    }
  ]
}
```

### 💻 Ejemplo en TypeScript/React

```typescript
import { useEffect, useState } from 'react';

interface QuickStat {
  label: string;
  value: string;
  currency?: string;
  change: string;
  trend: 'up' | 'down' | 'stable' | 'neutral';
}

interface DashboardSummary {
  success: boolean;
  period: string;
  summary: {
    total_spent: number;
    total_invoices: number;
    total_suppliers: number;
    growth_percentage: number;
  };
  latest_insight: {
    id: number;
    text: string;
    sentiment: string;
    priority: string;
    created_at: string;
  };
  quick_stats: QuickStat[];
}

export const DashboardPage = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  const fetchDashboardSummary = async (period = 'month') => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:2000/insights/summary-quick?period=${period}`
      );
      
      if (!response.ok) {
        throw new Error('Error al cargar el resumen');
      }
      
      const data = await response.json();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando dashboard...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!summary) return null;

  return (
    <div className="dashboard">
      {/* Header con período */}
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <select onChange={(e) => fetchDashboardSummary(e.target.value)}>
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
          <option value="quarter">Este trimestre</option>
          <option value="year">Este año</option>
        </select>
      </div>

      {/* Cards de estadísticas rápidas */}
      <div className="stats-grid">
        {summary.quick_stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <h3>{stat.label}</h3>
            <div className="stat-value">
              {stat.currency && `${stat.currency} `}
              {stat.value}
            </div>
            <div className={`stat-change trend-${stat.trend}`}>
              {stat.trend === 'up' && '↑'}
              {stat.trend === 'down' && '↓'}
              {stat.trend === 'stable' && '→'}
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Insight más reciente */}
      <div className="insight-card">
        <h2>💡 Insight Principal</h2>
        <p className={`priority-${summary.latest_insight.priority}`}>
          {summary.latest_insight.text}
        </p>
        <small>
          {new Date(summary.latest_insight.created_at).toLocaleDateString('es-PE')}
        </small>
      </div>

      {/* Resumen de métricas */}
      <div className="metrics-summary">
        <h2>📊 Métricas del Período</h2>
        <ul>
          <li>Total gastado: S/. {summary.summary.total_spent.toLocaleString()}</li>
          <li>Facturas procesadas: {summary.summary.total_invoices}</li>
          <li>Proveedores activos: {summary.summary.total_suppliers}</li>
          <li>
            Crecimiento: 
            <span className={summary.summary.growth_percentage > 0 ? 'positive' : 'negative'}>
              {summary.summary.growth_percentage > 0 ? '+' : ''}
              {summary.summary.growth_percentage}%
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
```

### 🎨 Ejemplo de CSS para los trends

```css
.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  margin: 10px 0;
}

.stat-change {
  font-size: 0.9rem;
  font-weight: 500;
}

.trend-up {
  color: #10b981;
}

.trend-down {
  color: #ef4444;
}

.trend-stable {
  color: #6b7280;
}

.trend-neutral {
  color: #3b82f6;
}

.priority-high {
  border-left: 4px solid #ef4444;
  padding-left: 12px;
}

.priority-medium {
  border-left: 4px solid #f59e0b;
  padding-left: 12px;
}

.priority-low {
  border-left: 4px solid #6b7280;
  padding-left: 12px;
}
```

---

## 2️⃣ Recommendations - `/insights/recommendations`

### 📋 Descripción

Endpoint para obtener **recomendaciones accionables** basadas en el análisis de facturas. Muestra oportunidades de ahorro, alertas y mejores prácticas.

### 🔗 Endpoint

```
GET /insights/recommendations?period=month
```

### 📥 Parámetros

| Parámetro | Tipo | Requerido | Valores | Descripción |
|-----------|------|-----------|---------|-------------|
| `period` | `string` | ❌ No | `week`, `month`, `quarter`, `year` | Período de análisis (default: `month`) |

### ✅ Response 200 OK

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
      "created_at": "2024-11-14T10:30:00"
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
      "created_at": "2024-11-14T10:30:00"
    }
  ],
  "total_potential_savings": 650.00,
  "currency": "PEN"
}
```

### 📊 Tipos de Categorías

| Categoría | Descripción | Color Sugerido |
|-----------|-------------|----------------|
| `cost_reduction` | Oportunidades de reducción de costos | 🟢 Verde |
| `efficiency` | Mejoras de eficiencia operativa | 🔵 Azul |
| `risk_management` | Gestión de riesgos | 🟡 Amarillo |
| `optimization` | Optimización de procesos | 🟣 Morado |

### 📊 Niveles de Prioridad

| Prioridad | Descripción | Color |
|-----------|-------------|-------|
| `high` | Acción inmediata recomendada | 🔴 Rojo |
| `medium` | Importante, planificar | 🟠 Naranja |
| `low` | Considerar a futuro | 🔵 Azul |

### 💻 Ejemplo en TypeScript/React

```typescript
import { useEffect, useState } from 'react';

interface Recommendation {
  id: number;
  category: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: {
    potential_savings: number;
    currency: string;
    timeframe: string;
  };
  action_items: string[];
  created_at: string;
}

interface RecommendationsResponse {
  success: boolean;
  recommendations: Recommendation[];
  total_potential_savings: number;
  currency: string;
}

export const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async (period = 'month') => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:2000/insights/recommendations?period=${period}`
      );
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando recomendaciones...</div>;
  if (!recommendations) return null;

  return (
    <div className="recommendations-page">
      {/* Header con ahorro total potencial */}
      <div className="savings-banner">
        <h1>💰 Ahorro Potencial Total</h1>
        <div className="total-savings">
          {recommendations.currency} {recommendations.total_potential_savings.toLocaleString()}
        </div>
        <p>Implementando estas recomendaciones</p>
      </div>

      {/* Lista de recomendaciones */}
      <div className="recommendations-list">
        {recommendations.recommendations.map((rec) => (
          <div key={rec.id} className={`recommendation-card priority-${rec.priority}`}>
            {/* Badge de prioridad */}
            <div className="priority-badge">
              {rec.priority === 'high' && '🔴 Alta'}
              {rec.priority === 'medium' && '🟠 Media'}
              {rec.priority === 'low' && '🔵 Baja'}
            </div>

            {/* Categoría */}
            <div className="category">
              {rec.category === 'cost_reduction' && '💰 Reducción de Costos'}
              {rec.category === 'efficiency' && '⚡ Eficiencia'}
              {rec.category === 'risk_management' && '🛡️ Gestión de Riesgo'}
              {rec.category === 'optimization' && '🎯 Optimización'}
            </div>

            {/* Título y descripción */}
            <h2>{rec.title}</h2>
            <p className="description">{rec.description}</p>

            {/* Impacto */}
            <div className="impact">
              <span className="impact-label">Ahorro potencial:</span>
              <span className="impact-value">
                {rec.impact.currency} {rec.impact.potential_savings.toLocaleString()}
              </span>
              <span className="impact-timeframe">/{rec.impact.timeframe}</span>
            </div>

            {/* Action items */}
            <div className="action-items">
              <h4>📋 Pasos a seguir:</h4>
              <ul>
                {rec.action_items.map((item, idx) => (
                  <li key={idx}>
                    <input type="checkbox" id={`action-${rec.id}-${idx}`} />
                    <label htmlFor={`action-${rec.id}-${idx}`}>{item}</label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Fecha */}
            <div className="created-date">
              Generado el {new Date(rec.created_at).toLocaleDateString('es-PE')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 🎨 Ejemplo de CSS para Recommendations

```css
.savings-banner {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 30px;
}

.total-savings {
  font-size: 3rem;
  font-weight: bold;
  margin: 15px 0;
}

.recommendation-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-left: 4px solid #6b7280;
}

.recommendation-card.priority-high {
  border-left-color: #ef4444;
}

.recommendation-card.priority-medium {
  border-left-color: #f59e0b;
}

.recommendation-card.priority-low {
  border-left-color: #3b82f6;
}

.priority-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.category {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.impact {
  background: #f3f4f6;
  padding: 12px;
  border-radius: 8px;
  margin: 16px 0;
}

.impact-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #10b981;
  margin: 0 8px;
}

.action-items {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.action-items ul {
  list-style: none;
  padding: 0;
}

.action-items li {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.action-items input[type="checkbox"] {
  margin-right: 12px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.created-date {
  color: #9ca3af;
  font-size: 0.85rem;
  margin-top: 16px;
}
```

---

## 🔄 Flujo de Integración Recomendado

### 1. Al cargar el Dashboard

```typescript
// Dashboard Component - useEffect principal
useEffect(() => {
  const loadDashboard = async () => {
    // 1. Cargar resumen rápido
    const summary = await fetchDashboardSummary();
    
    // 2. Si hay datos, cargar recomendaciones
    if (summary.summary.total_invoices > 0) {
      await fetchRecommendations();
    }
  };
  
  loadDashboard();
}, []);
```

### 2. Cuando el usuario cambia el período

```typescript
const handlePeriodChange = async (newPeriod: string) => {
  setPeriod(newPeriod);
  
  // Recargar ambos endpoints con el nuevo período
  await Promise.all([
    fetchDashboardSummary(newPeriod),
    fetchRecommendations(newPeriod)
  ]);
};
```

### 3. Después de analizar nuevas facturas

```typescript
const handleInvoicesAnalyzed = async () => {
  // Cuando el usuario suba y analice nuevas facturas
  const result = await analyzeInvoices(invoices);
  
  if (result.success) {
    // Actualizar dashboard con los nuevos datos
    await fetchDashboardSummary();
    await fetchRecommendations();
    
    // Mostrar notificación
    showNotification('✅ Facturas analizadas. Dashboard actualizado.');
  }
};
```

---

## 🚀 Mejores Prácticas

### ✅ DO

- **Cachear respuestas** durante 5-10 minutos para evitar llamadas innecesarias
- **Mostrar loading states** mientras se cargan los datos
- **Manejar estado vacío** cuando `total_invoices === 0`
- **Usar los colores sugeridos** para categorías y prioridades
- **Implementar filtros de período** (week, month, quarter, year)
- **Actualizar después de análisis** de nuevas facturas

### ❌ DON'T

- No llamar estos endpoints cada vez que el usuario navega entre páginas
- No ignorar el estado `success: false` en las respuestas
- No hardcodear los montos de ahorro
- No mostrar recomendaciones sin contexto (explicar por qué)

---

## 🎯 Casos de Uso Reales

### Caso 1: Dashboard inicial (sin datos)

```typescript
// El usuario entra por primera vez
GET /insights/summary-quick?period=month

// Response:
{
  "summary": { "total_invoices": 0 },
  "latest_insight": {
    "text": "No hay datos de análisis disponibles. Sube facturas para comenzar."
  }
}

// UI debería mostrar:
// - Estado vacío amigable
// - Botón CTA: "Subir mis primeras facturas"
// - Guía rápida de cómo empezar
```

### Caso 2: Dashboard con datos

```typescript
// Usuario con facturas analizadas
GET /insights/summary-quick?period=month

// Response:
{
  "summary": { 
    "total_spent": 12450.50,
    "total_invoices": 48 
  },
  "quick_stats": [...]
}

// UI debería mostrar:
// - Cards de métricas con animaciones
// - Gráficas de tendencia
// - Insight principal destacado
// - Botón: "Ver recomendaciones"
```

### Caso 3: Página de recomendaciones

```typescript
// Usuario hace clic en "Ver recomendaciones"
GET /insights/recommendations?period=month

// Response:
{
  "total_potential_savings": 650.00,
  "recommendations": [...]
}

// UI debería mostrar:
// - Banner con ahorro total potencial
// - Lista ordenada por prioridad (high → medium → low)
// - Action items con checkboxes interactivos
// - Botón: "Exportar plan de acción (PDF)"
```

---

## 📞 Soporte

Si encuentras problemas o necesitas endpoints adicionales:

- **Swagger Docs**: http://localhost:2000/docs
- **Health Check**: http://localhost:2000/health
- **Logs**: Revisar `app.log` en el servidor

---

**Última actualización:** 14 de Noviembre de 2024  
**Versión API:** 2.0.0  
**Endpoints documentados:** `/insights/summary-quick`, `/insights/recommendations`
