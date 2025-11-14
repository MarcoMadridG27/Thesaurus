"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef } from "react"
import { Send, Loader2, MessageSquare, Sparkles } from "lucide-react"
import { createChatSession, type ChatContext } from "@/lib/api"
import { invoiceStore } from "@/lib/store"

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

interface WebSocketMessage {
  type: 'chunk' | 'done' | 'error' | 'system'
  content: string
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentResponseRef = useRef<string>('')

  // Auto-scroll al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [sessionId])

  // Conectar al WebSocket
  const connectWebSocket = async () => {
    try {
      setIsLoading(true)

      // Obtener contexto del store
      const stats = invoiceStore.getStats()
      const context: ChatContext = {
        total_spent: stats.totalSpent,
        total_invoices: stats.invoiceCount,
        total_suppliers: stats.supplierCount,
      }

      // Crear sesión
      const result = await createChatSession(context)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error al crear sesión')
      }

      setSessionId(result.data.session_id)

      // Conectar WebSocket
      const ws = new WebSocket(result.data.websocket_url)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('✅ WebSocket conectado')
        setIsConnected(true)
        setIsLoading(false)
      }

      ws.onmessage = (event) => {
        const msg: WebSocketMessage = JSON.parse(event.data)
        
        if (msg.type === 'system') {
          setMessages(prev => [...prev, {
            role: 'system',
            content: msg.content,
            timestamp: new Date(),
          }])
        } else if (msg.type === 'chunk') {
          // Acumular chunks
          currentResponseRef.current += msg.content
          
          // Actualizar mensaje en tiempo real
          setMessages(prev => {
            const lastMsg = prev.at(-1)
            if (lastMsg?.role === 'assistant') {
              return [...prev.slice(0, -1), {
                ...lastMsg,
                content: currentResponseRef.current,
              }]
            }
            return [...prev, {
              role: 'assistant',
              content: currentResponseRef.current,
              timestamp: new Date(),
            }]
          })
        } else if (msg.type === 'done') {
          // Finalizar respuesta
          currentResponseRef.current = ''
          setIsLoading(false)
        } else if (msg.type === 'error') {
          console.error('❌ Error del servidor:', msg.content)
          setMessages(prev => [...prev, {
            role: 'system',
            content: `Error: ${msg.content}`,
            timestamp: new Date(),
          }])
          setIsLoading(false)
        }
      }

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        setIsConnected(false)
        setIsLoading(false)
      }

      ws.onclose = () => {
        console.log('🔌 WebSocket desconectado')
        setIsConnected(false)
        setIsLoading(false)
      }

    } catch (error) {
      console.error('Error al conectar:', error)
      setIsLoading(false)
    }
  }

  // Enviar mensaje
  const sendMessage = () => {
    if (!input.trim() || !wsRef.current || !isConnected) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    currentResponseRef.current = ''

    // Enviar al WebSocket
    const stats = invoiceStore.getStats()
    wsRef.current.send(JSON.stringify({
      type: 'message',
      content: input,
      context: {
        total_spent: stats.totalSpent,
        total_invoices: stats.invoiceCount,
        total_suppliers: stats.supplierCount,
      },
    }))

    setInput('')
  }

  // Desconectar
  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsConnected(false)
    setSessionId(null)
    setMessages([])
  }

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Asistente IA</h3>
          {isConnected && (
            <span className="px-2 py-1 text-xs bg-green-500/10 text-green-600 dark:text-green-400 rounded-full">
              Conectado
            </span>
          )}
        </div>
        {isConnected ? (
          <Button size="sm" variant="outline" onClick={disconnect}>
            Desconectar
          </Button>
        ) : (
          <Button size="sm" onClick={connectWebSocket} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                Iniciar Chat
              </>
            )}
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isConnected && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Sparkles className="w-12 h-12 mb-4 text-primary/50" />
            <p className="text-sm">Inicia una conversación con el asistente IA</p>
            <p className="text-xs mt-2">Haz preguntas sobre tus facturas, gastos y proveedores</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          let msgClass = 'bg-muted text-foreground'
          if (msg.role === 'user') {
            msgClass = 'bg-primary text-primary-foreground'
          } else if (msg.role === 'system') {
            msgClass = 'bg-muted text-muted-foreground text-sm italic'
          }
          
          return (
            <div
              key={`${msg.role}-${msg.timestamp.getTime()}-${idx}`}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-lg px-4 py-2 ${msgClass}`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {msg.timestamp.toLocaleTimeString('es-PE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          )
        })}

        {isLoading && messages.at(-1)?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage()
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isConnected ? "Escribe tu mensaje..." : "Conecta primero para chatear"}
            disabled={!isConnected || isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!isConnected || isLoading || !input.trim()}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  )
}
