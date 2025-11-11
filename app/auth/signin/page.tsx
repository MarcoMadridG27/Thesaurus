import type { Metadata } from "next"
import SignInClient from "./client"

export const metadata: Metadata = {
  title: "Ingresar",
  description: "Accede a tu cuenta de AI CFO",
}

export default function SignInPage() {
  return <SignInClient />
}
