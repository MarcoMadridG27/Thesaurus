import { type NextRequest, NextResponse } from "next/server"

// Rutas que no requieren autenticación
const publicRoutes = ["/", "/auth/signin", "/auth/signup"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Si es una ruta pública, permitir acceso
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Verificar si tiene token de sesión (simulated)
  const token = request.cookies.get("auth-token")?.value

  // Si está intentando acceder a rutas protegidas sin token
  if (pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }

  // Si está en auth y tiene token, redirigir a dashboard
  if (pathname.startsWith("/auth") && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
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
