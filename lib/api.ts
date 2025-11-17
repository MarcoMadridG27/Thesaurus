// ============================================================================
//  API configuration (Hardening anti-Mixed-Content)
// ============================================================================

// ALWAYS require HTTPS URLs from env. No fallbacks.
// Make sure URLs end with a trailing slash.
function withTrailingSlash(value: string | undefined): string {
  if (!value) return ''
  return value.endsWith('/') ? value : `${value}/`
}

// 🔒 Solo usamos variables NEXT_PUBLIC_ (son las únicas visibles en el bundle)
const API_CONFIG = {
  LOGIN_URL: withTrailingSlash(process.env.NEXT_PUBLIC_LOGIN_URL),
  BASE_URL: withTrailingSlash(process.env.NEXT_PUBLIC_BASE_URL),
  OCR_URL: withTrailingSlash(process.env.NEXT_PUBLIC_OCR_URL),
  INSIGHTS_URL: withTrailingSlash(process.env.NEXT_PUBLIC_INSIGHTS_URL),
}

// 🔒 Si falta una variable, forzamos error explícito.
// Nunca más fallback HTTP.
function ensureUrl(name: string, url: string) {
  if (!url) {
    throw new Error(
      `❌ Missing configuration: ${name}. 
      You MUST define ${name} in Amplify environment variables.`
    )
  }
  // optional: bloquear http por seguridad
  if (url.startsWith("http://")) {
    throw new Error(
      `❌ Insecure URL detected for ${name}: ${url}. 
      HTTPS is required to avoid Mixed Content.`
    )
  }
  return url
}


// ============================================================================
//  INTERFACES
// ============================================================================
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

// ============================================================================
//  API CALLS (solo se modificó la inicialización de URLs)
// ============================================================================

// Get user profile
export async function getUserProfile(token: string): Promise<ApiResponse<UserProfile>> {
  try {
    const base = ensureUrl("NEXT_PUBLIC_LOGIN_URL", API_CONFIG.LOGIN_URL)
    const response = await fetch(`${base}profile`, {
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

    return { success: true, data: await response.json() }
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
    const base = ensureUrl("NEXT_PUBLIC_LOGIN_URL", API_CONFIG.LOGIN_URL)
    const response = await fetch(`${base}login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || `Error: ${response.status}`)
    }

    const raw = await response.json()
    return {
      success: true,
      data: {
        token: raw.access_token,
        tokenType: raw.token_type,
        expiresIn: raw.expires_in,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al iniciar sesión',
    }
  }
}

// ============================================================================
// (EL RESTO DE TUS FUNCIONES SON IGUALES — SOLO SE CAMBIÓ LA PARTE SUPERIOR)
// ============================================================================



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

    // ✅ Registro OK -> intentamos login automático SIEMPRE
    const loginResult = await loginUser({
      email: userData.email,
      password: userData.password,
    })

    // Si el login falla, al menos devolvemos que el registro estuvo bien
    if (!loginResult.success) {
      return {
        success: true,
        message: 'Registro exitoso, pero hubo un problema al iniciar sesión automáticamente.',
        data,
      }
    }

    // Devolvemos directamente el resultado del login (con token, etc.)
    return loginResult
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al registrarse',
    }
  }
}


// OCR API call for invoice processing (flujo de 2 pasos)
export async function processInvoice(file: File, tenantId: string = 'default-tenant', docKind: 'boleta' | 'factura' = 'factura'): Promise<ApiResponse> {
  try {
    const OCR_BASE = ensureUrl('NEXT_PUBLIC_OCR_URL', API_CONFIG.OCR_URL)
    // Paso 1: Subir documento
    const formData = new FormData()
    formData.append('file', file)
    formData.append('tenant_id', tenantId)
    formData.append('doc_kind', docKind)

    const uploadResponse = await fetch(`${OCR_BASE}documents/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}))
      throw new Error(errorData.message || `Error al subir: ${uploadResponse.status}`)
    }

    const uploadData = await uploadResponse.json()
    const docId = uploadData.id

    // Paso 2: Procesar OCR
    const ocrResponse = await fetch(`${OCR_BASE}ocr/process/${docId}`, {
      method: 'POST',
    })

    if (!ocrResponse.ok) {
      const errorData = await ocrResponse.json().catch(() => ({}))
      throw new Error(errorData.message || `Error al procesar: ${ocrResponse.status}`)
    }

    const ocrData = await ocrResponse.json()
    return {
      success: true,
      data: ocrData,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al procesar la factura',
    }
  }
}

// OCR API call for multiple invoices (procesa cada uno con flujo de 2 pasos)
export async function processInvoices(files: File[], tenantId: string = 'default-tenant', docKind: 'boleta' | 'factura' = 'factura'): Promise<ApiResponse> {
  try {
    const OCR_BASE = ensureUrl('NEXT_PUBLIC_OCR_URL', API_CONFIG.OCR_URL)
    const results = []
    const errors = []

    // Procesar cada archivo individualmente con flujo de 2 pasos
    for (const file of files) {
      try {
        // Paso 1: Subir documento
        const formData = new FormData()
        formData.append('file', file)
        formData.append('tenant_id', tenantId)
        formData.append('doc_kind', docKind)

        const uploadResponse = await fetch(`${OCR_BASE}documents/upload`, {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({}))
          errors.push({ file: file.name, error: errorData.message || `Error al subir: ${uploadResponse.status}` })
          continue
        }

        const uploadData = await uploadResponse.json()
        const docId = uploadData.id

        // Paso 2: Procesar OCR
        const ocrResponse = await fetch(`${OCR_BASE}ocr/process/${docId}`, {
          method: 'POST',
        })

        if (!ocrResponse.ok) {
          const errorData = await ocrResponse.json().catch(() => ({}))
          errors.push({ file: file.name, error: errorData.message || `Error al procesar: ${ocrResponse.status}` })
          continue
        }

        const ocrData = await ocrResponse.json()
        results.push({ file: file.name, data: ocrData })
      } catch (err) {
        errors.push({ file: file.name, error: err instanceof Error ? err.message : 'Error desconocido' })
      }
    }

    return {
      success: errors.length === 0,
      data: {
        processed: results,
        errors: errors,
        total: files.length,
        success_count: results.length,
        error_count: errors.length,
      },
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
    const INSIGHTS_BASE = ensureUrl('NEXT_PUBLIC_INSIGHTS_URL', API_CONFIG.INSIGHTS_URL)
    const url = `${INSIGHTS_BASE}insights/chart-data/${type}?period=${period}`
    console.log(`📡 [API] Requesting chart data -> ${url}`)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Log status and body for debugging (clone response so we can still parse it)
    try {
      const rawText = await response.clone().text()
      console.log(`📡 [API] Chart data response status=${response.status} body=${rawText}`)
    } catch (e) {
      console.warn('⚠️ [API] Could not read response body for chart data', e)
    }


    // No inventar datos en caso de 422 o cualquier error: propagar el error al caller
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const message = errorData.detail || errorData.error || errorData.message || `Error: ${response.status}`
      console.warn(`⚠️ [API] getChartData failed: ${message}`)
      return {
        success: false,
        error: message,
      }
    }

    const data = await response.json()

    // Heurística para detectar datos de muestra / mock que el backend pueda devolver
    function isPlaceholderChartData(type: string, payload: any): boolean {
      try {
        const labels: string[] = payload?.data?.labels || []
        if (!labels || labels.length === 0) return true

        if (type === 'expense') {
          // Etiquetas como 'Semana 1', 'Semana 2' suelen ser placeholders
          if (labels.some(l => /^Semana\s*\d+/i.test(l))) return true
        }

        if (type === 'supplier') {
          // Nombres genéricos como EMPRESA ABC SAC o PROVEEDOR 123 SAC son probables mocks
          if (labels.some(l => /EMPRESA\s+|PROVEEDOR\s+/i.test(l))) return true
        }

        if (type === 'category') {
          // Etiqueta única 'Otros' o 'Others' puede indicar placeholder
          if (labels.length === 1 && /otros|others|uncategorized/i.test(labels[0])) return true
        }

        return false
      } catch (e) {
        return false
      }
    }

    if (isPlaceholderChartData(type, data)) {
      console.warn(`⚠️ [API] getChartData detected placeholder data for type=${type} — treating as no-data`)
      return {
        success: false,
        error: 'El backend devolvió datos de ejemplo (placeholder).',
      }
    }

    console.log('✅ [API] getChartData success:', { type, period, data })
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
    const INSIGHTS_BASE = ensureUrl('NEXT_PUBLIC_INSIGHTS_URL', API_CONFIG.INSIGHTS_URL)
    const response = await fetch(`${INSIGHTS_BASE}insights/summary-quick?period=${period}`, {
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
    
    const INSIGHTS_BASE = ensureUrl('NEXT_PUBLIC_INSIGHTS_URL', API_CONFIG.INSIGHTS_URL)
    const response = await fetch(`${INSIGHTS_BASE}insights/analyze-invoices`, {
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
    const INSIGHTS_BASE = ensureUrl('NEXT_PUBLIC_INSIGHTS_URL', API_CONFIG.INSIGHTS_URL)
    const response = await fetch(`${INSIGHTS_BASE}insights/recommendations?period=${period}`, {
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
    const INSIGHTS_BASE = ensureUrl('NEXT_PUBLIC_INSIGHTS_URL', API_CONFIG.INSIGHTS_URL)
    const response = await fetch(`${INSIGHTS_BASE}chat/sessions`, {
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
    
    // Log raw response for debugging websocket host issues
    console.log('📡 [API] createChatSession response from backend:', data)
    console.log('📡 [API] Resolved INSIGHTS_URL=', INSIGHTS_BASE)

    // El backend puede devolver una websocket_url absoluta o sólo session_id.
    // Preferimos construir la URL final usando `API_CONFIG.INSIGHTS_URL` cuando:
    // - el backend devuelve sólo `session_id`, o
    // - el backend devuelve una `websocket_url` que apunta a `localhost` pero
    //   `API_CONFIG.INSIGHTS_URL` apunta a otra host (evitar usar URLs de ejemplo dev).

    const wsProtocol = INSIGHTS_BASE.startsWith('https') ? 'wss://' : 'ws://'

    // Helper: build ws url from insights base + session id
    const buildWsFromSession = (sessionId: string) => {
      const base = INSIGHTS_BASE.replace(/^https?:\/\//, '')
      return `${wsProtocol}${base}chat/ws/${sessionId}`
    }

    // If backend returned session_id, build trusted websocket_url
    if (data.session_id) {
      data.websocket_url = buildWsFromSession(data.session_id)
      console.log('📡 [API] Built websocket_url from session_id ->', data.websocket_url)
    } else if (data.websocket_url) {
      // If backend returned a websocket_url, normalize it to ws/wss
      let wsBase = data.websocket_url
        .replace('https://', '')
        .replace('http://', '')
        .replace('wss://', '')
        .replace('ws://', '')

      const normalized = `${wsProtocol}${wsBase}`

      // If normalized points to localhost but our INSIGHTS_URL is not localhost,
      // prefer constructing from the trusted API_CONFIG.INSIGHTS_URL and, if possible,
      // extract session id from the returned websocket_url to preserve the session.
      if (/localhost:\d+/.test(normalized) && !/localhost/.test(INSIGHTS_BASE)) {
        // try to extract session id from the path
        const match = wsBase.match(/\/chat\/ws\/(.+)$/)
        const sid = match ? match[1] : null
        if (sid) {
          data.websocket_url = buildWsFromSession(sid)
          console.log('📡 [API] Overriding localhost websocket_url with insights host ->', data.websocket_url)
        } else {
          // fallback to normalized (but log warning)
          data.websocket_url = normalized
          console.warn('⚠️ [API] Backend returned localhost websocket_url and no session id could be extracted; using normalized localhost URL')
        }
      } else {
        data.websocket_url = normalized
      }
      console.log('📡 [API] Normalized websocket_url ->', data.websocket_url)
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
    const INSIGHTS_BASE = ensureUrl('NEXT_PUBLIC_INSIGHTS_URL', API_CONFIG.INSIGHTS_URL)
    const response = await fetch(`${INSIGHTS_BASE}chat/sessions/${sessionId}/history`, {
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
    const INSIGHTS_BASE = ensureUrl('NEXT_PUBLIC_INSIGHTS_URL', API_CONFIG.INSIGHTS_URL)
    const response = await fetch(`${INSIGHTS_BASE}chat/sessions/${sessionId}/context`, {
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
    const INSIGHTS_BASE = ensureUrl('NEXT_PUBLIC_INSIGHTS_URL', API_CONFIG.INSIGHTS_URL)
    const response = await fetch(`${INSIGHTS_BASE}chat/sessions/${sessionId}`, {
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
    const INSIGHTS_BASE = ensureUrl('NEXT_PUBLIC_INSIGHTS_URL', API_CONFIG.INSIGHTS_URL)
    const response = await fetch(`${INSIGHTS_BASE}chat/sessions`, {
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
