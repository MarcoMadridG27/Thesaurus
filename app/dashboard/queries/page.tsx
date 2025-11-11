"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2 } from "lucide-react"
import { useState } from "react"

export default function QueriesPage() {
  const [messages, setMessages] = useState<Array<{ id: string; role: "user" | "assistant"; content: string }>>([
    {
      id: "1",
      role: "assistant",
      content:
        "¡Hola! Soy tu asistente financiero IA. Puedo ayudarte a analizar tus gastos, responder preguntas sobre tus finanzas y proporcionar insights. ¿Qué necesitas saber?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content:
          "Esta es una respuesta placeholder. Cuando integres con OpenAI/Gemini, aquí aparecerá la respuesta de la IA.",
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold text-text">Consultas con IA</h1>
        <p className="text-text-secondary">Hazle preguntas a tu asistente financiero</p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-surface rounded-lg border border-border p-6 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-primary text-white rounded-br-none"
                    : "bg-background text-text border border-border rounded-bl-none"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-background text-text border border-border px-4 py-2 rounded-lg rounded-bl-none">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <Input
            placeholder="Hazme una pregunta..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading} size="icon">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
