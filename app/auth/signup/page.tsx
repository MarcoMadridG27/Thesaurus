import type { Metadata } from "next"
import SignUpClient from "./client"

export const metadata: Metadata = {
  title: "Registrarse",
  description: "Crea tu cuenta de AI CFO gratis",
}

export default function SignUpPage() {
  return <SignUpClient />
}
