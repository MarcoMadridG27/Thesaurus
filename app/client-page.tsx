"use client"

import { ArrowRight, TrendingUp, BarChart3, MessageSquare, Zap, Lock, Sparkles } from "lucide-react"
import Link from "next/link"

export default function ClientHomePage() {
  return (
    <div className="min-h-screen bg-gradient-hero overflow-hidden">
      {/* Animated background elements with grid pattern */}
      <div className="fixed inset-0 -z-10 grid-pattern">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gradient-accent opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-gradient-warm opacity-8 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 right-1/4 w-72 h-72 bg-blue-400 opacity-8 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass-morphism backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-premium flex items-center justify-center shadow-lg shadow-teal-500/50">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-accent bg-clip-text text-transparent">AI CFO</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/signin">
              <button className="button-ghost-vibrant text-sm">Ingresar</button>
            </Link>
            <Link href="/auth/signup">
              <button className="button-premium text-sm">Registrarse</button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 relative">
        <div className="text-center space-y-8 fade-in-up">
          <div className="inline-block">
            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 border border-teal-300 dark:border-teal-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">Potenciado por IA</span>
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-foreground tracking-tight leading-tight">
            Tu contador
            <span className="block bg-gradient-accent bg-clip-text text-transparent">inteligente</span>
          </h1>

          <p className="text-xl md:text-2xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
            Organiza tu negocio, analiza facturas en segundos y obtén recomendaciones inteligentes. Diseñado para PYMES
            que quieren crecer.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/auth/signup">
              <button className="button-premium rounded-xl px-8 py-3.5 text-lg h-auto flex items-center gap-2 glow-premium">
                Comenzar gratis <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="#features">
              <button className="button-ghost-vibrant rounded-xl px-8 py-3.5 text-lg h-auto">
                Ver características
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 md:py-32 bg-white/40 dark:bg-slate-900/20 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">Características poderosas</h2>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Todo lo que necesitas para dominar las finanzas de tu negocio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BarChart3,
                title: "Extracción Automática",
                description: "La IA extrae datos de facturas en segundos",
                color: "from-teal-500 to-cyan-500",
              },
              {
                icon: TrendingUp,
                title: "Dashboard Visual",
                description: "Visualiza gastos y ganancias en tiempo real",
                color: "from-cyan-500 to-blue-500",
              },
              {
                icon: MessageSquare,
                title: "Consultas IA",
                description: "Pregunta en lenguaje natural, obtén respuestas",
                color: "from-amber-400 to-orange-500",
              },
              {
                icon: Zap,
                title: "Insights Automáticos",
                description: "Alertas y recomendaciones inteligentes",
                color: "from-orange-500 to-red-500",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="card-premium group"
                style={{ animation: `slideUp 0.6s ease-out ${idx * 100}ms forwards`, opacity: 0 }}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-foreground/60">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 fade-in-up">
              <h2 className="text-5xl font-bold">¿Por qué elegir AI CFO?</h2>
              <div className="space-y-6">
                {[
                  { icon: Lock, title: "Seguro", desc: "Datos encriptados y protegidos" },
                  { icon: TrendingUp, title: "Crece más rápido", desc: "Toma decisiones informadas" },
                  { icon: Sparkles, title: "Fácil de usar", desc: "Interfaz intuitiva y amigable" },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center flex-shrink-0 glow-primary">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{item.title}</h3>
                      <p className="text-foreground/60">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-3xl blur-2xl"></div>
              <div className="card-premium relative bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/50 dark:to-cyan-950/50">
                <div className="aspect-video bg-gradient-accent/20 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-20 h-20 text-primary/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card-premium bg-gradient-premium text-white border-0 text-center py-16 md:py-20 glow-premium">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Comienza tu prueba gratuita</h2>
            <p className="text-lg opacity-90 mb-8">14 días de acceso completo. Sin tarjeta de crédito.</p>
            <Link href="/auth/signup">
              <button className="bg-white text-teal-600 hover:bg-gray-100 rounded-xl px-8 py-3 text-lg h-auto font-bold transform hover:scale-105 transition-transform">
                Crear cuenta ahora
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">AI CFO</span>
              </div>
              <p className="text-foreground/60">Finanzas inteligentes para tu negocio</p>
            </div>
            {[
              { title: "Producto", links: ["Características", "Precios"] },
              { title: "Empresa", links: ["Acerca de", "Blog"] },
              { title: "Legal", links: ["Privacidad", "Términos"] },
            ].map((section, idx) => (
              <div key={idx}>
                <h4 className="font-bold mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <Link href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-8 text-center text-foreground/50">
            <p>&copy; 2025 AI CFO. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
