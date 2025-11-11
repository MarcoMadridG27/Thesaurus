import type { Metadata } from "next"
import ClientHomePage from "./client-page"

export const metadata: Metadata = {
  title: "AI CFO - Software Contable Inteligente para PYMES",
  description:
    "Organiza tu negocio, analiza facturas con IA y obtén recomendaciones inteligentes. Diseñado para empresas pequeñas que quieren crecer.",
  openGraph: {
    title: "AI CFO - Tu Contador Inteligente",
    description: "IA potente para gestionar finanzas de tu PYME",
    type: "website",
  },
}

export default function HomePage() {
  return <ClientHomePage />
}
