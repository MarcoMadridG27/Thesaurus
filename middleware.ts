import { type NextRequest, NextResponse } from "next/server"

// Rutas que no requieren autenticación
const publicRoutes = new Set(["/", "/auth/signin", "/auth/signup"])

// Configuración de CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Manejar solicitudes OPTIONS (CORS preflight)
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { headers: corsHeaders })
  }

  // Si es una ruta pública, permitir acceso
  if (publicRoutes.has(pathname)) {
    const response = NextResponse.next()
    for (const [key, value] of Object.entries(corsHeaders)) {
      response.headers.set(key, value)
    }
    return response
  }

  // Verificar si tiene token de sesión (simulated)
  const token = request.cookies.get("auth-token")?.value

  // Si está intentando acceder a rutas protegidas sin token
  if (pathname.startsWith("/dashboard") && !token) {
    const response = NextResponse.redirect(new URL("/auth/signin", request.url))
    for (const [key, value] of Object.entries(corsHeaders)) {
      response.headers.set(key, value)
    }
    return response
  }

  // Si está en auth y tiene token, redirigir a dashboard
  if (pathname.startsWith("/auth") && token) {
    const response = NextResponse.redirect(new URL("/dashboard", request.url))
    for (const [key, value] of Object.entries(corsHeaders)) {
      response.headers.set(key, value)
    }
    return response
  }

  const response = NextResponse.next()
  for (const [key, value] of Object.entries(corsHeaders)) {
    response.headers.set(key, value)
  }
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
