# 📊 Especificación de Endpoints Insights para Frontend

## 🎯 Objetivo
Definir la estructura de datos que el microservicio de Insights debe devolver para que el frontend pueda mostrar gráficas con sentido y análisis útiles.

---

## 📍 Endpoints Requeridos

### 1. POST `/insights/analyze-invoices`

**Descripción:** Analiza todas las facturas y devuelve insights estructurados con datos para gráficas.

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
    },
    {
      "id": "INV-002",
      "numero": "F001-00002",
      "proveedor": "EMPRESA XYZ SAC",
      "ruc": "20987654321",
      "fecha": "2024-11-05",
      "moneda": "PEN",
      "subtotal": 200.00,
      "igv": 36.00,
      "total": 236.00,
      "items": []
    }
  ],
  "period": "monthly" // "weekly", "monthly", "quarterly", "yearly"
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "analysis_date": "2024-11-14T10:30:00Z",
  "period": "monthly",
  
  // Resumen general
  "summary": {
    "total_invoices": 48,
    "total_spent": 12450.50,
    "average_invoice": 259.39,
    "total_suppliers": 12,
    "growth_percentage": 15.5,  // Crecimiento respecto al período anterior
    "trend": "increasing"  // "increasing", "decreasing", "stable"
  },

  // Insight en texto natural (para el card de IA)
  "ai_insight": {
    "id": 1,
    "text": "Tus gastos aumentaron un 15.5% este mes comparado con el mes anterior. El principal incremento proviene de EMPRESA ABC SAC (+25%). Se recomienda revisar los precios con este proveedor para optimizar costos.",
    "sentiment": "warning",  // "positive", "neutral", "warning", "negative"
    "priority": "high",  // "low", "medium", "high"
    "created_at": "2024-11-14T10:30:00Z"
  },

  // Datos para gráfica de tendencia temporal (Expense Chart)
  "expense_trend": {
    "labels": ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],  // O meses si es quarterly/yearly
    "datasets": [
      {
        "label": "Gastos",
        "data": [2800, 3200, 3450, 3000],  // Totales por período
        "color": "#8b5cf6"
      },
      {
        "label": "Período Anterior",
        "data": [2600, 2900, 3100, 2800],  // Para comparación
        "color": "#d1d5db",
        "dashed": true
      }
    ]
  },

  // Datos para gráfica de proveedores (Supplier Chart)
  "top_suppliers": [
    {
      "ruc": "20123456789",
      "name": "EMPRESA ABC SAC",
      "total_spent": 4500.00,
      "invoice_count": 15,
      "percentage": 36.2,  // % del total gastado
      "trend": "up",  // "up", "down", "stable"
      "change_percentage": 25.0  // Cambio vs período anterior
    },
    {
      "ruc": "20987654321",
      "name": "EMPRESA XYZ SAC",
      "total_spent": 3200.00,
      "invoice_count": 12,
      "percentage": 25.7,
      "trend": "stable",
      "change_percentage": 2.0
    },
    {
      "ruc": "20456789123",
      "name": "PROVEEDOR 123 SAC",
      "total_spent": 2100.00,
      "invoice_count": 8,
      "percentage": 16.9,
      "trend": "down",
      "change_percentage": -10.0
    }
  ],

  // Datos para gráfica de categorías (Category Chart)
  "categories": [
    {
      "name": "Servicios",
      "total": 5500.00,
      "percentage": 44.2,
      "count": 20,
      "color": "#8b5cf6"
    },
    {
      "name": "Productos",
      "total": 4200.00,
      "percentage": 33.7,
      "count": 18,
      "color": "#3b82f6"
    },
    {
      "name": "Insumos",
      "total": 2750.50,
      "percentage": 22.1,
      "count": 10,
      "color": "#10b981"
    }
  ],

  // Métricas adicionales para cards
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
    "projected_monthly_total": 13500.00  // Proyección si sigue la tendencia
  },

  // Recomendaciones accionables
  "recommendations": [
    {
      "id": 1,
      "type": "cost_optimization",
      "priority": "high",
      "title": "Revisar precios con EMPRESA ABC SAC",
      "description": "Este proveedor incrementó sus precios un 25%. Considera negociar o buscar alternativas.",
      "potential_savings": 450.00
    },
    {
      "id": 2,
      "type": "consolidation",
      "priority": "medium",
      "title": "Consolidar compras en 2 proveedores principales",
      "description": "Comprando más volumen en tus proveedores principales podrías obtener mejores precios.",
      "potential_savings": 300.00
    }
  ],

  // Alertas importantes
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

---

### 2. GET `/insights/summary`

**Descripción:** Obtiene el resumen ejecutivo más reciente (para dashboard principal).

**Query Parameters:**
- `period` (opcional): "week", "month", "quarter", "year". Default: "month"

**Response 200 OK:**
```json
{
  "success": true,
  "period": "month",
  "summary": {
    "total_spent": 12450.50,
    "invoice_count": 48,
    "supplier_count": 12,
    "growth_percentage": 15.5
  },
  "latest_insight": {
    "id": 1,
    "text": "Tus gastos aumentaron un 15.5% este mes...",
    "sentiment": "warning",
    "created_at": "2024-11-14T10:30:00Z"
  },
  "quick_stats": [
    {
      "label": "Gasto total (mes)",
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

---

### 3. GET `/insights/chart-data/{chart_type}`

**Descripción:** Obtiene datos específicos para una gráfica.

**Path Parameters:**
- `chart_type`: "expense", "supplier", "category"

**Query Parameters:**
- `period`: "week", "month", "quarter", "year"

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
        "data": [2800, 3200, 3450, 3000],
        "backgroundColor": "#8b5cf6",
        "borderColor": "#8b5cf6"
      },
      {
        "label": "Mes anterior",
        "data": [2600, 2900, 3100, 2800],
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
        "data": [4500, 3200, 2100, 2650.50],
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
        "data": [5500, 4200, 2750.50],
        "backgroundColor": ["#8b5cf6", "#3b82f6", "#10b981"]
      }
    ]
  }
}
```

---

### 4. POST `/insights/generate-text`

**Descripción:** Genera un insight en texto natural usando IA (solo texto, sin análisis numérico).

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

**Descripción:** Obtiene recomendaciones accionables basadas en el análisis.

**Response 200 OK:**
```json
{
  "success": true,
  "recommendations": [
    {
      "id": 1,
      "category": "cost_reduction",
      "priority": "high",
      "title": "Negociar precios con EMPRESA ABC SAC",
      "description": "Este proveedor ha incrementado sus precios un 25% en los últimos 3 meses. Una renegociación podría resultar en ahorros significativos.",
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
      "description": "Tienes 48 facturas este mes. Consolidando compras podrías reducir costos administrativos.",
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

## 🎨 Componentes del Frontend que usan estos datos

### 1. Dashboard Principal (`app/dashboard/page.tsx`)
**Usa:** `GET /insights/summary`
- StatCards (4 cards con métricas principales)
- AI Summary Card (último insight)

### 2. Gráfica de Gastos (`components/dashboard/expense-chart.tsx`)
**Usa:** `GET /insights/chart-data/expense`
- Line chart con tendencia temporal
- Comparación con período anterior

### 3. Gráfica de Proveedores (`components/dashboard/supplier-chart.tsx`)
**Usa:** `GET /insights/chart-data/supplier`
- Bar chart horizontal con top proveedores
- Porcentajes y tendencias

### 4. Gráfica de Categorías (`components/dashboard/category-chart.tsx`)
**Usa:** `GET /insights/chart-data/category`
- Pie/Donut chart con distribución por categoría

### 5. Página de Analytics (`app/dashboard/analytics/page.tsx`)
**Usa:** 
- `POST /insights/analyze-invoices` (análisis completo)
- `GET /insights/recommendations` (recomendaciones)
- Muestra insights históricos, gráficas y recomendaciones

---

## 📊 Ejemplo de Flujo Completo

### Cuando el usuario sube facturas:

1. **Frontend** procesa facturas con OCR
2. **Frontend** guarda facturas en el store local
3. **Frontend** envía todas las facturas a `POST /insights/analyze-invoices`
4. **Backend** analiza datos y devuelve análisis completo
5. **Frontend** actualiza:
   - StatCards con `summary`
   - AI Summary Card con `ai_insight`
   - Gráficas con datos de `expense_trend`, `top_suppliers`, `categories`
   - Guarda recomendaciones para mostrar en Analytics

### Cuando el usuario ve Analytics:

1. **Frontend** carga insights previos del store
2. Opcionalmente hace un nuevo análisis llamando `POST /insights/analyze-invoices`
3. Muestra gráficas y recomendaciones
4. Usuario puede generar nuevos insights con `POST /insights/generate-text`

---

## 🔧 Consideraciones Técnicas

### Categorización de Facturas
El backend debe intentar categorizar facturas basándose en:
- Descripción de items
- Nombre del proveedor
- RUC del proveedor (algunos RUCs indican el sector)

**Categorías sugeridas:**
- Servicios profesionales
- Productos/Mercancía
- Insumos/Suministros
- Marketing/Publicidad
- Tecnología/Software
- Oficina/Administrativo
- Otros

### Cálculo de Tendencias
- **Growth percentage**: Comparar total del período actual vs período anterior
- **Trend**: "increasing" si growth > 5%, "decreasing" si < -5%, "stable" si entre -5% y 5%

### Proyecciones
- Si el período es "month" y solo han pasado 15 días, proyectar el total multiplicando por 2
- Usar regresión lineal simple para proyecciones más precisas

---

## 🚨 Manejo de Errores

**Error 400 - Bad Request:**
```json
{
  "success": false,
  "error": "Invalid invoice data",
  "details": "At least one invoice is required for analysis"
}
```

**Error 500 - Server Error:**
```json
{
  "success": false,
  "error": "AI service unavailable",
  "details": "OpenAI API returned error: rate limit exceeded"
}
```

---

## 📝 Notas Finales

1. **Todos los montos deben incluir 2 decimales**
2. **Las fechas deben estar en formato ISO 8601**
3. **Los colores deben ser consistentes** (usar los de Tailwind)
4. **Los porcentajes deben incluir el símbolo %**
5. **Los textos de insights deben ser claros y accionables**
6. **Siempre incluir el campo `success` en las respuestas**

---

Esta especificación garantiza que:
✅ Las gráficas muestran datos reales y con sentido
✅ Los insights son accionables y útiles
✅ El frontend tiene toda la información necesaria para visualizar correctamente
✅ La estructura es consistente y fácil de usar
