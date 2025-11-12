// API configuration and utilities

const API_CONFIG = {
  LOGIN_URL: process.env.NEXT_PUBLIC_LOGIN_URL || process.env.NEXT_LOGIN_URL || 'http://44.212.163.253:3000/',
  OCR_URL: process.env.NEXT_PUBLIC_OCR_URL || process.env.NEXT_OCR_URL || 'http://44.212.163.253:8080/',
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

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
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

export default API_CONFIG
