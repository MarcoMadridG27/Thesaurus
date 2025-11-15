// API configuration and utilities

const API_CONFIG = {
  LOGIN_URL: process.env.NEXT_PUBLIC_LOGIN_URL || process.env.NEXT_LOGIN_URL || 'http://44.212.163.253:3000/auth/',
  BASE_URL: 'http://44.212.163.253:3000/',
  OCR_URL: process.env.NEXT_PUBLIC_OCR_URL || process.env.NEXT_OCR_URL || 'http://localhost:9000/',
  INSIGHTS_URL: process.env.NEXT_PUBLIC_INSIGHTS_URL || 'http://localhost:2000/',
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignUpData {
  ruc: string
  email: string
  password: string
}

export interface RucValidationData {
  ruc: string
}

export interface RucData {
  ruc: string
  razon_social: string
  nombre_comercial?: string
  estado: string
  condicion: string
  direccion?: string
  departamento?: string
  provincia?: string
  distrito?: string
}

export interface UserProfile {
  ruc: string
  razon_social: string
  nombre_comercial?: string
  email: string
  estado: string
  condicion: string
  direccion?: string
  departamento?: string
  provincia?: string
  distrito?: string
  is_active: boolean
  created_at: string
  last_login?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Get user profile
export async function getUserProfile(token: string): Promise<ApiResponse<UserProfile>> {
  try {
    const response = await fetch(`${API_CONFIG.LOGIN_URL}profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || `Error: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener perfil',
    }
  }
}

// Login API call
export async function loginUser(credentials: LoginCredentials): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_CONFIG.LOGIN_URL}login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || `Error: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al iniciar sesión',
    }
  }
}

// Validate RUC (Peruvian tax ID)
export async function validateRuc(ruc: string): Promise<ApiResponse<RucData>> {
  try {
    const response = await fetch(`${API_CONFIG.LOGIN_URL}validate-ruc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ruc }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || `Error: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al validar RUC',
    }
  }
}

// Sign up API call
export async function signUpUser(userData: SignUpData): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_CONFIG.LOGIN_URL}register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || `Error: ${response.status}`)
    }

    const data = await response.json()
    
    // Si el registro es exitoso, hacer login automáticamente
    if (data.success) {
      const loginResult = await loginUser({
        email: userData.email,
        password: userData.password,
      })
      return loginResult
    }
    
    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al registrarse',
    }
  }
}

// OCR API call for invoice processing
export async function processInvoice(file: File): Promise<ApiResponse> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_CONFIG.OCR_URL}process`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Error: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al procesar la factura',
    }
  }
}

// OCR API call for multiple invoices
export async function processInvoices(files: File[]): Promise<ApiResponse> {
  try {
    const formData = new FormData()
    for (const file of files) {
      formData.append('files', file)
    }

    const response = await fetch(`${API_CONFIG.OCR_URL}process-batch`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Error: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al procesar las facturas',
    }
  }
}

// Get chart data for dashboard
export async function getChartData(
  type: 'expense' | 'category' | 'supplier',
  period: 'week' | 'month' | 'quarter' | 'year' = 'month'
): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_CONFIG.INSIGHTS_URL}insights/chart-data/${type}?period=${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Si no hay datos (422), devolver estructura vacía según el tipo
    if (response.status === 422) {
      const emptyData = {
        success: true,
        chart_type: type,
        period,
        data: {
          labels: [],
          datasets: [],
        },
      }
      return {
        success: true,
        data: emptyData,
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.error || errorData.message || `Error: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener datos del gráfico',
    }
  }
}

// Get AI insights summary
export async function getInsightsSummary(period: string = 'month'): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_CONFIG.INSIGHTS_URL}insights/summary-quick?period=${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Si no hay datos (422), devolver estructura vacía según GUIA.md
    if (response.status === 422) {
      console.warn('⚠️ Backend devolvió 422. Según GUIA.md, debería devolver datos por defecto.')
      return {
        success: true,
        data: {
          success: true,
          period,
          summary: {
            total_spent: 0,
            total_invoices: 0,
            total_suppliers: 0,
            growth_percentage: 0,
          },
          latest_insight: {
            id: 0,
            text: 'No hay datos de análisis disponibles. Sube facturas para comenzar.',
            sentiment: 'neutral',
            priority: 'low',
            created_at: new Date().toISOString(),
          },
          quick_stats: [
            { label: `Gasto total (${period})`, value: '0.00', currency: 'PEN', change: '0%', trend: 'neutral' },
            { label: 'Facturas procesadas', value: '0', change: '0', trend: 'neutral' },
            { label: 'Proveedores activos', value: '0', change: '0', trend: 'neutral' },
            { label: 'Ahorro potencial', value: '0.00', currency: 'PEN', change: 'N/A', trend: 'neutral' },
          ],
        },
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.error || errorData.message || `Error: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener insights',
    }
  }
}

// Analyze invoices and generate AI insights
export async function analyzeInvoices(invoices: any[], period: string = 'monthly'): Promise<ApiResponse> {
  try {
    const payload = {
      invoices,
      period,
    }
    
    console.log('🚀 [API] Enviando análisis de facturas:')
    console.log('  - URL:', `${API_CONFIG.INSIGHTS_URL}insights/analyze-invoices`)
    console.log('  - Period:', period)
    console.log('  - Cantidad de facturas:', invoices.length)
    console.log('  - Payload completo:', JSON.stringify(payload, null, 2))
    
    const response = await fetch(`${API_CONFIG.INSIGHTS_URL}insights/analyze-invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    console.log('📥 [API] Response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ [API] Error del backend:', errorData)
      throw new Error(errorData.detail || errorData.error || errorData.message || `Error: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ [API] Análisis completado exitosamente')
    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('❌ [API] Error en analyzeInvoices:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al analizar facturas',
    }
  }
}

// Get recommendations
export async function getRecommendations(period: string = 'month'): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_CONFIG.INSIGHTS_URL}insights/recommendations?period=${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Si no hay datos (422), devolver array vacío según GUIA.md
    if (response.status === 422) {
      console.warn('⚠️ Backend devolvió 422. Según GUIA.md, debería devolver datos por defecto.')
      return {
        success: true,
        data: {
          success: true,
          recommendations: [],
          total_potential_savings: 0,
          currency: 'PEN',
        },
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.error || errorData.message || `Error: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener recomendaciones',
    }
  }
}

// Chat API functions
export interface ChatSession {
  session_id: string
  status: string
  websocket_url: string
}

export interface ChatContext {
  total_spent?: number
  total_invoices?: number
  total_suppliers?: number
  [key: string]: any
}

// Create a new chat session
export async function createChatSession(context?: ChatContext): Promise<ApiResponse<ChatSession>> {
  try {
    const response = await fetch(`${API_CONFIG.INSIGHTS_URL}chat/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: context ? JSON.stringify({ context }) : undefined,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.error || `Error: ${response.status}`)
    }

    const data = await response.json()
    
    // El backend ya devuelve la URL correcta del WebSocket
    // Solo necesitamos asegurarnos de que use el protocolo correcto
    if (data.websocket_url) {
      // Si el backend devuelve http/https, convertir a ws/wss
      const wsProtocol = API_CONFIG.INSIGHTS_URL.startsWith('https') ? 'wss://' : 'ws://'
      const wsBase = data.websocket_url
        .replace('https://', '')
        .replace('http://', '')
        .replace('wss://', '')
        .replace('ws://', '')
      
      data.websocket_url = `${wsProtocol}${wsBase}`
    }
    
    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear sesión de chat',
    }
  }
}

// Get chat history
export async function getChatHistory(sessionId: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_CONFIG.INSIGHTS_URL}chat/sessions/${sessionId}/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.error || `Error: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener historial',
    }
  }
}

// Update chat context
export async function updateChatContext(sessionId: string, context: ChatContext): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_CONFIG.INSIGHTS_URL}chat/sessions/${sessionId}/context`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(context),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.error || `Error: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar contexto',
    }
  }
}

// Delete chat session
export async function deleteChatSession(sessionId: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_CONFIG.INSIGHTS_URL}chat/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.error || `Error: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar sesión',
    }
  }
}

// List active sessions
export async function listChatSessions(): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_CONFIG.INSIGHTS_URL}chat/sessions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.error || `Error: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al listar sesiones',
    }
  }
}

export default API_CONFIG
