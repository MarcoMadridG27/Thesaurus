"use client"

import { SignUpForm } from "@/components/auth/signup-form"
import { TrendingUp } from "lucide-react"
import Link from "next/link"

export default function SignUpClient() {
  return (
    <div className="min-h-screen bg-gradient-hero overflow-hidden flex flex-col">
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)",
          backgroundSize: "2rem 2rem",
        }}
      >
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-accent opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-warm opacity-8 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <header className="sticky top-0 z-50 glass-morphism backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-gradient-premium flex items-center justify-center shadow-lg shadow-teal-500/50">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-accent bg-clip-text text-transparent">AI CFO</span>
            </div>
          </Link>
          <Link href="/auth/signin" className="text-primary hover:text-primary/80 font-semibold transition-colors">
            ¿Ya tienes cuenta?
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="card-premium">
            <SignUpForm />
          </div>
        </div>
      </div>
    </div>
  )
}
